import React from 'react';
import renderer from 'react-test-renderer';
import { fabric } from 'fabric';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Header from "../components/layout/Header";
import NewTrackingEditor from '../components/pages/newTrackingEditor/NewTrackingEditor'


it('new player is displayed after added', () => {
    const editor = renderer.create(  
        <Router>         
            <Route exact path="/newTrackingEditor/:videoName" >
                <Header/>
                <NewTrackingEditor/>
            </Route>
        </Router>);
    let tree = editor.toJSON();
    expect(tree).toMatchSnapshot();
});