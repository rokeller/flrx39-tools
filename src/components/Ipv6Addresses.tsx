// https://en.wikipedia.org/wiki/IPv6_address

import { useEffect, useState } from 'react';
import { formatNumber } from '../utils';

const ByteMask = BigInt(0xff);

class Ipv6Address {
    constructor(private readonly octets: Uint8Array) {
    }

    public isUniqueLocalAddress() {
        return (this.octets[0] & 0xfe) === 0xfc;
    }
    public isLocallyAssigned() {
        return (this.octets[0] & 0x01) === 0x01;
    }
    public isLinkLocal() {
        return this.octets[0] === 0xfe && (this.octets[1] & 0xc0) === 0x80;
    }
    public isValidLinkLocalSubnet() {
        return this.octets[1] === 0x80 && this.isZeroes(2, 7);
    }
    public isMulticast() {
        return this.octets[0] === 0xff;
    }
    public isUnicastOrAnycast() {
        return !this.isMulticast();
    }
    public isLoopback() {
        return this.octets[15] === 1 && this.isZeroes(0, 14);
    }
    public isIpv4MappedAddress() {
        return this.octets[10] === 0xff && this.octets[11] === 0xff && this.isZeroes(0, 9);
    }
    public isIpv4TranslatedAddress() {
        return this.octets[8] === 0xff && this.octets[9] === 0xff && this.isZeroes(0, 7) && this.isZeroes(10, 11);
    }
    public getIpv4MappedAddress() {
        return this.octets[12] + '.' + this.octets[13] + '.' + this.octets[14] + '.' + this.octets[15];
    }
    public isTeredoTunneling() {
        return this.octets[0] === 0x20 && this.octets[1] === 0x01 && this.isZeroes(2, 3);
    }
    public isExample() {
        return this.octets[0] === 0x20 && this.octets[1] === 0x01 && this.octets[2] === 0x0d && this.octets[3] === 0xb8;
    }
    public is6to4() {
        return this.octets[0] === 0x20 && this.octets[1] === 0x02;
    }

    public getNetworkPrefix() {
        let result = '';

        for (let i = 0; i < 8; i += 2) {
            if (i > 0) {
                result += ':';
            }

            result += formatNumber((this.octets[i] << 8) | this.octets[i + 1], 4, 16);
        }

        return result;
    }

    public getInterfaceId() {
        let result = '';

        for (let i = 8; i < 16; i += 2) {
            if (i > 8) {
                result += ':';
            }

            result += formatNumber((this.octets[i] << 8) | this.octets[i + 1], 4, 16);
        }

        return result;
    }

    public toBinary(breakBytes?: number) {
        let result = [];
        let curLine = '';

        for (let i = 0; i < 16; i++) {
            if (breakBytes !== undefined && i > 0 && i % breakBytes === 0) {
                result.push(curLine);
                curLine = '';
            }

            if (i > 0 && curLine !== '') {
                curLine += ' ';
            }

            curLine += formatNumber(this.octets[i], 8, 2);
        }

        result.push(curLine);

        return result;
    }

    public toFull() {
        let result = '';

        for (let i = 0; i < 16; i += 2) {
            if (i > 0) {
                result += ':';
            }

            result += formatNumber((this.octets[i] << 8) | this.octets[i + 1], 4, 16);
        }

        return result;
    }

    public isZeroes(from: number, to: number) {
        for (let i = from; i <= to; i++) {
            if (this.octets[i] !== 0) {
                return false;
            }
        }

        return true;
    }

    public toNumber() {
        let result = BigInt(0);

        for (let i = 0, leftShift = 120; i < 16; i++, leftShift -= 8) {
            result |= BigInt(this.octets[i]) << BigInt(leftShift);
        }

        return result;
    }

    public static parse(address: string): Ipv6Address {
        const octets = new Uint8Array(16);
        const groups = address.split(/:/g);
        let offset = 0;

        if (groups[0] === '') {
            groups.shift();
        }

        groups.forEach((group) => {
            // TODO: check if last group is 'x.x.x.x'
            if (group === '') {
                const spanLen = 8 - groups.length + 1;
                for (let i = 0; i < spanLen; i++) {
                    octets[offset + (i * 2)] = octets[offset + (i * 2) + 1] = 0;
                }
                offset += (spanLen - 1) * 2;
            }
            else {
                const groupVal = Number.parseInt(group, 16);
                octets[offset] = (groupVal & 0xff00) >> 8;
                octets[offset + 1] = (groupVal & 0xff);
            }

            offset += 2;
        });

        return new Ipv6Address(octets);
    }

    public static fromNumber(number: bigint): Ipv6Address {
        const octets = new Uint8Array(16);
        for (let i = 0, leftShift = 120; i < 16; i++, leftShift -= 8) {
            octets[i] = Number((number >> BigInt(leftShift)) & ByteMask);
        }

        return new Ipv6Address(octets);
    }
}

class GlobalId {
    constructor(private readonly octets: Uint8Array) {
    }

    public toString() {
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += formatNumber(this.octets[i], 2, 16);
        }
        return result;
    }

    public bytes() {
        return Array.from(this.octets).slice(0, 5);
    }

    public static generate(): GlobalId {
        const globalId = new Uint8Array(5);
        return new GlobalId(crypto.getRandomValues(globalId));
    }
}

class SubnetId {
    public static readonly Default = new SubnetId(new Uint8Array([0, 0]));

    constructor(private readonly octets: Uint8Array) {
    }

    public toString() {
        let result = '';

        for (let i = 0; i < 2; i++) {
            result += formatNumber(this.octets[i], 2, 16);
        }

        return result;
    }

    public bytes() {
        return Array.from(this.octets).slice(0, 2);
    }

