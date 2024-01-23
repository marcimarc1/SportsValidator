import React from 'react';
import renderer from 'react-test-renderer';
import {render} from "@testing-library/react"
import { fabric } from 'fabric';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Header from "../components/layout/Header";
import NewTrackingEditor from '../components/pages/newTrackingEditor/NewTrackingEditor'


it('new player is displayed after added', () => {
    const {queryByLabelText, getByLabelText} = render(
        <NewTrackingEditor/>,
    );
});