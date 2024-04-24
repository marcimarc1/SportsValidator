import { fabric } from "fabric";
import { useVideoStore } from "../store/store";

export const getCurrentTimestampFrame = (frameDuration) => {
  const videoElement = useVideoStore.getState().videoElement;
  // First frame is frame 0
  return Math.floor(videoElement.currentTime / frameDuration);
};

const getReferenceTimestampForFrame = (n, frameDuration) => {
  return n * frameDuration + frameDuration / 3;
};

const updateTimestamp = (
  newTimestamp,
  frameDuration,
  setFrameNumber,
  setTimestamp,
) => {
  const newFrameNumber = Math.floor(newTimestamp / frameDuration);
  setTimestamp(newTimestamp);
  setFrameNumber(newFrameNumber);
};

export const handleNextFrame = (
  frameNumber,
  setFrameNumber,
  setTimestamp,
  frameDuration,
) => {
  if (useVideoStore.getState().videoElement) {
    const nextFrame = frameNumber + 1;
    const referenceTimestamp = getReferenceTimestampForFrame(
      nextFrame,
      frameDuration,
    );

    useVideoStore.getState().updateCurrentTime(referenceTimestamp);
    setFrameNumber(nextFrame);
    setTimestamp(referenceTimestamp);
  }
};

export const handlePreviousFrame = (
  frameNumber,
  setFrameNumber,
  setTimestamp,
  frameDuration,
) => {
  if (useVideoStore.getState().videoElement && frameNumber > 0) {
    const previousFrame = frameNumber - 1;
    const referenceTimestamp = getReferenceTimestampForFrame(
      previousFrame,
      frameDuration,
    );

    useVideoStore.getState().updateCurrentTime(referenceTimestamp);
    setFrameNumber(previousFrame);
    setTimestamp(referenceTimestamp);
  }
};

export const handlePreviousChunk = (
  frameDuration,
  setFrameNumber,
  setTimestamp,
) => {
  const newTimestamp = Math.max(
    0,
    useVideoStore.getState().videoElement.currentTime - 6,
  );
  useVideoStore.getState().updateCurrentTime(newTimestamp);
  updateTimestamp(newTimestamp, frameDuration, setFrameNumber, setTimestamp);
};

export const handleNextChunk = (
  frameDuration,
  setFrameNumber,
  setTimestamp,
) => {
  const videoElement = useVideoStore.getState().videoElement;
  const newTimestamp = Math.min(
    videoElement.duration,
    videoElement.currentTime + 6,
  );

  useVideoStore.getState().updateCurrentTime(newTimestamp);
  updateTimestamp(newTimestamp, frameDuration, setFrameNumber, setTimestamp);
};

export const handlePlayPause = (setIsPlaying) => {
  const videoElement = useVideoStore.getState().videoElement;

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

export const handleSeekStart = (wasVideoPlaying) => {
  const videoElement = useVideoStore.getState().videoElement;
  if (videoElement && !videoElement.ended && !videoElement.paused) {
    wasVideoPlaying = true;
    videoElement.pause();
  } else {
    wasVideoPlaying = false;
  }
};

export const handleSeekPercent = (
  value,
  setProgress,
  frameDuration,
  setFrameNumber,
  setTimestamp,
) => {
  setProgress(value);
  const newTimestamp =
    (value / 100) * useVideoStore.getState().videoElement.duration;

  useVideoStore.getState().updateCurrentTime(newTimestamp);
  updateTimestamp(newTimestamp, frameDuration, setFrameNumber, setTimestamp);
};

export const handleSeekEnd = (wasVideoPlaying) => {
  if (wasVideoPlaying) {
    useVideoStore.getState().videoElement.play();
  }
};

export const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toFixed(5).padStart(2, "0")}`;
};

export function generatePoster() {
  //if video cannot be played, simply return
  const videoElement = useVideoStore.getState().videoElement;
  if (videoElement.readyState == 0) return;
  //get video content of first frame
  const poster = new fabric.Image(videoElement, {
    left: 0,
    top: 0,
    width: videoElement.width,
    height: videoElement.height,
    selectable: true,
  });
  return poster;
}
