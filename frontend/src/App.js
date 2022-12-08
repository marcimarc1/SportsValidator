import React, {Component} from 'react';
import Header from "./components/layout/Header";
import Start from "./components/pages/Start";
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Demo from "./components/pages/Demo";
import FileOverview from "./components/pages/FileOverview/FileOverview";
import TrackingEditor from "./components/pages/trackingEditor/TrackingEditor";
import Analysis from "./components/pages/analysis/Analysis";

class App extends Component {

    render() {
        return (
            <Router>
            <div className="App">

                <Route exact path="/" >
                    <Header onStartPage={true}/>
                </Route>

                {/*using path instead of exact path so it works with trackingEditor/:id and analysis/:id */}
                <Route path="(/about|/feedback|/account|/demo|/games)" >
                    <Header/>
                </Route>

                <Route exact path="/about" >
                    <h1 color="red"> ABOUT </h1>
                </Route>

                <Route exact path="/" >
                    <Start/>
                </Route>

                <Route exact path="/demo" >
                    <Demo/>
                </Route>

                <Route exact path="/trackingEditor/:id" >
                    <Header/>
                    <TrackingEditor demo={false} startFrame={1}/>
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
