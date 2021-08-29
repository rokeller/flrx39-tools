import { HashRouter as Router, Link, Route, Switch } from 'react-router-dom';
import Clock from './components/Clock';
import Hash from './components/Hash';
import Home from './components/Home';
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
                        <Route path='/' component={Home}></Route>
                    </Switch>
                </div>
            </div></div>
        </Router>
    );
}

export default App;
