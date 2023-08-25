import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ReactComponent as PlayIcon } from '../../../icons/play.svg';
import { ReactComponent as PauseIcon } from '../../../icons/pause.svg';
import { ReactComponent as ForwardStepIcon } from '../../../icons/forward-step.svg';
import { ReactComponent as BackwardStepIcon } from '../../../icons/backward-step.svg';
import tracking from "../../../data/tracking_data.json";
import './NewTrackingEditor.css'
import SeekBar from './SeekBar';
import { duration } from '@material-ui/core';

// TODO Take a video_id instead and have an endpoint on the server where we supply a video_id and get the corresponding video
const NewTrackingEditor = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [frameNumber, setFrameNumber] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [videoElement, setVideoElement] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [annotations, setAnnotations] = useState({});

  let { videoName } = useParams();

  const canvasRef = useRef(null);
  const frameDuration = 1001 / 24000; // TODO Get this information from the backend

  let wasVideoPlaying = false;

  // For changing video source file
  const handleBrowse = async (event) => {
    try {
      // Get the uploaded file
      const file = event.target.files[0];

      const annotationsResponse = await fetch("/api/annotations/199");
      if (!annotationsResponse.ok) {
        throw new Error('Failed to fetch annotations for video');
      }
      const annotationsJson = await annotationsResponse.json();
      console.log("Retrieved annotations : ", annotationsJson);
      setAnnotations(annotationsJson);

      // Transform file into blob URL
      setVideoUrl(URL.createObjectURL(file));
      console.log("Finished setting video url");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = async () => {
    setIsDownloadingVideo(true);

    console.log("Video name : ", videoName);

    try {
      const videoResponse = await fetch("/uploads/" + videoName);
      if (!videoResponse.ok) {
        throw new Error('Failed to fetch video.');
      }
      const videoBlob = await videoResponse.blob();

      const annotationsResponse = await fetch("/api/annotations/199");
      if (!annotationsResponse.ok) {
        throw new Error('Failed to fetch annotations for video');
      }
      const annotationsJson = await annotationsResponse.json();
      console.log("Retrieved annotations : ", annotationsJson);
      setAnnotations(annotationsJson);

      setVideoUrl(URL.createObjectURL(videoBlob));
    } catch (error) {
      console.error('Error downloading video:', error);
    } finally {
      setIsDownloadingVideo(false);
    }
  }


  useEffect(() => {
    const localVideoElement = document.createElement('video');
    localVideoElement.src = videoUrl;
    localVideoElement.muted = true;
    setVideoElement(localVideoElement);
  }, [videoUrl]);

  useEffect(() => {
    if (!videoElement)
      return;

    const canvasElement = canvasRef.current;
    const context = canvasElement.getContext('2d');
    const horizontalScalingFactor = canvasElement.width / 3840;
    const verticalScalingFactor = canvasElement.height / 2160;
    let previousFrameNumber = 0;
    const boxIndexesCount = annotations.length;

    // https://stackoverflow.com/questions/33834724/draw-video-on-canvas-html5
    const drawVideo = () => {
      // Clear canvas
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Drawing video
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    }

    const drawBoundingBoxes = (frameNumber) => {
      let boxIndex = annotations.findIndex(element => element.FrameNo == frameNumber);
      if (boxIndex == -1)
        return;

      while (boxIndex < boxIndexesCount && annotations[boxIndex].FrameNo == frameNumber) {
        // const scaledX = annotations[boxIndex].x * horizontalScalingFactor;
        // const scaledY = annotations[boxIndex].y * verticalScalingFactor;
        // const scaledWidth = annotations[boxIndex].w * horizontalScalingFactor;
        // const scaledHeight = annotations[boxIndex].h * verticalScalingFactor;

        // Computation should be avoidable with x1 or x2 etc but doesnt seem to work for now
        const scaledX = (annotations[boxIndex].x - (annotations[boxIndex].w / 2)) * horizontalScalingFactor;
        const scaledY = (annotations[boxIndex].y - (annotations[boxIndex].h / 2)) * verticalScalingFactor;
        const scaledWidth = annotations[boxIndex].w * horizontalScalingFactor;
        const scaledHeight = annotations[boxIndex].h * verticalScalingFactor;

        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.beginPath();
        context.rect(scaledX, scaledY, scaledWidth, scaledHeight);
        context.stroke();
        boxIndex++;
      }
    };

    const updateCanvas = () => {
      const currentFrameNumber = getCurrentTimestampFrame();
      drawVideo();
      drawBoundingBoxes(Math.max(currentFrameNumber - 1, 0));
    };

    const handleAnimationFrame = () => {
      if (!videoElement || videoElement.paused || videoElement.ended) {
        console.log("Video element either null, paused : ", videoElement.paused, " or ended : ", videoElement.ended);
        return;
      }

      const currentFrameNumber = getCurrentTimestampFrame();
      if (currentFrameNumber != previousFrameNumber) {
        updateCanvas();
        setFrameNumber(currentFrameNumber);
        setTimestamp(videoElement.currentTime);

        const currentProgress = videoElement.currentTime / videoElement.duration * 100;
        setProgress(currentProgress);
        previousFrameNumber = currentFrameNumber;
      }
 
      requestAnimationFrame(handleAnimationFrame);
    }

    const onPlay = () => {
      requestAnimationFrame(handleAnimationFrame);
    }
    
    const onCanPlay = () => {
      updateCanvas();
    }

    const onSeek = () => {
      console.log("Seeked");
      updateCanvas();
    }

    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('canplay', onCanPlay);
    videoElement.addEventListener('seeked', onSeek);
    videoElement.addEventListener('seeking', () => {
      console.log("Seeking");
    });
    videoElement.addEventListener('stalled', () => {
      console.log("Stalled");
    });
    videoElement.addEventListener('loadeddata', () => {
      console.log("Loaded data");
    });
    videoElement.addEventListener('waiting', () => {
      console.log("Waiting");
    });

    return () => {
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('canplay', onCanPlay);
      videoElement.removeEventListener('seeked', onSeek);
    };
  }, [videoElement]);


  const handleKeyDown = (event) => {
    switch(event.keyCode) {
      case 74 : // j
        handlePreviousChunk();
        break;
      case 75 : // k
        handlePlayPause();
        break;
      case 76 : // l
        handleNextChunk();
        break;
      case 188 : // ,
        handlePreviousFrame();
        break;
      case 190 : // .
        handleNextFrame();
        break;
    }
  }; 

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown); 
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  const getCurrentTimestampFrame = () => {
    // + 1 because 1st frame is at currentTime = 0
    return Math.floor(videoElement.currentTime / frameDuration) + 1;
  }

  const getReferenceTimestampForFrame = (n) => {
    return (n - 1) * frameDuration + frameDuration / 3;
  }

  const updateTimestamp = (newTimestamp) => {
    const newFrameNumber = Math.floor(newTimestamp / frameDuration) + 1;
    setTimestamp(newTimestamp);
    setFrameNumber(newFrameNumber);
  }

  const handleNextFrame = () => {
    if (videoElement) {
      const nextFrame = frameNumber + 1;
      const referenceTimestamp = getReferenceTimestampForFrame(nextFrame);
      videoElement.currentTime = referenceTimestamp;
      setFrameNumber(nextFrame);
      setTimestamp(referenceTimestamp);
    }
  };

  const handlePreviousFrame = () => {
    if (videoElement && frameNumber > 0) {
      const previousFrame = frameNumber - 1;
      const referenceTimestamp = getReferenceTimestampForFrame(previousFrame);
      videoElement.currentTime = referenceTimestamp;
      setFrameNumber(previousFrame);
      setTimestamp(referenceTimestamp);
    }
  };

  const handlePreviousChunk = () => {
    const newTimestamp = Math.max(0, videoElement.currentTime - 6);
    videoElement.currentTime = newTimestamp;
    updateTimestamp(newTimestamp);
  }

  const handleNextChunk = () => {
    const newTimestamp = Math.min(videoElement.duration, videoElement.currentTime + 6);
    videoElement.currentTime = newTimestamp;
    updateTimestamp(newTimestamp);
  }

  const handlePlayPause = () => {
    if (videoElement && videoElement.readyState != 0 && !videoElement.ended) {
      if (videoElement.paused) {
        setIsPlaying(true);
        videoElement.play();
      } else {
        setIsPlaying(false);
        videoElement.pause();
      }
    }
  }


  // Seeking

  const handleSeekStart = () => {
    if (videoElement && !videoElement.ended && !videoElement.paused) {
      wasVideoPlaying = true;
      videoElement.pause();
    } else {
      wasVideoPlaying = false;
    }
  }

  const handleSeekPercent = (value) => {
    setProgress(value);
    const newTimestamp = value / 100 * videoElement.duration;
    videoElement.currentTime = newTimestamp;
    updateTimestamp(newTimestamp);
  }

  const handleSeekEnd = () => {
    if (wasVideoPlaying) {
      videoElement.play();
    }
  }



  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toFixed(5).padStart(2, '0')}`;
  };


  return (
    <div>
      <input type="file" onChange={handleBrowse} />
      <button onClick={handleDownload} disabled={isDownloadingVideo}>Download video</button>
      <canvas ref={canvasRef} width={1920} height={1080} style={{ display: "block", width: "100%", height: "auto" }}></canvas>
      <div className="controls">
        <SeekBar onSeekStart={handleSeekStart} onSeekPercent={handleSeekPercent} onSeekEnd={handleSeekEnd} progress={progress} />
        <div id="buttons-container">
          <button className="icon-button" onClick={handlePreviousFrame}><BackwardStepIcon className="icon" /></button>
          <span id="frame-number-display">Frame {frameNumber}</span>
          <button className="icon-button" onClick={handleNextFrame}><ForwardStepIcon className="icon" /></button>
          <button className="icon-button" onClick={handlePlayPause}>
            {isPlaying ? <PauseIcon className="icon" /> : <PlayIcon className="icon" />}
          </button>
          <span id="timestamp-display">{formatTime(timestamp)} / {formatTime(videoElement?.duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default NewTrackingEditor;