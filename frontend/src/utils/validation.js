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

  //by default, the player with the higher frame number is the merged player
  //and the player with the lower frame number is the main player, which will be kept
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
    (a) => a.PlayerKey != mergedPlayerKey,
  );
  const mainPlayerAnnotations = annotations.filter(
    (a) => a.PlayerKey == mainPlayerKey,
  );
  const mergedPlayerAnnotations = annotations.filter(
    (a) => a.PlayerKey == mergedPlayerKey,
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

export const mergeBallData = (
  mainBallName,
  ballNameMap,
  setBallNameMap,
  ballChosenInList,
  annotationBallTracks,
  setAnnotationBallTracks,
) => {
  const nameToKeyMap = new Map();
  ballNameMap.forEach((value, key) => {
    nameToKeyMap.set(value, key);
  });
  const firstBallKey = nameToKeyMap.get(mainBallName);
  const secondBallKey = nameToKeyMap.get(ballChosenInList);
  if (firstBallKey == undefined || secondBallKey == undefined) {
    console.log("balls are not mapped");
    return;
  }

  //by default, the ball with the higher frame number is the merged ball
  //and the ball with the lower frame number is the main ball, which will be kept
  const firstBallMaxFrame = Math.max(
    ...annotationBallTracks
      .filter((a) => a.trackNo == firstBallKey)
      .map((a) => a.FrameNo),
  );
  const secondBallMaxFrame = Math.max(
    ...annotationBallTracks
      .filter((a) => a.trackNo == secondBallKey)
      .map((a) => a.FrameNo),
  );

  let mergedBallKey;
  let mainBallKey;

  if (firstBallMaxFrame > secondBallMaxFrame) {
    mergedBallKey = firstBallKey;
    mainBallKey = secondBallKey;
  } else {
    mergedBallKey = secondBallKey;
    mainBallKey = firstBallKey;
  }

  //filter out duplicate annotations between main and merged ball that has the same frame number
  let filteredAnnotationBallTracks = annotationBallTracks.filter(
    (a) => a.trackNo != mergedBallKey,
  );
  const mainBallAnnotations = annotationBallTracks.filter(
    (a) => a.trackNo == mainBallKey,
  );
  const mergedBallAnnotations = annotationBallTracks.filter(
    (a) => a.trackNo == mergedBallKey,
  );
  filteredAnnotationBallTracks = filteredAnnotationBallTracks.concat(
    mergedBallAnnotations.filter((a) =>
      mainBallAnnotations.every((b) => b.FrameNo != a.FrameNo),
    ),
  );

  const mergedAnnotationBallTracks = filteredAnnotationBallTracks.map(
    (annotation) => {
      if (annotation.trackNo == mergedBallKey) {
        return { ...annotation, trackNo: mainBallKey };
      }
      return annotation;
    },
  );
  setAnnotationBallTracks(mergedAnnotationBallTracks);
  let newBallNameMap = new Map(ballNameMap);
  newBallNameMap.delete(mergedBallKey);
  setBallNameMap(newBallNameMap);
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

    array.forEach((obj) => {
      const key = obj.PlayerKey + "," + obj.FrameNo;
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

export const swapBallData = (
  secondBallName,
  ballNameMap,
  ballChosenInList,
  annotationBallTracks,
  setAnnotationBallTracks,
  frameNumber,
) => {
  const nameToKeyMap = new Map();
  ballNameMap.forEach((value, key) => {
    nameToKeyMap.set(value, key);
  });
  const firstBallKey = nameToKeyMap.get(ballChosenInList);
  const secondBallKey = nameToKeyMap.get(secondBallName);

  if (firstBallKey == undefined || secondBallKey == undefined) {
    console.log("balls are not mapped");
    return;
  }

  const swappedAnnotationBallTracks = annotationBallTracks.map((annotation) => {
    if (
      annotation.trackNo == firstBallKey &&
      annotation.FrameNo >= frameNumber
    ) {
      return { ...annotation, trackNo: secondBallKey };
    }
    if (
      annotation.trackNo == secondBallKey &&
      annotation.FrameNo >= frameNumber
    ) {
      return { ...annotation, trackNo: firstBallKey };
    }
    return annotation;
  });
  setAnnotationBallTracks(swappedAnnotationBallTracks);
};

export const multiBallMerge = (
  ballKeyArray,
  annotationBallTracks,
  setAnnotationBallTracks,
  ballNameMap,
  setBallNameMap,
) => {
  function removeDuplicates(array) {
    const uniquePairs = {};
    const result = [];

    array.forEach((obj) => {
      const key = obj.trackNo + "," + obj.FrameNo;
      if (!uniquePairs[key]) {
        result.push(obj);
        uniquePairs[key] = true;
      }
    });

    return result;
  }

  const newAnnotationBallTracks = annotationBallTracks.map((a) => {
    if (ballKeyArray.includes(a.trackNo)) {
      a.trackNo = ballKeyArray[0];
      return a;
    }
    return a;
  });
  setAnnotationBallTracks(removeDuplicates(newAnnotationBallTracks));
  let newBallNameMap = new Map(ballNameMap);
  ballKeyArray.shift();
  ballKeyArray.forEach((key) => {
    newBallNameMap.delete(key);
  });
  setBallNameMap(newBallNameMap);
};
