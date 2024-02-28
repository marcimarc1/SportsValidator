import React from 'react';
import {fireEvent, getNodeText, screen, render, cleanup} from "@testing-library/react"
import { fabric } from 'fabric';
import Router from 'react-router';
import '@testing-library/jest-dom/extend-expect'
import NewTrackingEditor from '../components/pages/newTrackingEditor/NewTrackingEditor'

afterEach(cleanup);

//create mock for react-router, in order to mock useParams()
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useParams: jest.fn(),
}));

describe('add player button', () => {

    //mock useParams()
    jest.spyOn(Router, 'useParams').mockReturnValue({videoName: 'mockVideo'});

    it('increases number of players by 1', () => {
        render(<NewTrackingEditor/>);
    
        //given
        const number = screen.getByTestId('player-number');
        const button = screen.getByTestId('add-player-button');
        const initialText = getNodeText(number);
        expect(initialText).toEqual("player number: 0");
    
        //when
        fireEvent.click(button);
    
        //then
        const updatedText = getNodeText(number);
        expect(updatedText).toEqual("player number: 1");
    });

    it('creates a bounding box in the canvas', () => {
        render(<NewTrackingEditor/>);
        const button = screen.getByTestId('add-player-button');
        fireEvent.click(button);
        const canvasElement = screen.getByTestId('fabric-canvas');
        const canvas = new fabric.Canvas(canvasElement);
        console.log(canvas);
    });
});

describe('sidebar of player list', () => {
    it('displays all players in current frame', () => {

    });
});