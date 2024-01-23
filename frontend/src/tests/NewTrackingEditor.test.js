import React from 'react';
import {fireEvent, getNodeText, screen, render, cleanup} from "@testing-library/react"
import { fabric } from 'fabric';
import '@testing-library/jest-dom/extend-expect'
import NewTrackingEditor from '../components/pages/newTrackingEditor/NewTrackingEditor'

afterEach(cleanup);

describe('add player button', () => {

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


});