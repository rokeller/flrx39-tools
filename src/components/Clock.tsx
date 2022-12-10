import { useEffect, useState } from 'react';
import { formatNumber } from '../utils';

function Clock() {
    const [localTime, setLocalTime] = useState('loading ...');
    const [utcTime, setUtcTime] = useState('loading ...');

    function updateTimes() {
        setLocalTime(getLocalTime());
        setUtcTime(getUtcTime());
    }

    useEffect(() => {
        updateTimes();
        const interval = setInterval(updateTimes, 499);
        return () => clearInterval(interval!);
    }, []);

    return <>
        <div className='row sep-v'>utc time</div>
        <div className='clock'>{utcTime}</div>
        <div className='row sep-v'>local time</div>
        <div className='clock'>{localTime}</div>
    </>;
}

function getLocalTime() {
    const timestamp = new Date();

    return formatNumber(timestamp.getHours(), 2) + ':' +
        formatNumber(timestamp.getMinutes(), 2) + ':' +
        formatNumber(timestamp.getSeconds(), 2);
}

function getUtcTime() {
    const timestamp = new Date();

    return formatNumber(timestamp.getUTCHours(), 2) + ':' +
        formatNumber(timestamp.getUTCMinutes(), 2) + ':' +
        formatNumber(timestamp.getUTCSeconds(), 2);
}

export default Clock;
