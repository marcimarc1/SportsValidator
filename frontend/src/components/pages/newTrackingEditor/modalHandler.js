export const modalOpen =
  (setPlayerChosenInList, setMergeModalState) => (playerInList) => {
    setPlayerChosenInList(playerInList);
    setMergeModalState(true);
  };

export const modalBallOpen =
  (setBallChosenInList, setMergeModalBallState) => (ballInList) => {
    setBallChosenInList(ballInList);
    setMergeModalBallState(true);
    console.log("test2");


  };

export const modalsClose =
  (setMergeModalState, setMergeModalBallState) => () => {
    setMergeModalState(false);
    setMergeModalBallState(false);
  };
