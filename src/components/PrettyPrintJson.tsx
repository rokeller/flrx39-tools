import { useEffect, useRef, useState } from 'react';

function pretty(item: any, level: number) {
    if (item === null) {
        return '<span class="keyword">null</span>';
    } else if (Array.isArray(item)) {
        if (item.length === 0) {
            return '[]';
        }

        const result: string = item.map((val) => {
            return indent(level + 1) + pretty(val, level + 1);
        }).join(',\n');

        return '[\n' + result + '\n' + indent(level) + ']';
    } else if (typeof item === 'object') {
        const result: string = Object.keys(item).map((key) => {
            return indent(level + 1) +
                '<span class="property">' + JSON.stringify(key) + '</span>: ' +
                pretty(item[key], level + 1);
        }).join(',\n');

        return '{\n' + result + '\n' + indent(level) + '}';
    } else if (typeof item === 'string') {
        return '<span class="string">' + JSON.stringify(item) + '</span>';
    } else if (typeof item === 'boolean') {
        return '<span class="keyword">' + JSON.stringify(item) + '</span>';
    } else if (typeof item === 'number') {
        return '<span class="number">' + JSON.stringify(item) + '</span>';
    }

    return JSON.stringify(item);
}

function indent(level: number) {
    if (level <= 0) {
        return '';
    } else {
        return repeat(' ', level * 4);
    }
}

function repeat(text: string, times: number) {
    return Array(times).fill(text).join('');
}

function PrettyPrintJson() {
    const refInOut = useRef<HTMLDivElement>(null);
    const [count, setCount] = useState(0);
    const [removeNonAscii, setRemoveNonAscii] = useState(true);
    const [output, setOutput] = useState<string>('{ "enter": "some json here", "array": [ "with", 123, true, null ] }');
    const [exception, setException] = useState<any>(null);
    const [explanation, setExplanation] = useState<string | null>(null);

    function prettyPrint(text: string | undefined) {
        setCount(count + 1);
        if (text === undefined) {
            return '<span class="keyword">undefined</span>';
        }

        if (removeNonAscii) {
            text = text.replace(/[^ -~\r\n\t]/g, '');
        }

        try {
            const data = JSON.parse(text);
            setOutput(pretty(data, 0));
            setException(null);
        }
        catch (ex: any) {
            setOutput('<pre>' + text + '</pre>');
            const exStr = ex.toString();
            setException(exStr);

            const match = /(\d+)$/.exec(exStr);
            const pos = match !== null ? Number(match[1]) : -1;
            if (pos > 0) {
                const lines = [text.replace(/[\r\n\t]/gi, ' ')];
                lines.push(repeat(' ', pos) + '^');
                if (pos > 5) {
                    lines.push('here ' + repeat('─', pos - 5) + '┘');
                } else {
                    lines.push(repeat(' ', pos) + '└── here');
                }

                setExplanation(lines.join('\r\n'));
            } else {
                setExplanation(null);
            }
        }
    }

    useEffect(() => {
        if (refInOut.current) {
            refInOut.current.innerHTML = output;
        }

    }, [output, count]);

    return <>
        <div className='row text sep-v'>
            are you tired of json pretty printer tools which post <em>your</em> json
            back to some sketchy server to pretty print? look no further. it's here.
            <strong>
                enter the json in the text field below and click on{' '}
                <em>pretty please</em>.
            </strong>
            your json data is not sent anywhere -- check for yourself.
        </div>
        <div className='row sep-v'>
            <div contentEditable='true' id='json' spellCheck='false' ref={refInOut}>
            </div>
        </div>
        <div className='row sep-v'>
            <button onClick={() => prettyPrint(refInOut.current?.innerText)}>pretty please!</button>
            {' '}
            <label>
                <input type='checkbox' checked={removeNonAscii} onChange={(evt) => {
                    setRemoveNonAscii(evt.target.checked)
                }} /> remove non-ascii characters first?
            </label>
        </div>
        {exception !== null ?
            <div className='row sep-v'>
                {exception}
                <div className='row text overflow-x-scroll'>
                    {explanation !== null ?
                        <pre>{explanation}</pre>
                        : 'no explanation available'}
                </div>
            </div>
            : ''}
    </>;
}

export default PrettyPrintJson;
