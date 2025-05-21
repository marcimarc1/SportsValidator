// canvasUtils.js

import { fabric } from "fabric";

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

export const deleteEntity = (
  canvas,
  playerBox,
  annotations,
  setAnnotations,
  setNewAnnotations,
  setUpdateAnnotations,
  setDeleteAnnotations,
  setCanvasBoxes,
  refreshSidebar,
) => {
  canvas.setActiveObject(playerBox);
  playerBox.my.selected = false;
  // Reset the selection
  let ids = annotations.filter(a => a.displayName === playerBox.my.key).map(a => a.id??null);

  if(ids.length > 0){
    setDeleteAnnotations((prevDeleteAnnotations) => [...prevDeleteAnnotations, ...ids]);
    setAnnotations((prevAnnotations) =>
        prevAnnotations.filter((a) => a.displayName !== playerBox.my.key),
    );
    setNewAnnotations((prevAnnotations) =>
        prevAnnotations.filter((a) => a.displayName !== playerBox.my.key),
    );
    setUpdateAnnotations((prevAnnotations) =>
        prevAnnotations.filter((a) => a.displayName !== playerBox.my.key),
    );
  }

  setCanvasBoxes((prevBoxes) =>
    prevBoxes.filter((a) => a.my.key !== playerBox.my.key),
  );


  refreshSidebar();
  canvas.discardActiveObject();
  canvas.remove(playerBox);
  canvas.requestRenderAll();
};


export const setName = (
    canvas,
    playerBox,
    newName,
    annotations,
    setAnnotations,
    alteredAnnotations,
    setAlteredAnnotations) => {
  fabric.Object.prototype.objectCaching = false;
  let oldName = playerBox.my.key;
  debugger;
  //update Annotations
  const updates= []
  annotations.map((a) => {
    if (a.displayName === oldName) {
      a = {...a, displayName: newName};
      updates.push(a);
      return a;
    }
    return a;
  })
  //update Updates
  alteredAnnotations.map((a) => {
    if (a.displayName === oldName) {
      a = {...a, displayName: newName};
      return a;
    }
    return a;
  })
  setAnnotations(annotations);
  setAlteredAnnotations([...alteredAnnotations, ...updates]);
  canvas.requestRenderAll();
};
