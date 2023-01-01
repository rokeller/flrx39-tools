import { HashRouter as Router, Link, Route, Routes } from 'react-router-dom';
import Clock from './components/Clock';
import Hash from './components/Hash';
import Home from './components/Home';
import Ipv4Addresses from './components/Ipv4Addresses';
import Ipv6Addresses from './components/Ipv6Addresses';
import Themes from './components/Themes';

function App() {
    return (
        <Router basename='/'>
            <div className='main-container'><div className='main'>
                <div className='row'>
                    <Link to='/'>flrx39 tools home</Link>
                    {' | '}
                    <Themes />
                </div>
                <div className='row'>
                    <Routes>
                        <Route path='' element={<Home />} />
                        <Route path='clock' element={<Clock />} />
                        <Route path='hash' element={<Hash />} />
                        <Route path='ipv4/addr' element={<Ipv4Addresses />} />
                        <Route path='ipv6/addr' element={<Ipv6Addresses />} />
                    </Routes>
                </div>
            </div></div>
        </Router>
    );
}

export default App;
