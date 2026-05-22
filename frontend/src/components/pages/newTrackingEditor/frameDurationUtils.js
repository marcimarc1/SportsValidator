export const DEFAULT_FRAME_DURATION = 1 / 30;
export const MAX_REASONABLE_FRAME_RATE = 1000;
export const DEFAULT_VIDEO_WIDTH = 3840;
export const DEFAULT_VIDEO_HEIGHT = 2160;

const toPositiveFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const getFrameRateFromLog = (logFile) => {
  if (!logFile) return null;

  return (
    toPositiveFiniteNumber(logFile.FPS) ||
    toPositiveFiniteNumber(logFile.fps) ||
    toPositiveFiniteNumber(logFile.FrameRate) ||
    toPositiveFiniteNumber(logFile.frameRate) ||
    toPositiveFiniteNumber(logFile["Frame Rate"]) ||
    toPositiveFiniteNumber(logFile["Acquisition Frequency"]) ||
    toPositiveFiniteNumber(logFile["AcquisitionFrequency"]) ||
    toPositiveFiniteNumber(logFile.Frequency)
  );
};

const collectFrameNumbers = (annotations, annotationBallTracks) =>
  [
    ...annotations.map((item) => item?.FrameNo),
    ...annotationBallTracks.map((item) => item?.FrameNo),
  ].filter((frame) => Number.isFinite(frame));

/**
 * Estimates frame duration and the tracking frame index at video time 0.
 */
export const estimateTrackingTiming = (
  logFile,
  annotations,
  annotationBallTracks,
  videoDuration,
) => {
  const allFrames = collectFrameNumbers(annotations, annotationBallTracks);
  const frameRateFromLog = getFrameRateFromLog(logFile);

  if (allFrames.length === 0) {
    return frameRateFromLog
      ? { frameDuration: 1 / frameRateFromLog, frameOffset: 0 }
      : null;
  }

  const minFrame = Math.min(...allFrames);
  const maxFrame = Math.max(...allFrames);
  const frameCount = maxFrame - minFrame + 1;

  if (frameCount <= 0) {
    return frameRateFromLog
      ? { frameDuration: 1 / frameRateFromLog, frameOffset: minFrame }
      : null;
  }

  const estimateFromVideoDuration = () => {
    if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
      return null;
    }

    const estimatedFps = frameCount / videoDuration;
    if (
      !Number.isFinite(estimatedFps) ||
      estimatedFps <= 0 ||
      estimatedFps > MAX_REASONABLE_FRAME_RATE
    ) {
      return null;
    }

    return 1 / estimatedFps;
  };

  const durationBasedFrameDuration = estimateFromVideoDuration();

  if (durationBasedFrameDuration !== null) {
    if (frameRateFromLog) {
      const logBasedFrameDuration = 1 / frameRateFromLog;
      const relativeDiff =
        Math.abs(logBasedFrameDuration - durationBasedFrameDuration) /
        durationBasedFrameDuration;

      if (relativeDiff < 0.03) {
        return {
          frameDuration: logBasedFrameDuration,
          frameOffset: minFrame,
        };
      }
    }

    return {
      frameDuration: durationBasedFrameDuration,
      frameOffset: minFrame,
    };
  }

  if (frameRateFromLog) {
    return { frameDuration: 1 / frameRateFromLog, frameOffset: minFrame };
  }

  return null;
};

export const getReferenceTimestampForFrame = (
  frameNumber,
  frameOffset,
  frameDuration,
) => {
  return (
    (frameNumber - frameOffset) * frameDuration + frameDuration / 3
  );
};

export const getFrameNumberFromTimestamp = (
  timestamp,
  frameOffset,
  frameDuration,
) => {
  return frameOffset + Math.floor(timestamp / frameDuration);
};
