// videoControls.js

export const getCurrentTimestampFrame = (videoElement, frameDuration) => {
  return Math.floor(videoElement.currentTime / frameDuration);
};

export const getReferenceTimestampForFrame = (n, frameDuration) => {
  return n * frameDuration + frameDuration / 3;
};

export const updateTimestamp = (
  newTimestamp,
  frameDuration,
  setTimestamp,
  setFrameNumber,
) => {
  const newFrameNumber = Math.floor(newTimestamp / frameDuration);
  console.log("Called updateTimeStamp with: " + newTimestamp.toString());
  setTimestamp(newTimestamp);
  setFrameNumber(newFrameNumber);
};

export const handleNextFrame = ({
  videoElement,
  frameNumber,
  getReferenceTimestampForFrame,
  deleteFieldDrawing,
  setFrameNumber,
  setTimestamp,
  drawField,
}) => {
  if (videoElement) {
    const nextFrame = frameNumber + 1;
    const referenceTimestamp = getReferenceTimestampForFrame(nextFrame);
    videoElement.currentTime = referenceTimestamp;
    deleteFieldDrawing();
    setFrameNumber(nextFrame);
    setTimestamp(referenceTimestamp);
    drawField();
  }
};

export const handlePreviousFrame = ({
  videoElement,
  frameNumber,
  getReferenceTimestampForFrame,
  deleteFieldDrawing,
  setFrameNumber,
  setTimestamp,
  drawField,
}) => {
  if (videoElement && frameNumber > 0) {
    const previousFrame = frameNumber - 1;
    const referenceTimestamp = getReferenceTimestampForFrame(previousFrame);
    videoElement.currentTime = referenceTimestamp;
    deleteFieldDrawing();
    setFrameNumber(previousFrame);
    setTimestamp(referenceTimestamp);
    drawField();
  }
};

export const handlePreviousChunk = (videoElement, updateTimestamp) => {
  const newTimestamp = Math.max(0, videoElement.currentTime - 6);
  videoElement.currentTime = newTimestamp;
  updateTimestamp(newTimestamp);
};

export const handleNextChunk = (videoElement, updateTimestamp) => {
  const newTimestamp = Math.min(
    videoElement.duration,
    videoElement.currentTime + 6,
  );
  videoElement.currentTime = newTimestamp;
  updateTimestamp(newTimestamp);
};

export const handlePlayPause = ({
  videoElement,
  editField,
  setShowApplyHomographyModal,
  setIsPlaying,
}) => {
  if (videoElement && videoElement.readyState !== 0 && !videoElement.ended) {
    if (editField) {
      setShowApplyHomographyModal(true);
      return;
    }
    if (videoElement.paused) {
      setIsPlaying(true);
      videoElement.play();
    } else {
      setIsPlaying(false);
      videoElement.pause();
    }
  }
};

export const handleSeekStart = (videoElement, setWasVideoPlaying) => {
  console.log("handleSeekStart");
  if (videoElement && !videoElement.ended && !videoElement.paused) {
    setWasVideoPlaying(true);
    videoElement.pause();
  } else {
    setWasVideoPlaying(false);
  }
};

export const handleSeekPercent = (
  value,
  videoElement,
  setProgress,
  updateTimestamp,
) => {
  setProgress(value);
  const newTimestamp = (value / 100) * videoElement.duration;
  videoElement.currentTime = newTimestamp;
  updateTimestamp(newTimestamp);
};

export const handleSeekEnd = (wasVideoPlaying, videoElement) => {
  if (wasVideoPlaying) {
    videoElement.play();
  }
};

export const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toFixed(5).padStart(2, "0")}`;
};

export const handleDisplayingBox = ({
  isShowingBox,
  setIsShowingBox,
  setIsShowingAnnotation,
  videoElement,
}) => {
  if (isShowingBox) {
    setIsShowingBox(false);
    setIsShowingAnnotation(false);
    if (!videoElement.paused) {
      videoElement.pause();
      videoElement.play();
    }
  } else {
    setIsShowingBox(true);
    if (!videoElement.paused) {
      videoElement.pause();
      videoElement.play();
    }
  }
};

export const handleDisplayingAnnotation = (
  isShowingAnnotation,
  setIsShowingAnnotation,
) => {
  setIsShowingAnnotation(!isShowingAnnotation);
};

export const handleAdjustSpeed = (videoElement, videoSpeed, setVideoSpeed) => {
  const incrementBy = 0.25;

  if (videoElement) {
    if (videoSpeed == 2) {
      setVideoSpeed(0.25);
      videoElement.playbackRate = videoSpeed;
    } else {
      setVideoSpeed(videoSpeed + incrementBy);
      videoElement.playbackRate = videoSpeed;
    }
  }
};

export const handleAddPlayer = ({
  playerNameMap,
  frameNumber,
  setColorSet,
  colorSet,
  setAnnotations,
  annotations,
  setPlayerNameMap,
  generateColor,
}) => {
  const newPlayerKey = playerNameMap.size;
  const boxColor = generateColor(newPlayerKey);
  setColorSet(colorSet.set(newPlayerKey, boxColor));
  setAnnotations(
    annotations.concat({
      FrameNo: frameNumber,
      PlayerKey: newPlayerKey,
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
      in_field: true,
    }),
  );
  setPlayerNameMap(
    new Map(playerNameMap.set(newPlayerKey, "player" + newPlayerKey)),
  );
};
