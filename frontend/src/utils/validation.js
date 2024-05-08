export const mergePlayerData = (
  mainPlayerName,
  playerNameMap,
  setPlayerNameMap,
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
  let newPlayerNameMap = new Map(playerNameMap);
  newPlayerNameMap.delete(mergedPlayerKey);
  setPlayerNameMap(newPlayerNameMap);
};

export const multiPlayerMerge = (
  playerKeyArray,
  annotations,
  setAnnotations,
  playerNameMap,
  setPlayerNameMap,
) => {

  function removeDuplicates(array) {
    const uniquePairs = {};
    const result = [];

    array.forEach(obj => {
        const key = obj.PlayerKey + ',' + obj.FrameNo;
        if (!uniquePairs[key]) {
            result.push(obj);
            uniquePairs[key] = true;
        }
    });

    return result;
  }

  const newAnnotations = annotations.map((a) => {
    if (playerKeyArray.includes(a.PlayerKey)) {
      a.PlayerKey = playerKeyArray[0];
      return a;
    }
    return a;
  });
  setAnnotations(removeDuplicates(newAnnotations));
  let newPlayerNameMap = new Map(playerNameMap);
  playerKeyArray.shift();
  playerKeyArray.forEach((key) => {
    newPlayerNameMap.delete(key);
  });
  setPlayerNameMap(newPlayerNameMap);
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
