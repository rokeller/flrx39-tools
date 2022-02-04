import { HashRouter as Router, Link, Route, Switch } from 'react-router-dom';
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
                    <Switch>
                        <Route path='/clock' component={Clock}></Route>
                        <Route path='/hash' component={Hash}></Route>
                        <Route path='/ipv4/addr' component={Ipv4Addresses}></Route>
                        <Route path='/ipv6/addr' component={Ipv6Addresses}></Route>
                        <Route path='/' component={Home}></Route>
                    </Switch>
                </div>
            </div></div>
        </Router>
    );
}

export default App;
