import React from 'react';
import {fireEvent, getNodeText, screen, render, cleanup, waitFor} from "@testing-library/react"
import { fabric } from 'fabric';
import Router from 'react-router';
import '@testing-library/jest-dom/extend-expect'
import NewTrackingEditor from '../components/pages/newTrackingEditor/NewTrackingEditor'

afterEach(cleanup);

//mock react-router, in order to mock useParams()
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useParams: jest.fn(),
}));

//mock useParams()
jest.spyOn(Router, 'useParams').mockReturnValue({videoName: 'mockVideo'});


describe('add player button', () => {

    it('increases number of players by 1', () => {
        render(<NewTrackingEditor/>);
    
        //given
        const canvasElement = screen.getByTestId('fabric-canvas');
        const button = screen.getByTestId('add-player-button');
        const initialNumber = canvasElement.getAttribute('annotations');
        expect(initialNumber).toEqual("0");
    
        //when
        fireEvent.click(button);
    
        //then
        const updatedNumber = canvasElement.getAttribute('annotations');
        expect(updatedNumber).toEqual("1");
    });

    it('creates a bounding box in the canvas', async () => {
        render(<NewTrackingEditor/>);

        //given
        const button = screen.getByTestId('add-player-button');
        const canvasElement = screen.getByTestId('fabric-canvas');
        var JSONCanvas = canvasElement.getAttribute('canvas');
        const initialCanvas = new fabric.Canvas('canvas');
        //retrieve serialized fabric canvas
        initialCanvas.loadFromJSON(JSONCanvas, initialCanvas.renderAll.bind(initialCanvas));

        //when
        fireEvent.click(button);

        //then
        JSONCanvas = canvasElement.getAttribute('canvas');
        const updatedCanvas = new fabric.Canvas('canvas');
        //retrieve serialized fabric canvas
        updatedCanvas.loadFromJSON(JSONCanvas, updatedCanvas.renderAll.bind(updatedCanvas));
        expect(initialCanvas.getObjects().length).toEqual(0);
        expect(updatedCanvas.getObjects().length).toEqual(1);
    });
});

describe('sidebar of player list', () => {
    it('displays all players in current frame', () => {

    });
});