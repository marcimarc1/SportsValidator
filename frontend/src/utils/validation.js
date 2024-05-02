export const mergePlayerData = (
  mainPlayerName,
  playerNameMap,
  playerChosenInList,
  annotations,
  setAnnotations,
) => {
  const nameToKeyMap = new Map();
  playerNameMap.forEach((value, key) => {
    nameToKeyMap.set(value, key);
  });
  const firstPlayerKey = nameToKeyMap.get(mainPlayerName);
  const secondPlayerKey = nameToKeyMap.get(playerChosenInList);
  if (firstPlayerKey == undefined || secondPlayerKey == undefined) {
    console.log("players are not mapped");
    return;
  }

  //by default, the player with the higher playerkey is the merged player
  //and the player with the lower playerkey is the main player, which will be kept
  const firstPlayerMaxFrame = Math.max(
    ...annotations
      .filter((a) => a.PlayerKey == firstPlayerKey)
      .map((a) => a.FrameNo),
  );
  const secondPlayerMaxFrame = Math.max(
    ...annotations
      .filter((a) => a.PlayerKey == secondPlayerKey)
      .map((a) => a.FrameNo),
  );

  let mergedPlayerKey;
  let mainPlayerKey;

  if (firstPlayerMaxFrame > secondPlayerMaxFrame) {
    mergedPlayerKey = firstPlayerKey;
    mainPlayerKey = secondPlayerKey;
  } else {
    mergedPlayerKey = secondPlayerKey;
    mainPlayerKey = firstPlayerKey;
  }

  //filter out duplicate annotations between main and merged player that has the same frame number
  let filteredAnnotations = annotations.filter(
    (a) => a.playerKey != mergedPlayerKey,
  );
  const mainPlayerAnnotations = annotations.filter(
    (a) => a.playerKey == mainPlayerKey,
  );
  const mergedPlayerAnnotations = annotations.filter(
    (a) => a.playerKey == mergedPlayerKey,
  );
  filteredAnnotations = filteredAnnotations.concat(
    mergedPlayerAnnotations.filter((a) =>
      mainPlayerAnnotations.every((b) => b.FrameNo != a.FrameNo),
    ),
  );

  const mergedAnnotations = filteredAnnotations.map((annotation) => {
    if (annotation.PlayerKey == mergedPlayerKey) {
      return { ...annotation, PlayerKey: mainPlayerKey };
    }
    return annotation;
  });
  setAnnotations(mergedAnnotations);
};

export const multiPlayerMerge = (
  playerKeyArray,
  annotations,
  setAnnotations,
) => {
  const newAnnotations = annotations.map((a) => {
    if (playerKeyArray.includes(a.PlayerKey)) {
      a.PlayerKey = playerKeyArray[0];
      return a;
    }
    return a;
  });
  setAnnotations(newAnnotations);
};

export const swapPlayerData = (
  secondPlayerName,
  playerNameMap,
  setPlayerNameMap,
  playerChosenInList,
  annotations,
  setAnnotations,
  frameNumber,
) => {
  const nameToKeyMap = new Map();
  playerNameMap.forEach((value, key) => {
    nameToKeyMap.set(value, key);
  });
  const firstPlayerKey = nameToKeyMap.get(playerChosenInList);
  const secondPlayerKey = nameToKeyMap.get(secondPlayerName);

  if (firstPlayerKey == undefined || secondPlayerKey == undefined) {
    console.log("players are not mapped");
    return;
  }

  const swappedAnnotations = annotations.map((annotation) => {
    if (
      annotation.PlayerKey == firstPlayerKey &&
      annotation.FrameNo >= frameNumber
    ) {
      return { ...annotation, PlayerKey: secondPlayerKey };
    }
    if (
      annotation.PlayerKey == secondPlayerKey &&
      annotation.FrameNo >= frameNumber
    ) {
      return { ...annotation, PlayerKey: firstPlayerKey };
    }
    return annotation;
  });
  setAnnotations(swappedAnnotations);
};
