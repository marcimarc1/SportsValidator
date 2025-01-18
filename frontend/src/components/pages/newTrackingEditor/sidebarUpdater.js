// sidebarUpdater.js

import React from "react";
import TrackListItemPlayer from "./TrackListItemPlayer";
import TrackListItemBall from "./TrackListItemBall";

export function updateSidebar({
  canvasBoxes,
  canvasBoxesBall,
  colorSet,
  colorSetBall,
  getCurrentTimestampFrame,
  playerNameMap,
  ballNameMap,
  changeSelection,
  setName,
  setNameBall,
  blink,
  deletePlayer,
  deleteBall,
  handleModalOpen,
  handleModalBallOpen,
  setPlayerList,
  setBallList,
}) {
  let tempList = [];
  let runningIndex = 0;

  // Filter player boxes and create list items
  const boxes = canvasBoxes.filter(
    (box) => box.my.frame === getCurrentTimestampFrame(),
  );
  boxes.forEach((box) => {
    const boxColor = colorSet.get(box.my.key);
    tempList.push(
      <TrackListItemPlayer
        key={runningIndex++}
        playerBox={box}
        name={playerNameMap.get(box.my.key)}
        changeSelection={changeSelection}
        setName={setName}
        blink={blink}
        delete={deletePlayer}
        color={boxColor}
        handleModalOpen={handleModalOpen}
      />,
    );
  });
  setPlayerList(tempList);

  // Reset tempList and runningIndex for ball boxes
  tempList = [];
  runningIndex = 0;

  // Filter ball boxes and create list items
  const ballBoxes = canvasBoxesBall.filter(
    (box) => box.my.frame === getCurrentTimestampFrame(),
  );
  ballBoxes.forEach((box) => {
    const boxColor = colorSetBall.get(box.my.key);
    tempList.push(
      <TrackListItemBall
        key={runningIndex++}
        ballBox={box}
        name={ballNameMap.get(box.my.key)}
        changeSelection={changeSelection}
        setName={setNameBall}
        blink={blink}
        delete={deleteBall}
        color={boxColor}
        handleModalOpen={handleModalBallOpen}
      />,
    );
  });
  setBallList(tempList);
}
