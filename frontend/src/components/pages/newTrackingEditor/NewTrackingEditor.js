import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ReactComponent as PlayIcon } from '../../../icons/play.svg';
import { ReactComponent as PauseIcon } from '../../../icons/pause.svg';
import { ReactComponent as ForwardStepIcon } from '../../../icons/forward-step.svg';
import { ReactComponent as BackwardStepIcon } from '../../../icons/backward-step.svg';
// import tracking from "../../../data/tracking_data.json";
import tracking from "../../../data/tracking-data-for-test.json";
import { fabric } from 'fabric';
import './NewTrackingEditor.css'
import SeekBar from './SeekBar';
import { duration } from '@material-ui/core';
import { FormGroup, Switch, FormControlLabel, Button } from '@mui/material';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import TrackList from '../newTrackingEditor/TrackList';
import TrackListItemPlayer from './TrackListItemPlayer';

// TODO Take a video_id instead and have an endpoint on the server where we supply a video_id and get the corresponding video
const NewTrackingEditor = () => {
  const [canvas, setCanvas] = useState('');
  const [videoUrl, setVideoUrl] = useState("");
  const [frameNumber, setFrameNumber] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [videoElement, setVideoElement] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [annotations, setAnnotations] = useState({});
  const [isShowingBox, setIsShowingBox] = useState(true);
  const [isShowingAnnotation, setIsShowingAnnotation] = useState(true);
  const [playerList, setPlayerList] = useState([]);
  const [playerNameMap, setPlayerNameMap] = useState(new Map());

  let { videoName } = useParams();

  const canvasRef = useRef(null);
  const frameDuration = 1001 / 24000; // TODO Get this information from the backend
  const canvasBoxes = [];
  const canvasAnnotations = [];

  let wasVideoPlaying = false;

  function blink(playerBox) {
    let originalColor = playerBox.stroke;
    let originalFillColor = playerBox.fill;
    let repeats = 3;
    let time = 0;
    let interval = 400;
    let blinkColor = 'rgb(255, 255, 255, 0.6)';

    if(originalColor !== blinkColor) {  // necessary because otherwise bBox could permanently be set to blinkColor
        for (let i = repeats; i > 0; i--) {
            setTimeout(() => {
                playerBox.set({
                    fill: blinkColor,
                    cornerColor: originalColor,
                    stroke: originalColor
                });
                canvas.renderAll();
            }, time);

            time += interval;
            setTimeout(() => {
                playerBox.set({
                    fill: originalFillColor,
                    cornerColor: originalColor,
                    stroke: originalColor
                });
                canvas.renderAll();
            }, time);
            time += interval;
        }
    }
  }

  function deletePlayer(playerBox) {
    let boxIndex = canvasBoxes.indexOf(playerBox);
    let annotationIndex = annotations.indexOf(playerBox);
    canvasBoxes.splice(boxIndex, 1); // remove bBox
    annotations.splice(annotationIndex, 1);
    canvas.remove(playerBox);
    canvas.requestRenderAll();
  }

  function setName(playerBox, name) {
    fabric.Object.prototype.objectCaching = false;
    // console.log("setting name of " + playerBox.my.player + " to " + name);
    let playerIndex = playerBox.my.key;
    playerNameMap.set(playerIndex, name);
    console.log("player" + playerIndex + " got name " + name);
    canvas.requestRenderAll();
    //playerBox.my.playerIdOrNameObject.visible = false;
    // TODO BACKEND call backend to update name
    // let updatedIdToName = {...this.state.idToName};
  }
  function selectBBox(key) {
    canvasBoxes.forEach(box => {
      box.my.selected = false;
        if (box.my.key == key) {
            canvas.discardActiveObject();
            canvas.setActiveObject(box);
            box.my.selected = true;
            return box;
        }
    });
  };

  function deselectBBox(key) {
    canvasBoxes.forEach(box => {
        if (box.my.key == key) {
            //comments from selectBBox about deep clone also apply here!
            box.my.selected = false;
            canvas.discardActiveObject();
            //this.setState({dummy: !this.state.dummy});
        }
    });
  };

  function changeSelection(key, deselect) {
            if(deselect) {
                deselectBBox(key);
            } else {
                selectBBox(key);
            }
  };    

  function defineBoxBehavior(playerBox) {
    playerBox.on({
      'selected': () => {
        // alert("player at" + scaledX, scaledY + "selected");
        console.log("player position: %d  %d  %d  %d", playerBox.left, playerBox.top, playerBox.width, playerBox.height);
      },
      'mousedown': () => {
        // alert("player at" + scaledX, scaledY + "selected");
      },
      'mouseover': () => {
        // alert("player at" + scaledX, scaledY + "selected");
      }
    });

    playerBox.on({
      'deselected': () => {
        // alert("player at" + scaledX, scaledY + "selected");
      },
      'mouseout': () => {
        // alert("player at" + scaledX, scaledY + "selected");
      }
    });

    playerBox.on({
      'modified': (event) => {
        let targetRect = event.target;
        playerBox.left = targetRect.left;
        playerBox.top = targetRect.top;
        playerBox.width = playerBox.width * targetRect.scaleX / playerBox.my.scaleX;
        playerBox.height = targetRect.height * targetRect.scaleY / playerBox.my.scaleY;
        playerBox.dirty = true;
        playerBox.my.scaleX = targetRect.scaleX;
        playerBox.my.scaleY = targetRect.scaleY;
        console.log("scaling factor: %f %f", targetRect.scaleX, targetRect.scaleY);
        console.log("player position: %d  %d  %d  %d", targetRect.left, targetRect.top, targetRect.width, targetRect.height);
      }
    });

    return playerBox;
  }

  const retrievePlayer = () => {
    if (annotations.length > 0) {
      return Math.max(...annotations.map(a => a.PlayerKey));
    } else {
      return 0;
    }
  }

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
    // as player name is not contained in the tracking data, set "test player" as default name.
    let playerNumber = retrievePlayer();
    let tempMap = new Map();
    for (var i = 0; i<= playerNumber; i++) {
      tempMap.set(i, "test player");
    }
    setPlayerNameMap(tempMap);
  }, [annotations]);

  useEffect(() => {
    let canvasWidth = document.body.clientWidth - 300;
    var canvasHeight = 800;
    if (videoElement) {
      canvasHeight  = videoElement.height / videoElement.width * canvasWidth;
    }
    let initCanvas = new fabric.Canvas('tracking-editor-canvas');
    initCanvas.setHeight(canvasHeight);
    initCanvas.setWidth(canvasWidth);
    setCanvas(initCanvas);
  }, []);

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
    // let canvasWidth = document.body.clientWidth;
    // let canvasHeight = videoElement.height / videoElement.width * canvasWidth;
    // let canvas = new fabric.Canvas('tracking-editor-canvas');
    // canvas.setHeight(canvasHeight);
    // canvas.setWidth(canvasWidth);
    const horizontalScalingFactor = canvas.width / 3840;
    const verticalScalingFactor = canvas.height / 2160;
    let previousFrameNumber = 0;
    const boxIndexesCount = annotations.length;
    const playerCount = retrievePlayer();

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
                                                        selectable: true});

      canvas.setBackgroundImage(fabricVideo, canvas.renderAll.bind(canvas), {scaleX:horizontalScalingFactor, scaleY:verticalScalingFactor});
    }

    const drawBoundingBoxes = (frameNumber) => {
      let playerIndex = 0;
      canvas.remove(...canvas.getObjects());
      // let boxIndex = annotations.findIndex(element => element.FrameNo == frameNumber);
      // if (boxIndex == -1) {
      //   return;
      // }
      var playersToDraw = canvasBoxes.filter(a => a.my.frame == frameNumber);
      var tempList = [];
      let runningIndex = 0;
      if(playersToDraw.length > 0) {
        while (playerIndex < playersToDraw.length) {
          canvas.add(playersToDraw[playerIndex]);
          playerIndex++;
        }
      } else {
        playersToDraw = annotations.filter(a => a.FrameNo == frameNumber);

      if (playersToDraw.length > 0) {
        //draw boxes
        while (playerIndex < playersToDraw.length) {
          const scaledX = (playersToDraw[playerIndex].x - (playersToDraw[playerIndex].w / 2)) * horizontalScalingFactor;
          const scaledY = (playersToDraw[playerIndex].y - (playersToDraw[playerIndex].h / 2)) * verticalScalingFactor;
          const scaledWidth = playersToDraw[playerIndex].w * horizontalScalingFactor;
          const scaledHeight = playersToDraw[playerIndex].h * verticalScalingFactor;

          let playerBox = new fabric.Rect({
            left: scaledX,
            top: scaledY,
            fill: 'rgba(0,0,0,0)',
            width: scaledWidth,
            height: scaledHeight,
            visible: isShowingBox,
            dirty: false,
            stroke: 'red',
            hasBorders: false,              // disables the control borders (the lines connecting the controls the show up when object is selected
            strokeWidth: 2,
            strokeUniform: true,            // to keep the bounding box a consisten thickness, independent of its size
            padding: 0,  // to make sure the pixel coordinates are correct
            cornerStyle: 'rect',
            lockRotation: true
        });
        playerBox.my = {
          selected: false,
          key: playerIndex,
          frame: frameNumber,
          //scaling factor when modifying the box
          scaleX: 1,
          scaleY: 1
          // also connect it to corresponding annotation
        }
        playerBox = defineBoxBehavior(playerBox);
        canvasBoxes.push(playerBox);
        canvas.add(playerBox);
        playerIndex++; 

        tempList = tempList.concat([<TrackListItemPlayer  key={runningIndex++}
          playerBox={playerBox}
          name={playerNameMap.get(playerIndex)}
          changeSelection={changeSelection}
          setName={setName}
          blink={blink}
          delete={deletePlayer} />]);
        }
        setPlayerList(tempList);
      }
      }
      canvas.renderAll();
    };

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
  }, [videoElement, isShowingBox]);


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

  function handleDisplayingBox() {
    if(isShowingBox) {
      setIsShowingBox(false);
      // if the box is hidden, the annotation shall be hidden too.
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
  }

  function handleDisplayingAnnotation() {
    if(isShowingAnnotation) {
      setIsShowingAnnotation(false);
    } else {
      setIsShowingAnnotation(true);
    }
  }

  function handleAddPlayer() {
    let playerBox = new fabric.Rect({
      left: 500,
      top: 100,
      fill: 'rgba(0,0,0,0)',
      width: 100,
      height: 100,
      visible: isShowingBox,
      dirty: false,
      stroke: 'red',
      hasBorders: false,              // disables the control borders (the lines connecting the controls the show up when object is selected
      strokeWidth: 2,
      strokeUniform: true,            // to keep the bounding box a consisten thickness, independent of its size
      padding: 0,  // to make sure the pixel coordinates are correct
      cornerStyle: 'rect',
      lockRotation: true
  });
  playerBox.my = {
    selected: false,
    key: 1,
    frame: getCurrentTimestampFrame(),
    //scaling factor when modifying the box
    scaleX: 1,
    scaleY: 1
    // also connect it to corresponding annotation
  }
  playerBox = defineBoxBehavior(playerBox);
  canvasBoxes.push(playerBox);
  canvas.add(playerBox);
  }


  return (
    <div>
      <div className='controls'>
        <div id="tools-container">
            <div>&nbsp;&nbsp;Show Annotation: &nbsp;</div>
            <FormGroup>
              <FormControlLabel control={<Switch checked={isShowingAnnotation} onChange={handleDisplayingAnnotation} />} />
            </FormGroup>
            <div>&nbsp;&nbsp;Show Player Box: &nbsp;</div>
            <FormGroup>
              <FormControlLabel control={<Switch checked={isShowingBox} onChange={handleDisplayingBox} />} />
            </FormGroup>
            <Button variant="contained" onClick={handleAddPlayer}>Add player</Button>
        </div>
      </div>
      <input type="file" onChange={handleBrowse} />
      <button onClick={handleDownload} disabled={isDownloadingVideo}>Download video</button>
      <div id='canvas-container'>
        <canvas className='canvas' id="tracking-editor-canvas" width='1920' height='1080' style={{ display: "block", width: "100%", height: "auto" }}></canvas>
        {/* <div className="sidebar">sidebar is here</div> */}
        <TrackList>
          {playerList}
        </TrackList>
      </div>
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