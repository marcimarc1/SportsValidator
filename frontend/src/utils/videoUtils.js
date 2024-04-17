export const getCurrentTimestampFrame = (videoElement, frameDuration) => {
  // First frame is frame 0
  return Math.floor(videoElement.currentTime / frameDuration);
};

const getReferenceTimestampForFrame = (n, frameDuration) => {
  return n * frameDuration + frameDuration / 3;
};

const updateTimestamp = (newTimestamp, frameDuration, setFrameNumber, setTimestamp) => {
  const newFrameNumber = Math.floor(newTimestamp / frameDuration);
  setTimestamp(newTimestamp);
  setFrameNumber(newFrameNumber);
};

export const handleNextFrame = (videoElement, frameNumber, setFrameNumber, setTimestamp, frameDuration) => {
  if (videoElement) {
    const nextFrame = frameNumber + 1;
    const referenceTimestamp = getReferenceTimestampForFrame(nextFrame, frameDuration);
    videoElement.currentTime = referenceTimestamp;
    setFrameNumber(nextFrame);
    setTimestamp(referenceTimestamp);
  }
};

export const handlePreviousFrame = (videoElement, frameNumber, setFrameNumber, setTimestamp, frameDuration) => {
  if (videoElement && frameNumber > 0) {
    const previousFrame = frameNumber - 1;
    const referenceTimestamp = getReferenceTimestampForFrame(previousFrame, frameDuration);
    videoElement.currentTime = referenceTimestamp;
    setFrameNumber(previousFrame);
    setTimestamp(referenceTimestamp);
  }
};

export const handlePreviousChunk = (videoElement, frameDuration, setFrameNumber, setTimestamp) => {
  const newTimestamp = Math.max(0, videoElement.currentTime - 6);
  videoElement.currentTime = newTimestamp;
  updateTimestamp(newTimestamp, frameDuration, setFrameNumber, setTimestamp);
};

export const handleNextChunk = (videoElement, frameDuration, setFrameNumber, setTimestamp) => {
  const newTimestamp = Math.min(
    videoElement.duration,
    videoElement.currentTime + 6,
  );
  videoElement.currentTime = newTimestamp;
  updateTimestamp(newTimestamp, frameDuration, setFrameNumber, setTimestamp);
};

export const handlePlayPause = (videoElement, setIsPlaying) => {
  if (videoElement && videoElement.readyState != 0 && !videoElement.ended) {
    if (videoElement.paused) {
      setIsPlaying(true);
      videoElement.play();
    } else {
      setIsPlaying(false);
      videoElement.pause();
    }
  }
};

// Seeking

export const handleSeekStart = (videoElement, wasVideoPlaying) => {
  if (videoElement && !videoElement.ended && !videoElement.paused) {
    wasVideoPlaying = true;
    videoElement.pause();
  } else {
    wasVideoPlaying = false;
  }
};

export const handleSeekPercent = (value, videoElement, setProgress, frameDuration, setFrameNumber, setTimestamp) => {
  setProgress(value);
  const newTimestamp = (value / 100) * videoElement.duration;
  videoElement.currentTime = newTimestamp;
  updateTimestamp(newTimestamp, frameDuration, setFrameNumber, setTimestamp);
};

export const handleSeekEnd = (videoElement, wasVideoPlaying) => {
  if (wasVideoPlaying) {
    videoElement.play();
  }
};

export const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toFixed(5).padStart(2, "0")}`;
};