import React from 'react';
import {fireEvent, getNodeText, screen, render, cleanup, waitFor} from "@testing-library/react"
import { fabric } from 'fabric';
import Router from 'react-router';
import '@testing-library/jest-dom/extend-expect'
import fetchMock from 'jest-fetch-mock';
import NewTrackingEditor from '../components/pages/newTrackingEditor/NewTrackingEditor'

beforeEach(() => {
    fetchMock.resetMocks();
})
afterEach(cleanup);

//mock useParams()
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useParams: jest.fn(),
}));
jest.spyOn(Router, 'useParams').mockReturnValue({videoName: 'mockVideo'});


describe('data fetching', () => {

    it('receives correct annotation', async () => {

        //given
        const logSpy = jest.spyOn(global.console, 'log');
        const mockFile = new File(['mock video'], 'video.mp4', { type: 'video/mp4' });
        const mockAnnotation = {
            FrameNo: 10,
            PlayerKey: 1,
            h: 100,
            w: 100,
            x: 500,
            x1: 0,
            x2: 0,
            x_trans: 0,
            y: 100,
            y1: 0,
            y2: 0,
            y_trans: 0,
        };
        fetchMock.mockResponse(JSON.stringify([mockAnnotation]));
        render(<NewTrackingEditor/>);

        //when
        fireEvent.change(screen.getByTestId('video-upload'), { target: { files: [mockFile] } });

        //then
        await waitFor(() => {
            expect(logSpy).toHaveBeenCalledWith("Unique annotations : ", [mockAnnotation]);
        });
    });
});

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

describe('player sidebar', () => {
    it('displays all players in current frame', async ()  => {

        //given
        const mockFile = new File(['mock video'], 'video.mp4', { type: 'video/mp4' });
        //should draw: mockAnnotation1 and 2
        //should ignore: mockAnnotation3
        const mockAnnotation1 = {
            FrameNo: 0,
            PlayerKey: 1,
            h: 100,
            w: 100,
            x: 500,
            x1: 0,
            x2: 0,
            x_trans: 0,
            y: 100,
            y1: 0,
            y2: 0,
            y_trans: 0,
        };
        const mockAnnotation2 = {
            FrameNo: 0,
            PlayerKey: 2,
            h: 200,
            w: 50,
            x: 500,
            x1: 0,
            x2: 0,
            x_trans: 0,
            y: 500,
            y1: 0,
            y2: 0,
            y_trans: 0,
        };
        const mockAnnotation3 = {
            FrameNo: 1,
            PlayerKey: 2,
            h: 200,
            w: 50,
            x: 500,
            x1: 0,
            x2: 0,
            x_trans: 0,
            y: 500,
            y1: 0,
            y2: 0,
            y_trans: 0,
        };
        fetchMock.mockResponse(JSON.stringify([mockAnnotation1, mockAnnotation2, mockAnnotation3]));
        const {container} = render(<NewTrackingEditor/>);
        const button = screen.getByTestId('from-annotation');

        //when
        fireEvent.change(screen.getByTestId('video-upload'), { target: { files: [mockFile] } });
        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalled();
        });
        fireEvent.click(button);

        //then
        //as the sidebar contains 3 lists(player, team, ball), the playerList is chosen.
        const playerList = container.querySelector('.TrackListList').children[0];
        expect(playerList.childElementCount).toEqual(2);
        expect(getNodeText(playerList.children[0].querySelector('.TrackListItemName'))).toEqual("player1");
        expect(getNodeText(playerList.children[1].querySelector('.TrackListItemName'))).toEqual("player2");
    });
});