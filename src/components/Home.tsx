import { Link } from 'react-router-dom';

function Home() {
    return <div>
        <h1>tools by flrx39</h1>
        <ul>
            <li><Link to='clock'>clock</Link></li>
            <li><Link to='hash'>hash</Link></li>
            <li><Link to='ipv4/addr'>ipv4 addresses</Link></li>
            <li><Link to='ipv6/addr'>ipv6 addresses</Link></li>
            <li><Link to='pretty-print-json'>pretty print json </Link></li>
        </ul>
    </div>
}

export default Home;
