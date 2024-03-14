import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router";
import { ReactComponent as PlayIcon } from "../../../icons/play.svg";
import { ReactComponent as PauseIcon } from "../../../icons/pause.svg";
import { ReactComponent as ForwardStepIcon } from "../../../icons/forward-step.svg";
import { ReactComponent as BackwardStepIcon } from "../../../icons/backward-step.svg";
import { useLocation } from "react-router-dom";
import { parseProcessedPlayers } from "../../../utils/csvParser";
// import tracking from "../../../data/tracking_data.json";
// import tracking from "../../../data/tracking-data-for-test.json";
import { fabric } from "fabric";
import "./NewTrackingEditor.css";
import SeekBar from "./SeekBar";
import {
  FormGroup,
  Switch,
  FormControlLabel,
  Button,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";

import TrackList from "../newTrackingEditor/TrackList";
import TrackListItemPlayer from "./TrackListItemPlayer";
import MergeAndSwapModal from "./MergeAndSwapModal";
import { trailsFullRedraw } from "../../../utils/canvasUtils";

// TODO Take a video_id instead and have an endpoint on the server where we supply a video_id and get the corresponding video
const NewTrackingEditor = () => {
  const location = useLocation();
  const { processedPlayers, video, ballTracks, homographies, log } =
    location.state || {};
  // ballTracks, homographies and log are not being used. Logic will be implemented in the future.
  const [annotations, setAnnotations] = useState([]);
  const [canvas, setCanvas] = useState(new fabric.Canvas());
  const [videoUrl, setVideoUrl] = useState("");
  const [frameNumber, setFrameNumber] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [videoElement, setVideoElement] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [isShowingBox, setIsShowingBox] = useState(true);
  const [isShowingAnnotation, setIsShowingAnnotation] = useState(true);
  const [playerList, setPlayerList] = useState([]);
  const [canvasBoxes, setCanvasBoxes] = useState([]);
  const [playerNameMap, setPlayerNameMap] = useState(new Map());
  const [activeObject, setActiveObject] = useState(null);
  const [colorSet, setColorSet] = useState(new Map()); //map of playerkey to color
  const [trailsEnabled, setTrailsEnabled] = useState(true);
  const [trailFrameNumber, setTrailFrameNumber] = useState(50);
  const [mergeModalState, setMergeModalState] = useState(false);
  const [playerChosenInList, setPlayerChosenInList] = useState("");

  const handleModalOpen = (playerInList) => {
    setPlayerChosenInList(playerInList);
    setMergeModalState(true);
  };

  const handleModalClose = () => {
    setMergeModalState(false);
  };

  const mergePlayerData = (mainPlayerName) => {
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

    //by default, the player with the higher playerkey is the merged player
    //and the player with the lower playerkey is the main player, which will be kept
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
    let mainPlayerMaxFrame;

    if (firstPlayerMaxFrame > secondPlayerMaxFrame) {
      mergedPlayerKey = firstPlayerKey;
      mainPlayerKey = secondPlayerKey;
      mainPlayerMaxFrame = secondPlayerMaxFrame;
    } else {
      mergedPlayerKey = secondPlayerKey;
      mainPlayerKey = firstPlayerKey;
      mainPlayerMaxFrame = firstPlayerMaxFrame;
    }

    //filter out duplicate annotations between main and merged player that has the same frame number
    let filteredAnnotations = annotations.filter(
      (a) => a.playerKey != mergedPlayerKey,
    );
    const mainPlayerAnnotations = annotations.filter(
      (a) => a.playerKey == mainPlayerKey,
    );
    const mergedPlayerAnnotations = annotations.filter(
      (a) => a.playerKey == mergedPlayerKey,
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
  };

  const swapPlayerData = (secondPlayerName) => {
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

  let { videoName } = useParams();

  const canvasRef = useRef(null);
  const frameDuration = 1001 / 24000; // TODO Get this information from the backend
  // could be used to display annotations in canvas

  useEffect(() => {
    if (video) {
      setVideoUrl(URL.createObjectURL(video));
    }

    if (processedPlayers) {
      const parsedData = parseProcessedPlayers(processedPlayers);
      setAnnotations(parsedData);
      // Setting the color set based on the parsed data
      setColorSet(boundingBoxColorSet(parsedData));
    }
  }, [processedPlayers, location.state]);

  let wasVideoPlaying = false;

  function updateSidebar() {
    let tempList = [];
    let runningIndex = 0;
    let boxes = canvasBoxes.filter(
      (box) => box.my.frame == getCurrentTimestampFrame(),
    );
    boxes.forEach((box) => {
      const boxColor = colorSet.get(box.my.key);

      tempList = tempList.concat([
        <TrackListItemPlayer
          key={runningIndex++}
          playerBox={box}
          name={playerNameMap.get(box.my.key)}
          changeSelection={changeSelection}
          setName={setName}
          blink={blink}
          delete={deletePlayer}
          color={boxColor}
          handleModalOpen={handleModalOpen}
        />,
      ]);
      runningIndex++;
    });
    setPlayerList(tempList);
  }

  function blink(playerBox) {
    canvas.discardActiveObject();
    canvas.setActiveObject(playerBox);
    setActiveObject(playerBox);
    playerBox.my.selected = true;
    let originalStrokeColor = playerBox.stroke;
    let originalFillColor = playerBox.fill;
    let repeats = 3;
    let time = 0;
    let interval = 400;
    let blinkColor = "rgb(255, 255, 255, 0.6)";

    if (originalStrokeColor !== blinkColor) {
      // necessary because otherwise bBox could permanently be set to blinkColor
      for (let i = repeats; i > 0; i--) {
        setTimeout(() => {
          playerBox.set({
            fill: blinkColor,
            stroke: blinkColor,
          });
          playerBox.setCoords();
          canvas.renderAll();
        }, time);

        time += interval;
        setTimeout(() => {
          playerBox.set({
            fill: originalFillColor,
            stroke: originalStrokeColor,
          });
          playerBox.setCoords();
          canvas.renderAll();
        }, time);
        time += interval;
      }
    }
    playerBox.set({
      fill: originalFillColor,
      stroke: originalStrokeColor,
    });
    playerBox.setCoords();
    canvas.discardActiveObject();
  }

  function deletePlayer(playerBox) {
    canvas.setActiveObject(playerBox);
    setActiveObject(playerBox);
    let boxIndex = canvasBoxes.indexOf(playerBox);
    let annotationIndex = annotations.indexOf(playerBox);
    setAnnotations(annotations.toSpliced(annotationIndex, 1));
    setCanvasBoxes(canvasBoxes.toSpliced(boxIndex, 1));
    updateSidebar();
    canvas.discardActiveObject();
    canvas.remove(playerBox);
    canvas.requestRenderAll();
  }

  function setName(playerBox, name) {
    fabric.Object.prototype.objectCaching = false;
    let playerIndex = playerBox.my.key;
    playerNameMap.set(playerIndex, name);
    canvas.requestRenderAll();
    // TODO BACKEND
    // update data when leaving the page
    // the modified data is stored in canvasBoxes array
  }

  function boxInCanvas(playerBox) {
    //check if the box is in the canvas
    canvasBoxes.forEach((box) => {
      if (box == playerBox) {
        return true;
      }
    });
    return false;
  }

  function deselectAllBox() {
    canvas.discardActiveObject();
    canvasBoxes.forEach((box) => {
      //comments from selectBBox about deep clone also apply here!
      box.my.selected = false;
      //this.setState({dummy: !this.state.dummy});
    });
  }

  function selectBBox(playerBox) {
    canvas.setActiveObject(playerBox);
    setActiveObject(playerBox);
    playerBox.my.selected = true;
  }

  function changeSelection(playerBox) {
    if (boxInCanvas(playerBox)) {
      //deselect all active boxes
      deselectAllBox();
      //set the new active box
      selectBBox(playerBox);
    }
  }

  function defineBoxBehavior(playerBox) {
    playerBox.on({
      selected: () => {},
      mousedown: () => {},
      mouseover: () => {},
    });

    playerBox.on({
      deselected: () => {},
      mouseout: () => {},
    });

    playerBox.on({
      modified: (event) => {
        let targetRect = event.target;
        playerBox.left = targetRect.left;
        playerBox.top = targetRect.top;
        playerBox.width =
          (playerBox.width * targetRect.scaleX) / playerBox.my.scaleX;
        playerBox.height =
          (targetRect.height * targetRect.scaleY) / playerBox.my.scaleY;
        playerBox.dirty = true;
        playerBox.my.scaleX = targetRect.scaleX;
        playerBox.my.scaleY = targetRect.scaleY;
        playerBox.setCoords();
        canvas.requestRenderAll();
      },
    });

    return playerBox;
  }

  const retrievePlayerKeys = () => {
    if (annotations.length > 0) {
      return annotations.map((a) => a.PlayerKey);
    } else {
      return 0;
    }
  };

  // For changing video source file
  const handleBrowse = async (event) => {
    try {
      // Get the uploaded file
      const file = event.target.files[0];

      const annotationsResponse = await fetch("/api/annotations/199");
      if (!annotationsResponse.ok) {
        throw new Error("Failed to fetch annotations for video");
      }
      const annotationsJson = await annotationsResponse.json();
      console.log("Retrieved annotations : ", annotationsJson);
      // get rid of duplicates in case database has duplicate values
      const uniqueAnnotations = Array.from(
        new Set(annotationsJson.map((obj) => JSON.stringify(obj))),
        JSON.parse,
      );
      console.log("Unique annotations : ", uniqueAnnotations);
      // setAnnotations(uniqueAnnotations);
      // Transform file into blob URL
      // setAnnotations(tracking);
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
        throw new Error("Failed to fetch video.");
      }
      const videoBlob = await videoResponse.blob();

      const annotationsResponse = await fetch("/api/annotations/199");
      if (!annotationsResponse.ok) {
        throw new Error("Failed to fetch annotations for video");
      }
      const annotationsJson = await annotationsResponse.json();
      // console.log("Retrieved annotations : ", annotationsJson);
      // setAnnotations(annotationsJson);

      setVideoUrl(URL.createObjectURL(videoBlob));
    } catch (error) {
      console.error("Error downloading video:", error);
    } finally {
      setIsDownloadingVideo(false);
    }
  };

  useEffect(() => {
    //rerender the sidebar when another player is chosen
    if (activeObject) {
      let tempList = [];

      playerList.forEach((item) => {
        if (item.props.playerBox.my.key == activeObject.my.key) {
          const boxColor = colorSet.get(activeObject.my.key); //used in 'stroke' property of playerBox

          tempList = tempList.concat([
            <TrackListItemPlayer
              key={item.key}
              playerBox={activeObject}
              name={playerNameMap.get(activeObject.my.key)}
              changeSelection={changeSelection}
              setName={setName}
              blink={blink}
              color={boxColor}
              delete={deletePlayer}
              handleModalOpen={handleModalOpen}
            />,
          ]);
        } else {
          let tempBox = item.props.playerBox;
          tempBox.my.selected = false;
          const boxColor = colorSet.get(tempBox.my.key);

          tempList = tempList.concat([
            <TrackListItemPlayer
              key={item.key}
              playerBox={tempBox}
              name={playerNameMap.get(tempBox.my.key)}
              changeSelection={changeSelection}
              setName={setName}
              blink={blink}
              color={boxColor}
              delete={deletePlayer}
              handleModalOpen={handleModalOpen}
            />,
          ]);
        }
      });
      setPlayerList(tempList);
    }
  }, [activeObject]);

  useEffect(() => {
    // as player name is not contained in the tracking data, set "player{id}" as default name.
    let playerKeys = retrievePlayerKeys();
    let tempMap = new Map();
    for (var i = 0; i < playerKeys.length; i++) {
      let playerName = "player" + playerKeys[i];
      tempMap.set(playerKeys[i], playerName);
    }
    setPlayerNameMap(tempMap);
  }, [annotations]);

  useEffect(() => {
    let canvasWidth = document.body.clientWidth - 300;
    var canvasHeight = 800;
    if (videoElement) {
      canvasHeight = (videoElement.height / videoElement.width) * canvasWidth;
    }
    let initCanvas = new fabric.Canvas("tracking-editor-canvas");
    initCanvas.setHeight(canvasHeight);
    initCanvas.setWidth(canvasWidth);
    setCanvas(initCanvas);
  }, []);

  useEffect(() => {
    const localVideoElement = document.createElement("video");
    localVideoElement.src = videoUrl;
    localVideoElement.muted = true;

    //video size has to be anually set
    localVideoElement.width = 3840;
    localVideoElement.height = 2160;

    setVideoElement(localVideoElement);
  }, [videoUrl]);

  function seededRandom(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function generateColor(value) {
    var r = Math.floor(seededRandom(value) * 256);
    var g = Math.floor(seededRandom(value + 1) * 256);
    var b = Math.floor(seededRandom(value + 2) * 256);
    return { r, g, b };
  }

  function boundingBoxColorSet(annotationList) {
    let uniquePlayerKeys = new Set(
      annotationList.map((item) => item.PlayerKey),
    );
    let colorSet = new Map();

    uniquePlayerKeys.forEach((key) => {
      let color = generateColor(key);
      colorSet.set(key, color);
    });
    return colorSet;
  }

  useEffect(() => {
    if (!videoElement) return;

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

    // https://stackoverflow.com/questions/33834724/draw-video-on-canvas-html5
    const drawVideo = () => {
      // Clear canvas
      // context.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Drawing video
      // context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      var fabricVideo = new fabric.Image(videoElement, {
        left: 0,
        top: 0,
        width: videoElement.width,
        height: videoElement.height,
        selectable: true,
      });

      canvas.setBackgroundImage(fabricVideo, canvas.renderAll.bind(canvas), {
        scaleX: horizontalScalingFactor,
        scaleY: verticalScalingFactor,
      });
    };

    const drawBoundingBoxes = (frameNumber) => {
      let playerIndex = 0;
      deselectAllBox();

      if (!trailsEnabled) {
        canvas.remove(...canvas.getObjects());
      } else {
        //remove everything except the past trails
        canvas.remove(
          ...canvas.getObjects().filter((obj) => obj.type !== "circle"),
        );
        canvas.remove(
          ...canvas
            .getObjects()
            .filter(
              (obj) =>
                frameNumber - obj.properties.frame >= trailFrameNumber ||
                frameNumber - obj.properties.frame < 0,
            ),
        );
        const currentTrailsToDraw = annotations.filter(
          (a) => a.FrameNo == frameNumber,
        );

        currentTrailsToDraw.forEach((a) => {
          const scaledX = a.x1 * horizontalScalingFactor;
          const scaledY = a.y1 * verticalScalingFactor;
          const trailColor = colorSet.get(a.PlayerKey);
          let trail = new fabric.Circle({
            left: scaledX,
            top: scaledY,
            stroke: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
            strokeWidth: 3,
            fill: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
            radius: 5,
            visible: isShowingAnnotation,
          });
          trail.properties = {
            frame: frameNumber,
          };
          trail.selectable = false;
          trail.hasControls = false;
          trail.hasBorders = false;
          trail.hasRotatingPoint = false;
          canvas.add(trail);
        });
      }

      // let boxIndex = annotations.findIndex(element => element.FrameNo == frameNumber);
      // if (boxIndex == -1) {
      //   return;
      // }
      var playersToDraw = canvasBoxes.filter((a) => a.my.frame == frameNumber);
      var tempList = [];
      let runningIndex = 0;

      if (playersToDraw.length > 0) {
        while (playerIndex < playersToDraw.length) {
          canvas.add(playersToDraw[playerIndex]);
          const boxColor = colorSet.get(playersToDraw[playerIndex].my.key); //used in 'stroke' property of playerBox

          tempList = tempList.concat([
            <TrackListItemPlayer
              key={runningIndex++}
              playerBox={playersToDraw[playerIndex]}
              name={playerNameMap.get(playersToDraw[playerIndex].my.key)}
              changeSelection={changeSelection}
              setName={setName}
              blink={blink}
              color={boxColor}
              delete={deletePlayer}
              handleModalOpen={handleModalOpen}
            />,
          ]);
          playerIndex++;
        }
      } else {
        playersToDraw = annotations.filter((a) => a.FrameNo == frameNumber);

        if (playersToDraw.length > 0) {
          //draw boxes
          while (playerIndex < playersToDraw.length) {
            const scaledX =
              playersToDraw[playerIndex].x1 * horizontalScalingFactor;
            const scaledY =
              playersToDraw[playerIndex].y1 * verticalScalingFactor;
            const scaledWidth =
              playersToDraw[playerIndex].w * horizontalScalingFactor;
            const scaledHeight =
              playersToDraw[playerIndex].h * verticalScalingFactor;
            const boxColor = colorSet.get(playersToDraw[playerIndex].PlayerKey); //used in 'stroke' property of playerBox
            let playerBox = new fabric.Rect({
              left: scaledX,
              top: scaledY,
              fill: "rgba(0,0,0,0)",
              width: scaledWidth,
              height: scaledHeight,
              visible: isShowingBox,
              dirty: false,
              stroke: `rgb(${boxColor.r}, ${boxColor.g}, ${boxColor.b})`,

              hasBorders: false, // disables the control borders (the lines connecting the controls the show up when object is selected
              strokeWidth: 2,
              strokeUniform: true, // to keep the bounding box a consisten thickness, independent of its size
              padding: 0, // to make sure the pixel coordinates are correct
              cornerSize: 10,
              cornerStyle: "rect",
              lockRotation: true,
            });
            playerBox.my = {
              selected: false,
              key: playersToDraw[playerIndex].PlayerKey,
              frame: frameNumber,
              //scaling factor when modifying the box
              scaleX: 1,
              scaleY: 1,
              // also connect it to corresponding annotation
            };
            playerBox = defineBoxBehavior(playerBox);
            canvasBoxes.push(playerBox);
            canvas.add(playerBox);

            tempList = tempList.concat([
              <TrackListItemPlayer
                key={runningIndex++}
                playerBox={playerBox}
                color={boxColor}
                name={playerNameMap.get(playersToDraw[playerIndex].PlayerKey)}
                changeSelection={changeSelection}
                setName={setName}
                blink={blink}
                delete={deletePlayer}
                handleModalOpen={handleModalOpen}
              />,
            ]);
            playerIndex++;
          }
        }
      }
      setPlayerList(tempList);
      canvas.renderAll();
    };

    const updateCanvas = () => {
      const currentFrameNumber = getCurrentTimestampFrame();
      drawVideo();
      drawBoundingBoxes(currentFrameNumber);
    };

    const handleAnimationFrame = () => {
      if (!videoElement || videoElement.paused || videoElement.ended) {
        console.log(
          "Video element either null, paused : ",
          videoElement.paused,
          " or ended : ",
          videoElement.ended,
        );
        return;
      }

      const currentFrameNumber = getCurrentTimestampFrame();
      if (currentFrameNumber != previousFrameNumber) {
        setFrameNumber(currentFrameNumber);
        setTimestamp(videoElement.currentTime);

        const currentProgress =
          (videoElement.currentTime / videoElement.duration) * 100;
        setProgress(currentProgress);
        previousFrameNumber = currentFrameNumber;
        updateCanvas();
      }

      requestAnimationFrame(handleAnimationFrame);
    };

    const onPlay = () => {
      requestAnimationFrame(handleAnimationFrame);
    };

    const onCanPlay = () => {
      updateCanvas();
    };

    const onSeek = () => {
      console.log("Seeked");
      updateCanvas();
    };

    videoElement.addEventListener("play", onPlay);
    videoElement.addEventListener("canplay", onCanPlay);
    videoElement.addEventListener("seeked", onSeek);
    videoElement.addEventListener("seeking", () => {
      console.log("Seeking");
    });
    videoElement.addEventListener("stalled", () => {
      console.log("Stalled");
    });
    videoElement.addEventListener("loadeddata", () => {
      console.log("Loaded data");
    });
    videoElement.addEventListener("waiting", () => {
      console.log("Waiting");
    });

    return () => {
      videoElement.removeEventListener("play", onPlay);
      videoElement.removeEventListener("canplay", onCanPlay);
      videoElement.removeEventListener("seeked", onSeek);
    };
  }, [
    videoElement,
    isShowingBox,
    playerNameMap,
    trailFrameNumber,
    trailsEnabled,
  ]);

  //triggered when new player is added, or when merge or swap happens
  useEffect(() => {
    //remove old canvas objects
    canvas.remove(...canvas.getObjects());

    const horizontalScalingFactor = canvas.width / 3840;
    const verticalScalingFactor = canvas.height / 2160;
    let playerIndex = 0;
    var tempList = [];
    let runningIndex = 0;

    if (trailsEnabled) {
      //all trails have to be redrawn in this case
      trailsFullRedraw(
        canvas,
        annotations,
        frameNumber,
        trailFrameNumber,
        isShowingAnnotation,
        colorSet,
        horizontalScalingFactor,
        verticalScalingFactor,
      );
    }

    //same thing we do in drawBoundingBoxes..
    if (annotations.length > 0) {
      var playersToDraw = annotations.filter((a) => a.FrameNo == frameNumber);

      if (playersToDraw.length > 0) {
        //draw boxes
        while (playerIndex < playersToDraw.length) {
          const scaledX =
            playersToDraw[playerIndex].x1 * horizontalScalingFactor;
          const scaledY = playersToDraw[playerIndex].y1 * verticalScalingFactor;
          const scaledWidth =
            playersToDraw[playerIndex].w * horizontalScalingFactor;
          const scaledHeight =
            playersToDraw[playerIndex].h * verticalScalingFactor;
          const boxColor = colorSet.get(playersToDraw[playerIndex].PlayerKey); //used in 'stroke' property of playerBox

          let playerBox = new fabric.Rect({
            left: scaledX,
            top: scaledY,
            fill: "rgba(0,0,0,0)",
            width: scaledWidth,
            height: scaledHeight,
            visible: isShowingBox,
            dirty: false,
            stroke: `rgb(${boxColor.r}, ${boxColor.g}, ${boxColor.b})`,
            hasBorders: false, // disables the control borders (the lines connecting the controls the show up when object is selected
            strokeWidth: 2,
            strokeUniform: true, // to keep the bounding box a consisten thickness, independent of its size
            padding: 0, // to make sure the pixel coordinates are correct
            cornerStyle: "rect",
            lockRotation: true,
          });
          playerBox.my = {
            selected: false,
            key: playersToDraw[playerIndex].PlayerKey,
            frame: frameNumber,
            //scaling factor when modifying the box
            scaleX: 1,
            scaleY: 1,
            // also connect it to corresponding annotation
          };
          playerBox = defineBoxBehavior(playerBox);
          canvasBoxes.push(playerBox);
          canvas.add(playerBox);

          tempList = tempList.concat([
            <TrackListItemPlayer
              key={runningIndex++}
              playerBox={playerBox}
              name={playerNameMap.get(playersToDraw[playerIndex].PlayerKey)}
              changeSelection={changeSelection}
              setName={setName}
              blink={blink}
              delete={deletePlayer}
              color={boxColor}
              handleModalOpen={handleModalOpen}
            />,
          ]);
          playerIndex++;
        }
        setPlayerList(tempList);
      }
    }
  }, [playerNameMap, trailsEnabled, trailFrameNumber]);

  const handleKeyDown = (event) => {
    switch (event.keyCode) {
      case 74: // j
        handlePreviousChunk();
        break;
      case 75: // k
        handlePlayPause();
        break;
      case 76: // l
        handleNextChunk();
        break;
      case 188: // ,
        handlePreviousFrame();
        break;
      case 190: // .
        handleNextFrame();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const getCurrentTimestampFrame = () => {
    // First frame is frame 0
    return Math.floor(videoElement.currentTime / frameDuration);
  };

  const getReferenceTimestampForFrame = (n) => {
    return n * frameDuration + frameDuration / 3;
  };

  const updateTimestamp = (newTimestamp) => {
    const newFrameNumber = Math.floor(newTimestamp / frameDuration);
    setTimestamp(newTimestamp);
    setFrameNumber(newFrameNumber);
  };

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
  };

  const handleNextChunk = () => {
    const newTimestamp = Math.min(
      videoElement.duration,
      videoElement.currentTime + 6,
    );
    videoElement.currentTime = newTimestamp;
    updateTimestamp(newTimestamp);
  };

  const handlePlayPause = () => {
    if (videoElement && videoElement.readyState != 0 && !videoElement.ended) {
      if (videoElement.paused) {
        setIsPlaying(true);
        videoElement.play();
      } else {
        setIsPlaying(false);
        videoElement.pause();
        updateSidebar();
      }
    }
  };

  // Seeking

  const handleSeekStart = () => {
    if (videoElement && !videoElement.ended && !videoElement.paused) {
      wasVideoPlaying = true;
      videoElement.pause();
    } else {
      wasVideoPlaying = false;
    }
  };

  const handleSeekPercent = (value) => {
    setProgress(value);
    const newTimestamp = (value / 100) * videoElement.duration;
    videoElement.currentTime = newTimestamp;
    updateTimestamp(newTimestamp);
  };

  const handleSeekEnd = () => {
    updateSidebar();
    if (wasVideoPlaying) {
      videoElement.play();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toFixed(5).padStart(2, "0")}`;
  };

  function handleDisplayingBox() {
    if (isShowingBox) {
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
    if (isShowingAnnotation) {
      setIsShowingAnnotation(false);
    } else {
      setIsShowingAnnotation(true);
    }
  }

  function handleAddPlayer() {
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
      }),
    );
  }

  const handleEnablingTrails = () => {
    if (trailsEnabled) {
      setTrailsEnabled(false);
    } else {
      setTrailsEnabled(true);
    }
  };

  return (
    <div>
      <MergeAndSwapModal
        playerChosenInList={playerChosenInList}
        playerNameMap={playerNameMap}
        mergeModalState={mergeModalState}
        handleClose={handleModalClose}
        swapPlayerData={swapPlayerData}
        mergePlayerData={mergePlayerData}
      />
      <div className="controls">
        <div id="tools-container">
          <div>&nbsp;&nbsp;Show Annotation: &nbsp;</div>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={isShowingAnnotation}
                  onChange={handleDisplayingAnnotation}
                />
              }
            />
          </FormGroup>
          <div>&nbsp;&nbsp;Show Player Box: &nbsp;</div>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch checked={isShowingBox} onChange={handleDisplayingBox} />
              }
            />
          </FormGroup>
          <Button variant="contained" onClick={handleAddPlayer}>
            Add player
          </Button>
          <Typography sx={{ marginLeft: "10px" }}>Trails </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={trailsEnabled}
                  disabled={!videoElement?.paused}
                  onChange={handleEnablingTrails}
                />
              }
            />
          </FormGroup>
          <Typography sx={{ marginLeft: "10px" }}>Trail frames: </Typography>

          <TextField
            sx={{ bgcolor: "white", marginLeft: "10px", width: "80px" }}
            value={trailFrameNumber}
            type="number"
            onChange={(event, val) => setTrailFrameNumber(event.target.value)}
          />
        </div>
      </div>
      <input type="file" onChange={handleBrowse} />
      <button onClick={handleDownload} disabled={isDownloadingVideo}>
        Download video
      </button>
      <div id="canvas-container">
        <canvas
          ref={canvasRef}
          className="canvas"
          id="tracking-editor-canvas"
          width="1920"
          height="1080"
          style={{ display: "block", width: "100%", height: "auto" }}
        ></canvas>
        {/* <div className="sidebar">sidebar is here</div> */}
        <TrackList>{playerList}</TrackList>
      </div>
      <div className="controls">
        <SeekBar
          onSeekStart={handleSeekStart}
          onSeekPercent={handleSeekPercent}
          onSeekEnd={handleSeekEnd}
          progress={progress}
        />
        <div id="buttons-container">
          <button className="icon-button" onClick={handlePreviousFrame}>
            <BackwardStepIcon className="icon" />
          </button>
          <span id="frame-number-display">Frame {frameNumber}</span>
          <button className="icon-button" onClick={handleNextFrame}>
            <ForwardStepIcon className="icon" />
          </button>
          <button className="icon-button" onClick={handlePlayPause}>
            {isPlaying ? (
              <PauseIcon className="icon" />
            ) : (
              <PlayIcon className="icon" />
            )}
          </button>
          <span id="timestamp-display">
            {formatTime(timestamp)} / {formatTime(videoElement?.duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewTrackingEditor;
