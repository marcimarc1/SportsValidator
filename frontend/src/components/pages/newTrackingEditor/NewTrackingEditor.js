import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ReactComponent as PlayIcon } from '../../../icons/play.svg';
import { ReactComponent as PauseIcon } from '../../../icons/pause.svg';
import { ReactComponent as ForwardStepIcon } from '../../../icons/forward-step.svg';
import { ReactComponent as BackwardStepIcon } from '../../../icons/backward-step.svg';
// import tracking from "../../../data/tracking_data.json";
import tracking from "../../../data/tracking_data_test.json";
import { fabric } from 'fabric';
import './NewTrackingEditor.css'
import SeekBar from './SeekBar';
import { duration } from '@material-ui/core';
import { FormGroup, Switch, FormControlLabel, Button } from '@mui/material';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';

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
  const [isShowingBox, setIsShowingBox] = useState(false);
  const [isShowingAnnotation, setIsShowingAnnotation] = useState(true);

  let { videoName } = useParams();

  const canvasRef = useRef(null);
  const frameDuration = 1001 / 24000; // TODO Get this information from the backend
  const canvasBoxes = [];

  let wasVideoPlaying = false;

  // For changing video source file
  const handleBrowse = async (event) => {
    try {
      // Get the uploaded file
      const file = event.target.files[0];

      // const annotationsResponse = await fetch("/api/annotations/199");
      // if (!annotationsResponse.ok) {
      //   throw new Error('Failed to fetch annotations for video');
      // }
      // const annotationsJson = await annotationsResponse.json();
      // console.log("Retrieved annotations : ", annotationsJson);
      // setAnnotations(annotationsJson);

      // Transform file into blob URL
      setAnnotations(tracking);
      setVideoUrl(URL.createObjectURL(file));
      console.log("Finished setting video url");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = async () => {
    // setIsDownloadingVideo(true);

    // console.log("Video name : ", videoName);

    // try {
    //   const videoResponse = await fetch("/uploads/" + videoName);
    //   if (!videoResponse.ok) {
    //     throw new Error('Failed to fetch video.');
    //   }
    //   const videoBlob = await videoResponse.blob();

    //   const annotationsResponse = await fetch("/api/annotations/199");
    //   if (!annotationsResponse.ok) {
    //     throw new Error('Failed to fetch annotations for video');
    //   }
    //   const annotationsJson = await annotationsResponse.json();
    //   console.log("Retrieved annotations : ", annotationsJson);
    //   setAnnotations(annotationsJson);

    //   setVideoUrl(URL.createObjectURL(videoBlob));
    // } catch (error) {
    //   console.error('Error downloading video:', error);
    // } finally {
    //   setIsDownloadingVideo(false);
    // }
  }

  useEffect(() => {
    const localVideoElement = document.createElement('video');
    localVideoElement.src = videoUrl;
    localVideoElement.muted = true;

    //video size has to be anually set
    localVideoElement.width = 3840;
    localVideoElement.height = 2160;

    setVideoElement(localVideoElement);
  }, [videoUrl]);

  useEffect(() => {
    if (!videoElement)
      return;

    // const canvasElement = canvasRef.current;
    // const context = canvasElement.getContext('2d');

    //retrieve screen width without scrollbar
    let canvasWidth = document.body.clientWidth;
    let canvasHeight = videoElement.height / videoElement.width * canvasWidth;
    let canvas = new fabric.Canvas('tracking-editor-canvas');
    canvas.setHeight(canvasHeight);
    canvas.setWidth(canvasWidth);
    const horizontalScalingFactor = canvas.width / 3840;
    const verticalScalingFactor = canvas.height / 2160;
    let previousFrameNumber = 0;
    console.log("canvas with: " + canvasHeight, canvasWidth);
    const boxIndexesCount = annotations.length;

    // https://stackoverflow.com/questions/33834724/draw-video-on-canvas-html5
    const drawVideo = () => {
      // Clear canvas
      // context.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Drawing video
      // context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      var fabricVideo = new fabric.Image(videoElement, {left:0, 
                                                        top:0, 
                                                        width:videoElement.width,
                                                        height:videoElement.height,
                                                        selectable: false});

      canvas.setBackgroundImage(fabricVideo, canvas.renderAll.bind(canvas), {scaleX:horizontalScalingFactor, scaleY:verticalScalingFactor});
      canvas.renderAll();
    }

    const drawBoundingBoxes = (frameNumber) => {
      // if(isShowingBox) {
      //   let boxIndex = annotations.findIndex(element => element.FrameNo == frameNumber);
      //   if (boxIndex == -1)
      //     return;
  
      //   //five players in the tracking data, some are not displayed.
      //   //maybe move annotations[boxIndex].FrameNo == frameNumber to the block content?
      //   while (boxIndex < boxIndexesCount && annotations[boxIndex].FrameNo == frameNumber) {
      //     // const scaledX = annotations[boxIndex].x * horizontalScalingFactor;
      //     // const scaledY = annotations[boxIndex].y * verticalScalingFactor;
      //     // const scaledWidth = annotations[boxIndex].w * horizontalScalingFactor;
      //     // const scaledHeight = annotations[boxIndex].h * verticalScalingFactor;
  
      //     // Computation should be avoidable with x1 or x2 etc but doesnt seem to work for now
      //     const scaledX = (annotations[boxIndex].x - (annotations[boxIndex].w / 2)) * horizontalScalingFactor;
      //     const scaledY = (annotations[boxIndex].y - (annotations[boxIndex].h / 2)) * verticalScalingFactor;
      //     const scaledWidth = annotations[boxIndex].w * horizontalScalingFactor;
      //     const scaledHeight = annotations[boxIndex].h * verticalScalingFactor;
  
      //     context.strokeStyle = 'red';
      //     context.lineWidth = 2;
      //     // context.beginPath();
      //     // context.rect(scaledX, scaledY, scaledWidth, scaledHeight);
  
      //     // create new box element first rather than directly plotting the rectangle
      //     const box = new CanvasBox(
      //       annotations[boxIndex].PlayerKey,
      //       frameNumber,
      //       scaledX,
      //       scaledY,
      //       scaledWidth,
      //       scaledHeight
      //     );
      //     canvasBoxes.push(box);
      //     //needs to be plotted manually.
      //     context.strokeStyle = 'red';
      //     context.lineWidth = 2;
      //     context.beginPath();
      //     context.rect(box.x, box.y, box.width, box.height);
      //     context.stroke();
      //     boxIndex++;
      //   }

      // }
    };

    // function addClickListeners() {
    //   const handler = function (event) {
    //     const rectForMouseEvent = canvasElement.getBoundingClientRect();
    //     const horizontalScaleRatio = canvasElement.width / rectForMouseEvent.width;
    //     const verticalScalRatio = canvasElement.height / rectForMouseEvent.height;
    //     const clickPointX = event.offsetX * horizontalScaleRatio;
    //     const clickPointY = event.offsetY * verticalScalRatio;
    //     console.log("ratio: " + horizontalScaleRatio, verticalScalRatio);
    //     console.log("size of canvas: " + canvasElement.width, canvasElement.height);
    //     console.log("original click point:" + event.offsetX, event.offsetY);
    //     console.log("scaled click point:" + clickPointX, clickPointY);
    //     canvasBoxes.forEach((box, index) => {
    //       console.log("box position: ", box.x, box.y);
    //       //maybe use context.isPointInPath(clickPointX, clickPointY)?
    //       if (clickPointX >= box.x && clickPointX <= box.x + box.width 
    //         && clickPointY >= box.y && clickPointY <= box.y + box.height
    //         && box.frameNo == getCurrentTimestampFrame()) {
    //         if (box.clicked) {
    //           console.log("hide annotation.");
    //           box.clicked = false;
    //           context.clearRect(box.x + box.width + 10, box.y, 200, -50);
    //         } else {
    //           console.log("show annotation.");
    //           box.clicked = true;
    //           context.font = "30px Arial";
    //           //calculate annotation block size.
    //           context.fillText("Hello World", box.x + box.width + 10, box.y);
    //         }
    //       }
    //     }
    //     );
    //   };
    //   canvasElement.addEventListener('click', handler);
    // }

    // addClickListeners();

    const updateCanvas = () => {
      const currentFrameNumber = getCurrentTimestampFrame();
      drawVideo();
        drawBoundingBoxes(currentFrameNumber);
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
    // First frame is frame 0
    return Math.floor(videoElement.currentTime / frameDuration);
  }

  const getReferenceTimestampForFrame = (n) => {
    return (n * frameDuration) + (frameDuration / 3);
  }

  const updateTimestamp = (newTimestamp) => {
    const newFrameNumber = Math.floor(newTimestamp / frameDuration);
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

  const handleDisplayingBox = () => {
    console.log(isShowingBox);
    if(isShowingBox) {
      setIsShowingBox(false);
      // if the box is hidden, the annotation shall be hidden too.
      setIsShowingAnnotation(false);
      
    } else {
      setIsShowingBox(true);
    }
  }
  const handleDisplayingAnnotation = () => {
    if(isShowingAnnotation) {
      setIsShowingAnnotation(false);
    } else {
      setIsShowingAnnotation(true);
    }
  }


  return (
    <div>
      <div className='controls'>
        <div id="tools-container">
            <div>Show Annotation: &nbsp;&nbsp;</div>
            <FormGroup>
              <FormControlLabel control={<Switch checked={isShowingAnnotation} onChange={handleDisplayingAnnotation} />} />
            </FormGroup>
            <div>Show Player Box: &nbsp;&nbsp;</div>
            <FormGroup>
              <FormControlLabel control={<Switch checked={isShowingBox} onChange={handleDisplayingBox} />} />
            </FormGroup>
            <Button variant="contained">Add player</Button>
        </div>
      </div>
      <input type="file" onChange={handleBrowse} />
      <button onClick={handleDownload} disabled={isDownloadingVideo}>Download video</button>
      {/* <canvas ref={canvasRef} width={1920} height={1080} style={{ display: "block", width: "100%", height: "auto" }}></canvas> */}
      <canvas id="tracking-editor-canvas" width={1920} height={1080} style={{ display: "block", width: "100%", height: "auto" }}></canvas>
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

class CanvasBox {
  constructor(playerKey, frameNo, scaledX, scaledY, scaledWidth, scaledHeight) {
    this.playerKey = playerKey;
    this.frameNo = frameNo;
    this.x = scaledX;
    this.y = scaledY;
    this.width = scaledWidth;
    this.height = scaledHeight;
    this.clicked = false;
  }

}

export default NewTrackingEditor;