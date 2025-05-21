export const mergeData = (
  mainPlayerName,
  selectedPlayer,
  annotations,
  setAnnotations,
  setAlteredAnnotations,
  setDeleteAnnotations,
) => {
  const annotationsByName = {
    [mainPlayerName]: annotations.filter(a=> a.displayName === mainPlayerName),
    [selectedPlayer]: annotations.filter(a=> a.displayName === selectedPlayer),
  };

  const maxFrameMain = Math.max(...annotationsByName[mainPlayerName].map(a => a.frame_number));
  const maxFrameSelected = Math.max(...annotationsByName[selectedPlayer].map(a => a.frame_number));

  const selectedName = maxFrameMain< maxFrameSelected ? mainPlayerName : selectedPlayer;
  const mergeName = selectedName === mainPlayerName ? selectedPlayer : mainPlayerName;

  const updates = [];
  const deletes = [];

  const selectedFrames = new Set(annotationsByName[mainPlayerName].map(a => a.frame_number));

  for(const index in (annotationsByName[selectedPlayer])) {
    const ann = annotationsByName[selectedPlayer][index];
    if(selectedFrames.has(ann.frame_number)) {
      deletes.push(ann.id)
    }
    else{
      updates.push({...ann, displayName: selectedName})
    }
  }
  setDeleteAnnotations((prev) => [...prev, ...deletes]);
  setAlteredAnnotations((prev) => [...prev, ...updates]);
  setAnnotations([...annotations.filter(e => e.displayName !== mergeName), ...updates]);
};


export const multiMerge = (
  playerKeyArray,
  annotations,
  setAnnotations,
  alteredAnnotations,
  setAlteredAnnotations
) => {
  function removeDuplicates(array) {
    const uniquePairs = {};
    const result = [];
    array.forEach((obj) => {
      const key = obj.displayName + "," + obj.frame_number;
      if (!uniquePairs[key]) {
        result.push(obj);
        uniquePairs[key] = true;
      }
    });

    return result;
  }
  let changes = []
  const newAnnotations = annotations.map((a) => {
    if (playerKeyArray.includes(a.displayName)) {
      a.displayName = playerKeyArray[0];
      changes.push(a)
      return a;
    }
    return a;
  });
  setAnnotations(removeDuplicates(newAnnotations));
  setAlteredAnnotations([...alteredAnnotations,...changes]);
};

export const swapData = (
  secondPlayerName,
  playerChosenInList,
  annotations,
  setAnnotations,
  setAlteredAnnotations,
  frameNumber,
) => {
  let changes = [];
  const firstPlayerKey = playerChosenInList.displayName;
  const secondPlayerKey = secondPlayerName;

  const swappedAnnotations = annotations.map((annotation) => {
    if (
      annotation.PlayerKey === firstPlayerKey &&
      annotation.FrameNo >= frameNumber
    ) {
      const ann = { ...annotation, PlayerKey: secondPlayerKey };
      changes.push(ann);
      return ann;
    }
    if (
      annotation.PlayerKey === secondPlayerKey &&
      annotation.FrameNo >= frameNumber
    ) {
      const ann = { ...annotation, PlayerKey: firstPlayerKey };
      changes.push(ann);
      return ann;
    }
    return annotation;
  });
  setAlteredAnnotations((prev) => [...prev,...changes]);
  setAnnotations(swappedAnnotations);
};

export const multiBallTrailsDelete = (
  annotations,
  setAnnotationBallTracks,
) => {
  annotations.forEach((item) => {
    setAnnotationBallTracks((prevTracks) =>
      prevTracks.filter(
        (a) => a.displayName !== item.displayName || a.frame_number !== item.frame_number,
      ),
    );
  });
};
