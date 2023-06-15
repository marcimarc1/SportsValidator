import React, {Component} from 'react';
import Header from "./components/layout/Header";
import Start from "./components/pages/Start";
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Demo from "./components/pages/Demo";
import FileOverview from "./components/pages/fileOverview/FileOverview";
import TrackingEditor from "./components/pages/trackingEditor/TrackingEditor";
import Analysis from "./components/pages/analysis/Analysis";
import VideoSlider from './components/pages/framesExtractor/VideoSlider';
// import TrackingEditor from './components/pages/trackingEditor/TrackingEditor';

class App extends Component {

    render() {
        return (
            <Router>
            <div className="App">

                <Route exact path="/" >
                    <Header onStartPage={true}/>
                </Route>

                {/*using path instead of exact path so it works with trackingEditor/:id and analysis/:id */}
                <Route path="(/demo|/games)" >
                    <Header/>
                </Route>

                <Route exact path="(/about|/feedback|/account)" >
                    <Header shrinkAnimation={true} />
                </Route>

                <Route exact path="/about" >
                    <h1> About </h1>
                </Route>

                <Route exact path="/feedback" >
                    <h1> Feedback </h1>
                </Route>

                <Route exact path="/account" >
                    <h1> Account Information </h1>
                </Route>

                <Route exact path="/" >
                    <Start/>
                </Route>

                <Route exact path="/demo" >
                    <Demo/>
                </Route>

                <Route exact path="/trackingEditor/:id" >
                    <Header/>
                    <TrackingEditor/>
                </Route>

                <Route exact path="/analysis/:id" >
                    <Header/>
                    <Analysis/>
                </Route>

                <Route exact path="/games">
                    <FileOverview/>
                </Route>

            </div>
            </Router>
        );
    }
}

export default App;
