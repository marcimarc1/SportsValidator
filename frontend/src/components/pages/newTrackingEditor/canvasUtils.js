// canvasUtils.js

import { fabric } from 'fabric';
import {useEffect, useState} from "react";

export const blink = (canvas, playerBox, setActiveObject) => {
    canvas.discardActiveObject();
    canvas.setActiveObject(playerBox);
    setActiveObject(playerBox);
    playerBox.my.selected = true;
    let originalStrokeColor = playerBox.stroke;
    let originalFillColor = playerBox.fill;
    let repeats = 3;
    let time = 0;
    let interval = 400;
    let blinkColor = "rgb(255, 255, 255, 0.6)";

    if (originalStrokeColor !== blinkColor) {
        // Necessary because otherwise bBox could permanently be set to blinkColor
        for (let i = repeats; i > 0; i--) {
            setTimeout(() => {
                playerBox.set({
                    fill: blinkColor,
                    stroke: blinkColor,
                });
                playerBox.setCoords();
                canvas.renderAll();
            }, time);

            time += interval;
            setTimeout(() => {
                playerBox.set({
                    fill: originalFillColor,
                    stroke: originalStrokeColor,
                });
                playerBox.setCoords();
                canvas.renderAll();
            }, time);
            time += interval;
        }
    }
    playerBox.set({
        fill: originalFillColor,
        stroke: originalStrokeColor,
    });
    playerBox.setCoords();
    canvas.discardActiveObject();
};

export const deletePlayer = (canvas, playerBox, setAnnotations, setCanvasBoxes, playerNameMap, setPlayerNameMap, refreshSidebar) => {
    canvas.setActiveObject(playerBox);
    playerBox.my.selected = false; // Reset the selection
    setAnnotations(prevAnnotations => prevAnnotations.filter((a) => a.PlayerKey !== playerBox.my.key));
    setCanvasBoxes(prevBoxes => prevBoxes.filter((a) => a.my.key !== playerBox.my.key));

    let newPlayerNameMap = new Map(playerNameMap);
    newPlayerNameMap.delete(playerBox.my.key);
    setPlayerNameMap(newPlayerNameMap);

    refreshSidebar();
    canvas.discardActiveObject();
    canvas.remove(playerBox);
    canvas.requestRenderAll();
};

export const deleteBall = (canvas, ballBox, setAnnotationBallTracks, setCanvasBoxesBall, ballNameMap, setBallNameMap, refreshSidebar) => {
    canvas.setActiveObject(ballBox);
    ballBox.my.selected = false; // Reset the selection
    setAnnotationBallTracks(prevTracks => prevTracks.filter((a) => a.trackNo !== ballBox.my.key));
    setCanvasBoxesBall(prevBoxes => prevBoxes.filter((a) => a.my.key !== ballBox.my.key));

    let newBallNameMap = new Map(ballNameMap);
    newBallNameMap.delete(ballBox.my.key);
    setBallNameMap(newBallNameMap);

    refreshSidebar();
    canvas.discardActiveObject();
    canvas.remove(ballBox);
    canvas.requestRenderAll();
};

export const setName = (canvas, playerBox, name, playerNameMap) => {
    fabric.Object.prototype.objectCaching = false;
    let playerIndex = playerBox.my.key;
    playerNameMap.set(playerIndex, name);
    canvas.requestRenderAll();
};

export const setNameBall = (canvas, ballBox, name, ballNameMap) => {
    fabric.Object.prototype.objectCaching = false;
    let ballIndex = ballBox.my.key;
    ballNameMap.set(ballIndex, name);
    canvas.requestRenderAll();
};