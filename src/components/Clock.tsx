import { useEffect, useState } from 'react';
import { formatNumber } from '../utils';

function Clock() {
    const [time, setTime] = useState('loading ...');

    useEffect(() => {
        setTime(getLocalTime());
        const interval = setInterval(() => setTime(getLocalTime()), 1000);
        return () => clearInterval(interval!);
    }, []);

    return <div className='clock'>{time}</div>;
}

function getLocalTime() {
    const timestamp = new Date();

    return formatNumber(timestamp.getHours(), 2) + ':' +
        formatNumber(timestamp.getMinutes(), 2) + ':' +
        formatNumber(timestamp.getSeconds(), 2);
}

export default Clock;