    public static parse(subnetId: string): SubnetId {
        const octets = new Uint8Array(2);
        const fullVal = Number.parseInt(subnetId, 16);

        octets[0] = (fullVal & 0xff00) >> 8;
        octets[1] = (fullVal & 0xff);

        return new SubnetId(octets);
    }
}

class Ipv6CidrBlock {
    public readonly start: Ipv6Address;
    public readonly mask: bigint;

    constructor(address: Ipv6Address, public readonly prefixLen: number) {
        this.mask = (BigInt(1) << BigInt(prefixLen)) - BigInt(1) << BigInt(128 - prefixLen);
        this.start = Ipv6Address.fromNumber(address.toNumber() & this.mask);
    }

    public toString() {
        return this.start.toFull() + '/' + this.prefixLen;
    }
}

function Ipv6Addresses() {
    const [rawAddress, setRawAddress] = useState(':1');
    const [address, setAddress] = useState(Ipv6Address.parse('::1'));
    const [globalId, setGlobalId] = useState(GlobalId.generate());
    const [subnetId, setSubnetId] = useState(SubnetId.Default);
    const [prefixLen, setPrefixLen] = useState(48);
    const [ula, setULA] = useState<Ipv6CidrBlock>();

    function setAndConvertFromRaw(rawAddress: string) {
        setRawAddress(rawAddress);
        setAddress(Ipv6Address.parse(rawAddress));
    }

    useEffect(() => {
        const baseAddr = new Ipv6Address(new Uint8Array([0xfd, ...globalId.bytes(), ...subnetId.bytes(), 0, 0, 0, 0, 0, 0, 0, 0]));
        setULA(new Ipv6CidrBlock(baseAddr, prefixLen));
    }, [globalId, subnetId, prefixLen]);

    return <div>
        <h1>ipv6 address tools by flrx39</h1>
        <p>
            ipv6 address tools
        </p>
        <h2>analysis</h2>
        <div>
            <div className='row'>
                <label>
                    input address
                    <input type='text' onChange={(event) => setAndConvertFromRaw(event.target.value)} value={rawAddress} />
                </label>
            </div>
            <div className='row'>
                <ul>
                    {address?.isMulticast() ? <li>multicast</li> : <></>}
                    {address?.isUnicastOrAnycast() ? <>
                        <li>unicast or anycast</li>
                        {address?.isLoopback() ? <li>loopback (aka localhost)</li> : <></>}
                        {address?.isIpv4MappedAddress() ?
                            <li>ipv4 mapped address ({address.getIpv4MappedAddress()})</li> : <></>}
                        {address?.isIpv4TranslatedAddress() ?
                            <li>ipv4 translated address ({address.getIpv4MappedAddress()})</li> : <></>}
                        {address?.isTeredoTunneling() ? <li>teredo tunneling</li> : <></>}
                        {address?.is6to4() ? <li>6-to-4 addressing (deprecated)</li> : <></>}
                        {address?.isExample() ? <li>documentation / example address</li> : <></>}

                        {address?.isUniqueLocalAddress() ?
                            <>
                                <li>unique local address</li>
                                {address?.isLocallyAssigned() ? <li>locally assigned</li> : <li>globally assigned</li>}
                            </> :
                            <></>}

                        {address?.isLinkLocal() ?
                            <li>link-local ({address.isValidLinkLocalSubnet() ? 'valid' : 'invalid'} subnet)</li> : <></>}
                    </> : <></>}
                </ul>
            </div>

            {address?.isUnicastOrAnycast() ? <>
                <div className='row sep-v'>
                    network prefix
                </div>
                <div className='row'>
                    {address?.getNetworkPrefix()}
                </div>
                <div className='row'>
                    interface id
                </div>
                <div className='row'>
                    {address?.getInterfaceId()}
                </div>
            </> : <></>}

            <div className='row sep-v'>
                full representation
            </div>
            <div className='row'>
                {address?.toFull()}
            </div>

            <div className='row sep-v'>
                binary representation
            </div>
            <div className='row'>
                {address?.toBinary(8).map((line) => <div>{line}</div>)}
            </div>

            {process.env.NODE_ENV === 'development' ?
                <div className='row'>
                    <pre>
                        {JSON.stringify(address, null, 4)}
                    </pre>
                </div> : <></>}
        </div>
        <h2>unique local addresses / private addresses</h2>
        <div>
            <div className='row text'>
                use this section to generate a random network for unique local addresses. these are similar to private
                networks in ipv4, but they must use a random part (the <em>global id</em>, bits 8 to 47). you are however
                free to choose the <em>subnet id</em> (the least significant 16 bits of the network prefix).
            </div>
            <div className='row sep-v flex-container flex-spread'>
                <div className='flex-item-grow-1'>
                    <label>
                        global id (hex, 5 bytes)
                        <input type='text' readOnly value={globalId.toString()} />
                    </label>
                    <button onClick={() => setGlobalId(GlobalId.generate())}>generate new</button>
                </div>
                <div className='flex-item-grow-1'>
                    <label>
                        subnet id (hex, 2 bytes)
                        <input type='text' onChange={(event) => setSubnetId(SubnetId.parse(event.target.value))} value={subnetId.toString()} />
                    </label>
                </div>
                <div className='flex-item-grow-1'>
                    <label>
                        prefix length
                        <input type='number' onChange={(event) => setPrefixLen(Number(event.target.value))} value={prefixLen}
                            min={8} max={64} />
                    </label>
                </div>
            </div>

            <div className='row sep-v'>
                resulting cidr
            </div>
            <div className='row'>
                {ula?.toString()}
            </div>
        </div>
    </div>;
}

export default Ipv6Addresses;
