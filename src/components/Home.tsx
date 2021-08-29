import { Link } from 'react-router-dom';

function Home() {
    return <div>
        <h1>tools by flrx39</h1>
        <ul>
            <li><Link to='clock'>clock</Link></li>
            <li><Link to='hash'>hash</Link></li>
        </ul>
    </div>
}

export default Home;
