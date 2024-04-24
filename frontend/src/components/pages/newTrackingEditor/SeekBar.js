import React, { useRef, useState, useEffect } from "react";
import "./SeekBar.css";
import {
  handleSeekStart,
  handleSeekPercent,
  handleSeekEnd,
} from "../../../utils/videoUtils";

const SeekBar = ({
  progress,
  setProgress,
  wasVideoPlaying,
  frameDuration,
  setFrameNumber,
  setTimestamp,
}) => {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const containerRef = useRef(null);

  const computePercentage = (eventX) => {
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = eventX - left;
    return (x / width) * 100;
  };

  const seek = (eventX) => {
    const percent = computePercentage(eventX);
    setDisplayedProgress(percent);
    handleSeekPercent(
      percent,
      setProgress,
      frameDuration,
      setFrameNumber,
      setTimestamp,
    );
  };

  const handleMouseMoveDocument = (event) => {
    seek(event.clientX);
  };

  const handleMouseUpDocument = (event) => {
    // seek(event.clientX);
    setIsSeeking(false);
    document.removeEventListener("mousemove", handleMouseMoveDocument);
    document.removeEventListener("mouseup", handleMouseUpDocument);
    handleSeekEnd(wasVideoPlaying);
  };

  // Using document wide listener to be able to detect mouse move even when it goes out of the container
  const handleMouseDown = (event) => {
    handleSeekStart(wasVideoPlaying);
    setIsSeeking(true);
    seek(event.clientX);
    document.addEventListener("mousemove", handleMouseMoveDocument);
    document.addEventListener("mouseup", handleMouseUpDocument);
  };

  return (
    <div
      ref={containerRef}
      className="seeker-container"
      onMouseDown={handleMouseDown}
    >
      <div
        className="seeker"
        style={{ width: `${isSeeking ? displayedProgress : progress}%` }}
      ></div>
    </div>
  );
};

export default SeekBar;
