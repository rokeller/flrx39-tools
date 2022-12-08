import { useState } from 'react';
import { formatNumber } from '../utils';

const ByteMask = BigInt(0xff);
const FullMask = (BigInt(1) << BigInt(32)) - BigInt(1);

class CidrBlock {
    public readonly start: Ipv4Address;
    public readonly mask: bigint;

    constructor(private readonly address: Ipv4Address, public readonly prefixLen: number) {
        this.mask = (BigInt(1) << BigInt(prefixLen)) - BigInt(1) << BigInt(32 - prefixLen);
        this.start = Ipv4Address.fromNumber(address.toNumber() & this.mask);
    }

    public toString() {
        return this.start.toString() + '/' + this.prefixLen;
    }

    public first() {
        return Ipv4Address.fromNumber(this.start.toNumber());
    }

    public last() {
        return Ipv4Address.fromNumber(FullMask - this.mask + this.start.toNumber());
    }

    public size() {
        return BigInt(1) << BigInt(32 - this.prefixLen);
    }
}

class Ipv4Address {
    constructor(private readonly octets: Uint8Array) {
    }

    public getCidrBlocks() {
        const result: CidrBlock[] = [];

        for (let i = 0; i < 32; i++) {
            result.push(new CidrBlock(this, 32 - i));
        }

        return result;
    }

    public toString() {
        return this.octets[0] + '.' + this.octets[1] + '.' + this.octets[2] + '.' + this.octets[3];
    }

    public toBinary() {
        let result = '';

        for (let i = 0; i < 4; i++) {
            if (i > 0) {
                result += ' ';
            }

            result += formatNumber(this.octets[i], 8, 2);
        }

        return result;
    }

    public toNumber() {
        return (BigInt(this.octets[0]) << BigInt(24)) |
            (BigInt(this.octets[1]) << BigInt(16)) |
            (BigInt(this.octets[2]) << BigInt(8)) |
            BigInt(this.octets[3]);
    }

    public static fromNumber(number: bigint): Ipv4Address {
        const octets = new Uint8Array(4);
        octets[0] = Number((number >> BigInt(24)) & ByteMask);
        octets[1] = Number((number >> BigInt(16)) & ByteMask);
        octets[2] = Number((number >> BigInt(8)) & ByteMask);
        octets[3] = Number(number & ByteMask);

        return new Ipv4Address(octets);
    }

    public static parse(address: string): Ipv4Address {
        const octets = new Uint8Array(4);
        const groups = address.split(/\./g);

        if (groups.length !== 4) {
            throw new Error('malformed ipv4 address');
        }

        for (let i = 0; i < 4; i++) {
            octets[i] = Number.parseInt(groups[i], 10);
        }

        return new Ipv4Address(octets);
    }
}

function Ipv4Addresses() {
    const [rawAddress, setRawAddress] = useState('127.0.0.1');
    const [address, setAddress] = useState(Ipv4Address.parse('127.0.0.1'));

    function setAndConvertFromRaw(rawAddress: string) {
        try {
            setRawAddress(rawAddress);
            setAddress(Ipv4Address.parse(rawAddress));
        } catch (e) { }
    }

    return <div>
        <h1>ipv4 address tools by flrx39</h1>
        <p>
            ipv4 address tools
        </p>
        <h2>analysis</h2>
        <div className='row'>
            <label>
                input address
                <input type='text' onChange={(event) => setAndConvertFromRaw(event.target.value)} value={rawAddress} />
            </label>
        </div>
        <div className='row'>
        </div>

        <div className='row sep-v'>
            cidr blocks containing this address
        </div>
        <div className='row'>
            <ul>
                {address.getCidrBlocks().map(block => <li key={block.prefixLen}>{block.toString()}{' '}
                ({block.first().toString()} - {block.last().toString()} / {block.size().toLocaleString()} address(es))</li>)}
            </ul>
        </div>

        <div className='row sep-v'>
            binary representation
        </div>
        <div className='row'>
            {address?.toBinary()}
        </div>

        {process.env.NODE_ENV === 'development' ?
            <div className='row'>
                <pre>
                    {JSON.stringify(address, null, 4)}
                </pre>
            </div> : <></>}
    </div>;
}

export default Ipv4Addresses;
