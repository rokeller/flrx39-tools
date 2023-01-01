import { useState } from 'react';
import { Buffer } from 'buffer';

type InputEncoding = 'utf8' | 'hex' | 'base64';

enum HashAlg {
    SHA1,
    SHA256,
    SHA384,
    SHA512,
}

interface HashState {
    alg: HashAlg;
    useHmac: boolean;
    hmacKey?: string;
    hmacKeyEncoding: InputEncoding;
}

interface InputState {
    text: string;
    encoding: InputEncoding;
    replaceCrLfWithLf: boolean;
}

interface OutputState {
    raw: ArrayBuffer;
}

const defaultHashState: HashState = {
    alg: HashAlg.SHA256,
    useHmac: false,
    hmacKeyEncoding: 'utf8',
};

const defaultInputState: InputState = {
    text: 'hello world',
    encoding: 'utf8',
    replaceCrLfWithLf: false,
}

const defaultOutputState: OutputState = {
    raw: new Uint8Array(),
}

function getHashAlgoName(alg: HashAlg) {
    switch (alg) {
        case HashAlg.SHA1:
            return 'SHA-1';
        case HashAlg.SHA256:
            return 'SHA-256';
        case HashAlg.SHA384:
            return 'SHA-384';
        case HashAlg.SHA512:
            return 'SHA-512';
    }

    throw new Error('Unsupported hash algorithm.');
}

function getFilteredInput(input: InputState) {
    if (input.encoding !== 'utf8') {
        return input.text.replace(/\s+/g, '');
    } else if (input.replaceCrLfWithLf) {
        return input.text.replace(/\r\n/g, '\n');
    } else {
        return input.text;
    }
}

interface EncodingSelectorProps {
    value: InputEncoding;
    disabled?: boolean;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

function EncodingSelector(props: EncodingSelectorProps) {
    return <select value={props.value} onChange={props.onChange} disabled={props.disabled}>
        <option value='utf8'>utf-8 (plain text)</option>
        <option value='hex'>hex</option>
        <option value='base64'>base64</option>
    </select>
}

function Hash() {
    const [hash, setHash] = useState(defaultHashState);
    const [input, setInput] = useState(defaultInputState);
    const [output, setOutput] = useState(defaultOutputState);

    function canCalculate() {
        return !!(!hash.useHmac || hash.hmacKey);
    }

    async function calculateAsync() {
        const hashAlgName = getHashAlgoName(hash.alg);
        const inputText = getFilteredInput(input);
        let raw: ArrayBuffer;

        try {
            if (hash.useHmac) {
                const key = await crypto.subtle.importKey(
                    'raw',
                    Buffer.from(hash.hmacKey!, hash.hmacKeyEncoding),
                    {
                        name: 'HMAC',
                        hash: hashAlgName,
                    },
                    false, ['sign']);

                raw = await crypto.subtle.sign('HMAC', key, Buffer.from(inputText, input.encoding));
            } else {
                raw = await crypto.subtle.digest(hashAlgName, Buffer.from(inputText, input.encoding));
            }

            setOutput({ raw });
        } catch (ex) {
            alert('failed to calculate hash:\n\n' + ex);
        }
    }

    return <div>
        <h1>hash tool by flrx39</h1>
        <p>
            quickly evaluate hashes in the browser. no data is sent to servers, all data remains in your browser!
        </p>
        <h2>hash</h2>
        <div className='row'>
            <select value={HashAlg[hash.alg]}
                onChange={(event) => setHash({ ...hash, alg: HashAlg[event.target.value as keyof typeof HashAlg] })}>
                <option value={HashAlg[HashAlg.SHA1]}>SHA-1</option>
                <option value={HashAlg[HashAlg.SHA256]}>SHA-256</option>
                <option value={HashAlg[HashAlg.SHA384]}>SHA-384</option>
                <option value={HashAlg[HashAlg.SHA512]}>SHA-512</option>
            </select>
            <label>
                <input type='checkbox' checked={hash.useHmac}
                    onChange={(event) => setHash({ ...hash, useHmac: event.target.checked })} />
                use HMAC?
            </label>
        </div>
        <div className='row'>
            <label>
                HMAC key
                <input type='text' disabled={!hash.useHmac} value={hash.hmacKey}
                    onChange={(event) => setHash({ ...hash, hmacKey: event.target.value })} />
                <EncodingSelector value={hash.hmacKeyEncoding} disabled={!hash.useHmac}
                    onChange={(event) => setHash({ ...hash, hmacKeyEncoding: event.target.value as InputEncoding })} />
            </label>
        </div>
        <h2>input</h2>
        <div className='row'>
            <label>
                input
                <textarea value={input.text}
                    onChange={(event) => setInput({ ...input, text: event.target.value })} />
                <EncodingSelector value={input.encoding}
                    onChange={(event) => setInput({ ...input, encoding: event.target.value as InputEncoding })} />
            </label>
        </div>
        <div className='row'>
            <label>
                <input type='checkbox' checked={input.replaceCrLfWithLf} disabled={input.encoding !== 'utf8'}
                    onChange={(event) => setInput({ ...input, replaceCrLfWithLf: event.target.checked })} />
                replace \r\n with \n ?
            </label>
        </div>
        <div className='row sep-v'>
            <button onClick={() => calculateAsync()} disabled={!canCalculate()}>calculate</button>
        </div>
        <h2>output</h2>
        <div className='row'>
            length: {output.raw.byteLength} bytes
        </div>
        <div className='row'>
            <label>
                hex
                <input type='text' readOnly value={Buffer.from(output.raw).toString('hex')} />
            </label>
        </div>
        <div className='row'>
            <label>
                HEX
                <input type='text' readOnly value={Buffer.from(output.raw).toString('hex').toUpperCase()} />
            </label>
        </div>
        <div className='row'>
            <label>
                base64
                <input type='text' readOnly value={Buffer.from(output.raw).toString('base64')} />
            </label>
        </div>

        {process.env.NODE_ENV === 'development' ?
            <>
                <h2>debug</h2>
                <h3>hash</h3>
                <pre>{JSON.stringify(hash, null, 4)}</pre>
                <h3>input</h3>
                <pre>{JSON.stringify(input, null, 4)}</pre>
            </>
            : <></>
        }
    </div>;
}

export default Hash;
