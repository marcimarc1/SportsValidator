import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router";
import { ReactComponent as PlayIcon } from "../../../icons/play.svg";
import { ReactComponent as PauseIcon } from "../../../icons/pause.svg";
import { ReactComponent as ForwardStepIcon } from "../../../icons/forward-step.svg";
import { ReactComponent as BackwardStepIcon } from "../../../icons/backward-step.svg";
import { useLocation } from "react-router-dom";
import {
  parseProcessedPlayers,
  parseProcessedBallTracks,
} from "../../../utils/csvParser";
import {
  convertBoxToAnnotation,
  convertAnnotationToBox,
  convertAnnotationBallToBox,
} from "../../../utils/AnnotationBoxConverter";
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
  Box,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";

import TrackList from "../newTrackingEditor/TrackList";
import TrackListItemPlayer from "./TrackListItemPlayer";
import TrackListItemBall from "./TrackListItemBall";
import MergeAndSwapModal from "./MergeAndSwapModal";
import ApplyHomographyModal from "./ApplyHomographyModal";
import {
  trailsFullRedraw,
  drawFieldPoints,
  defineTrailBehaviour,
} from "../../../utils/canvasUtils";
import { multiPlayerMerge } from "../../../utils/validation";
import { DownloadButton } from "./DownloadButton";
import { parseLogFile } from "../../../utils/logFileParser";
import Slider from "@mui/material/Slider";
import { FieldDetailsButton } from "./field/FieldDetailsButton";
// TODO Take a video_id instead and have an endpoint on the server where we supply a video_id and get the corresponding video
const NewTrackingEditor = () => {
  const location = useLocation();
  const {
    processedPlayers,
    video,
    processedBallTracks,
    homographies,
    log,
    fieldSize,
  } = location.state || {};
  // homographies and log are not being used. Logic will be implemented in the future.
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
  const [playerList, setPlayerList] = useState([]); //list of player TrackListItemPlayers
  const [canvasBoxes, setCanvasBoxes] = useState([]); //list of canvas boxes for player
  const [playerNameMap, setPlayerNameMap] = useState(new Map()); //map of playerkey to playername
  const [activeObject, setActiveObject] = useState(null);
  const [colorSet, setColorSet] = useState(new Map()); //map of playerkey to color
  const [trailsEnabled, setTrailsEnabled] = useState(true);
  const [trailFrameNumber, setTrailFrameNumber] = useState(50);
  const [mergeModalState, setMergeModalState] = useState(false);
  const [playerChosenInList, setPlayerChosenInList] = useState("");
  const [showField, setShowField] = useState(true);
  const [editField, setEditField] = useState(false);
  const logFile = parseLogFile(log);
  const [selectedTrails, setSelectedTrails] = useState(new Set());
  const [trailSize, setTrailSize] = useState(50);
  const [drawInField, setDrawInField] = useState(false);
  const [showApplyHomographyModal, setShowApplyHomographyModal] =
    useState(false);
  const [annotationBallTracks, setAnnotationBallTracks] = useState([]);
  const [ballList, setBallList] = useState([]); //list of ball TrackListItemBall
  const [canvasBoxesBall, setCanvasBoxesBall] = useState([]); //list of canvas boxes for ball
  const [ballNameMap, setBallNameMap] = useState(new Map()); //map of ballkey to ballname
  const [colorSetBall, setColorSetBall] = useState(new Map()); //map of ballkey to color
  const [ballChosenInList, setBallChosenInList] = useState(""); //ball which is selected in sidebar

  const handleModalOpen = (playerInList) => {
    setPlayerChosenInList(playerInList);
    setMergeModalState(true);
  };

  const handleModalClose = () => {
    setMergeModalState(false);
  };

  const handleMultiSelectMerge = () => {
    console.log("Multiplayer merge");
    console.log(Array.from(selectedTrails));
    multiPlayerMerge(
      Array.from(selectedTrails),
      annotations,
      setAnnotations,
      playerNameMap,
      setPlayerNameMap,
    );
    setSelectedTrails(new Set());
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
      //this log is important for the test
      //test suite: describe data fetching
      //test: it receives correct annotation
      console.log("retrieved annotation:", parsedData[0]);
      // Setting the color set based on the parsed data
      setColorSet(boundingBoxColorSet(parsedData));

      let playerKeys = parsedData.map((a) => a.PlayerKey);
      let tempMap = new Map();
      playerKeys.forEach((key) => {
        let playerName = "player" + key;
        tempMap.set(key, playerName);
      });
      setPlayerNameMap(tempMap);
    }

    if (processedBallTracks) {
      const parsedBallTracks = parseProcessedBallTracks(processedBallTracks);
      setAnnotationBallTracks(parsedBallTracks);
      //TODO: add Test for ball tracks
      console.log("retrieved ball tracks:", parsedBallTracks[0]);
      setColorSetBall(boundingBoxColorSetBall(parsedBallTracks));

      let ballKeys = parsedBallTracks.map((a) => a.trackNo);
      let tempMap = new Map();
      ballKeys.forEach((key) => {
        let ballName = "ball" + key;
        tempMap.set(key, ballName);
      });
      setBallNameMap(tempMap);
    }
  }, [processedPlayers, processedBallTracks, location.state]);

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

    tempList = [];
    runningIndex = 0;
    let ballBoxes = canvasBoxesBall.filter(
      (box) => box.my.frame == getCurrentTimestampFrame(),
    );
    ballBoxes.forEach((box) => {
      const boxColor = colorSetBall.get(box.my.key);

      tempList = tempList.concat([
        <TrackListItemBall
          key={runningIndex++}
          ballBox={box}
          name={ballNameMap.get(box.my.key)}
          changeSelection={changeSelection}
          setName={setNameBall}
          blink={blink}
          delete={deleteBall}
          color={boxColor}
          handleModalOpen={handleModalOpen}
        />,
      ]);
      runningIndex++;
    });
    setBallList(tempList);
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
    setAnnotations(annotations.filter((a) => a.PlayerKey != playerBox.my.key));
    setCanvasBoxes(canvasBoxes.filter((a) => a.my.key != playerBox.my.key));

    let newPlayerNameMap = new Map(playerNameMap);
    newPlayerNameMap.delete(playerBox.my.key);
    setPlayerNameMap(newPlayerNameMap);

    updateSidebar();
    canvas.discardActiveObject();
    canvas.remove(playerBox);
    canvas.requestRenderAll();
  }

  function deleteBall(ballBox) {
    canvas.setActiveObject(ballBox);
    setActiveObject(ballBox);
    console.log(annotationBallTracks);
    setAnnotationBallTracks(
      annotationBallTracks.filter((a) => a.trackNo != ballBox.my.key),
    );
    setCanvasBoxesBall(
      canvasBoxesBall.filter((a) => a.my.key != ballBox.my.key),
    );

    let newBallNameMap = new Map(ballNameMap);
    newBallNameMap.delete(ballBox.my.key);
    setBallNameMap(newBallNameMap);

    updateSidebar();
    canvas.discardActiveObject();
    canvas.remove(ballBox);
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

  function setNameBall(ballBox, name) {
    fabric.Object.prototype.objectCaching = false;
    let ballIndex = ballBox.my.key;
    ballNameMap.set(ballIndex, name);
    canvas.requestRenderAll();
    // TODO BACKEND
    // update data when leaving the page
    // the modified data is stored in canvasBoxes array
  }

  function boxInCanvas(boxToCheck) {
    //check if the box is in the canvas
    canvasBoxes.forEach((box) => {
      if (box == boxToCheck) {
        return true;
      }
    });
    canvasBoxesBall.forEach((box) => {
      if (box == boxToCheck) {
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
    canvasBoxesBall.forEach((box) => {
      box.my.selected = false;
    });
  }

  function selectBBox(box) {
    canvas.setActiveObject(box);
    setActiveObject(box);
    box.my.selected = true;
  }

  function changeSelection(box) {
    if (boxInCanvas(box)) {
      //deselect all active boxes
      deselectAllBox();
      //set the new active box
      selectBBox(box);
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
      modified: () => {
        var boundingRect = playerBox.getBoundingRect();
        var scaleX = playerBox.scaleX; // Save current scale factors
        var scaleY = playerBox.scaleY;
        // Calculate actual width and height based on scale factors
        //when scaling the box, only scaleX and scaleY change, while width and height not
        var actualWidth = (boundingRect.width - playerBox.strokeWidth) / scaleX;
        var actualHeight =
          (boundingRect.height - playerBox.strokeWidth) / scaleY;
        playerBox.left = boundingRect.left;
        playerBox.top = boundingRect.top;
        playerBox.width = actualWidth;
        playerBox.height = actualHeight;

        const horizontalScalingFactor = canvas.width / 3840;
        const verticalScalingFactor = canvas.height / 2160;
        const modifiedAnnotation = convertBoxToAnnotation(
          playerBox,
          horizontalScalingFactor,
          verticalScalingFactor,
        );
        console.log(modifiedAnnotation);
        const annotationToReplace = annotations.findIndex(
          (a) =>
            a.FrameNo == playerBox.my.frame && a.PlayerKey == playerBox.my.key,
        );
        if (annotationToReplace == -1) {
          console.error(
            "the modified bounding box doesn't exist in annotations.",
          );
        }
        annotations.splice(annotationToReplace, 1, modifiedAnnotation);
        canvas.renderAll();
      },
    });

    return playerBox;
  }

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

  useEffect(() => {
    //rerender the sidebar when another item is selected
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

      tempList = [];
      ballList.forEach((item) => {
        if (item.props.ballBox.my.key == activeObject.my.key) {
          const boxColor = colorSetBall.get(activeObject.my.key);
          tempList = tempList.concat([
            <TrackListItemBall
              key={item.key}
              ballBox={activeObject}
              name={ballNameMap.get(activeObject.my.key)}
              changeSelection={changeSelection}
              setName={setNameBall}
              blink={blink}
              color={boxColor}
              delete={deleteBall}
              handleModalOpen={handleModalOpen}
            />,
          ]);
        } else {
          let tempBox = item.props.ballBox;
          tempBox.my.selected = false;
          const boxColor = colorSetBall.get(tempBox.my.key);
          tempList = tempList.concat([
            <TrackListItemBall
              key={item.key}
              ballBox={tempBox}
              name={ballNameMap.get(tempBox.my.key)}
              changeSelection={changeSelection}
              setName={setNameBall}
              blink={blink}
              color={boxColor}
              delete={deleteBall}
              handleModalOpen={handleModalOpen}
            />,
          ]);
        }
      });
      setBallList(tempList);
    }
  }, [activeObject]);

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
  function boundingBoxColorSetBall(annotationBallList) {
    let uniqueBallKeys = new Set(
      annotationBallList.map((item) => item.trackNo),
    );
    let colorSet = new Map();

    uniqueBallKeys.forEach((key) => {
      let color = generateColor(key);
      colorSet.set(key, color);
    });
    return colorSet;
  }

  function generatePoster(videoElement) {
    //if video cannot be played, simply return
    if (videoElement.readyState == 0) return;
    //get video content of first frame
    videoElement.currentTime = frameDuration;
    const poster = new fabric.Image(videoElement, {
      left: 0,
      top: 0,
      width: videoElement.width,
      height: videoElement.height,
      selectable: true,
    });
    videoElement.currentTime = 0;
    return poster;
  }

  const isInField = (inField) => {
    return inField === true || inField === null;
  };

  // https://stackoverflow.com/questions/33834724/draw-video-on-canvas-html5
  const drawVideo = () => {
    // Clear canvas
    // context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Drawing video
    // context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const horizontalScalingFactor = canvas.width / 3840;
    const verticalScalingFactor = canvas.height / 2160;
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
    const horizontalScalingFactor = canvas.width / 3840;
    const verticalScalingFactor = canvas.height / 2160;
    deselectAllBox();

    if (!trailsEnabled) {
      canvas.remove(...canvas.getObjects());
    } else {
      //remove everything except the past trails
      canvas.remove(
        ...canvas.getObjects().filter((obj) => obj.type !== "circle"),
      );
      //remove trails that are too old
      canvas.remove(
        ...canvas
          .getObjects()
          .filter(
            (obj) =>
              frameNumber - obj.properties.frame >= trailFrameNumber ||
              frameNumber - obj.properties.frame < 0,
          ),
      );
      const currentTrailsToDraw = drawInField
        ? annotations.filter(
            (a) => a.FrameNo === frameNumber && isInField(a.in_field),
          )
        : annotations.filter((a) => a.FrameNo === frameNumber);

      currentTrailsToDraw.forEach((a) => {
        const scaledX = a.x1 * horizontalScalingFactor;
        const scaledY = a.y1 * verticalScalingFactor;
        const scaledWidth = a.w * horizontalScalingFactor;
        const scaledHeight = a.h * verticalScalingFactor;
        const radius =
          scaledWidth < scaledHeight ? scaledWidth / 4 : scaledHeight / 4;
        const trailColor = colorSet.get(a.PlayerKey);
        let trail = new fabric.Circle({
          left: scaledX,
          top: scaledY,
          stroke: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
          strokeWidth: 3,
          fill: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
          radius: (radius * trailSize) / 50,
          visible: isShowingAnnotation,
        });
        trail.properties = {
          frame: frameNumber,
          playerKey: a.PlayerKey,
        };
        trail.hasRotatingPoint = false;
        defineTrailBehaviour(trail, setSelectedTrails);
        canvas.add(trail);
      });

      const currentBallTrailsToDraw = annotationBallTracks.filter(
        (a) => a.FrameNo === frameNumber,
      );

      currentBallTrailsToDraw.forEach((a) => {
        const scaledX = a.x1 * horizontalScalingFactor;
        const scaledY = a.y1 * verticalScalingFactor;
        const scaledWidth = 15 * horizontalScalingFactor; //TODO think about ballsize to be not fixed
        const scaledHeight = 15 * verticalScalingFactor;
        const radius =
          scaledWidth < scaledHeight ? scaledWidth / 4 : scaledHeight / 4;
        const trailColor = colorSetBall.get(a.trackNo);
        let trail = new fabric.Circle({
          left: scaledX,
          top: scaledY,
          stroke: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
          strokeWidth: 3,
          fill: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
          radius: (radius * trailSize) / 50,
          visible: isShowingAnnotation,
        });
        trail.properties = {
          frame: frameNumber,
          ballKey: a.trackNo,
        };
        trail.hasRotatingPoint = false;
        defineTrailBehaviour(trail, setSelectedTrails);
        canvas.add(trail);
      });
    }

    var boundingBoxesToDraw = drawInField
      ? canvasBoxes.filter(
          (a) => a.my.frame === frameNumber && isInField(a.my.in_field),
        )
      : canvasBoxes.filter((a) => a.my.frame === frameNumber);

    var tempList = [];
    let runningIndex = 0;

    if (boundingBoxesToDraw.length > 0) {
      boundingBoxesToDraw.forEach((boundingBox) => {
        canvas.add(boundingBox);
        const boxColor = colorSet.get(boundingBox.my.key); //used in 'stroke' property of playerBox

        tempList = tempList.concat([
          <TrackListItemPlayer
            key={runningIndex++}
            playerBox={boundingBox}
            name={playerNameMap.get(boundingBox.my.key)}
            changeSelection={changeSelection}
            setName={setName}
            blink={blink}
            color={boxColor}
            delete={deletePlayer}
            handleModalOpen={handleModalOpen}
          />,
        ]);
      });
    } else {
      boundingBoxesToDraw = drawInField
        ? annotations.filter(
            (a) => a.FrameNo === frameNumber && isInField(a.in_field),
          )
        : annotations.filter((a) => a.FrameNo === frameNumber);

      if (boundingBoxesToDraw.length > 0) {
        boundingBoxesToDraw.forEach((boundingBox) => {
          const boxColor = colorSet.get(boundingBox.PlayerKey); //used in 'stroke' property of playerBox
          let playerBox = convertAnnotationToBox(
            boundingBox,
            horizontalScalingFactor,
            verticalScalingFactor,
          );
          playerBox.visible = isShowingBox;
          playerBox.stroke = `rgb(${boxColor.r}, ${boxColor.g}, ${boxColor.b})`;
          playerBox.setControlVisible("mtr", false);
          playerBox = defineBoxBehavior(playerBox);
          canvas.add(playerBox);

          tempList = tempList.concat([
            <TrackListItemPlayer
              key={runningIndex++}
              playerBox={playerBox}
              color={boxColor}
              name={playerNameMap.get(boundingBox.PlayerKey)}
              changeSelection={changeSelection}
              setName={setName}
              blink={blink}
              delete={deletePlayer}
              handleModalOpen={handleModalOpen}
            />,
          ]);
        });
      }
    }

    setPlayerList(tempList);

    var boundingBoxesToDrawBall = canvasBoxesBall.filter(
      (a) => a.my.frame === frameNumber,
    );
    tempList = [];
    runningIndex = 0;
    if (boundingBoxesToDrawBall.length > 0) {
      boundingBoxesToDrawBall.forEach((boundingBox) => {
        canvas.add(boundingBox);
        const boxColor = colorSetBall.get(boundingBox.my.key);
        tempList = tempList.concat([
          <TrackListItemBall
            key={runningIndex++}
            ballBox={boundingBox}
            name={ballNameMap.get(boundingBox.my.key)}
            changeSelection={changeSelection}
            setName={setNameBall}
            blink={blink}
            color={boxColor}
            handleModalOpen={handleModalOpen}
            delete={deleteBall}
          />,
        ]);
      });
    } else {
      boundingBoxesToDrawBall = annotationBallTracks.filter(
        (a) => a.FrameNo === frameNumber,
      );
      if (boundingBoxesToDrawBall.length > 0) {
        //draw boxes
        boundingBoxesToDrawBall.forEach((boundingBox) => {
          const boxColor = colorSetBall.get(boundingBox.trackNo);
          let ballBox = convertAnnotationBallToBox(
            boundingBox,
            horizontalScalingFactor,
            verticalScalingFactor,
          );
          ballBox.visible = isShowingBox;
          ballBox.stroke = `rgb(${boxColor.r}, ${boxColor.g}, ${boxColor.b})`;
          ballBox.setControlVisible("mtr", false);
          ballBox = defineBoxBehavior(ballBox); //TODO: implement this function
          canvas.add(ballBox);

          tempList = tempList.concat([
            <TrackListItemBall
              key={runningIndex++}
              ballBox={ballBox}
              color={boxColor}
              name={ballNameMap.get(boundingBox.trackNo)}
              changeSelection={changeSelection}
              setName={setNameBall}
              blink={blink}
              handleModalOpen={handleModalOpen}
              delete={deleteBall}
            />,
          ]);
        });
      }
    }
    setBallList(tempList);

    canvas.remove(
      ...canvas.getObjects().filter((obj) => obj.properties?.type === "field"),
    );

    if (showField) {
      drawField();
    }

    if (isShowingBox) {
      boundingBoxesToDraw.forEach((a) => {
        const fontSize = 12;
        const scaledX = a.x1 * horizontalScalingFactor;
        const scaledY = a.y1 * verticalScalingFactor - fontSize;
        const playerKey = a.PlayerKey.toString();
        let boxKey = new fabric.Text(playerKey, {
          left: scaledX,
          top: scaledY,
          fontSize: fontSize,
        });
        canvas.add(boxKey);
      });
    }
  };

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
    let previousFrameNumber = 0;

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
        //problematic, empty playerlist when video paused
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
    };

    const onSeeking = () => {
      console.log("Seeking");
    };

    const onStalled = () => {
      console.log("Stalled");
    };

    const onLoadedData = () => {
      console.log("Loaded data");
      const poster = generatePoster(videoElement);
      if (poster) {
        canvas.add(poster);
      }
    };

    const onWaiting = () => {
      console.log("Waiting");
    };

    videoElement.addEventListener("play", onPlay);
    videoElement.addEventListener("canplay", onCanPlay);
    videoElement.addEventListener("seeked", onSeek);
    videoElement.addEventListener("seeking", onSeeking);
    videoElement.addEventListener("stalled", onStalled);
    videoElement.addEventListener("loadeddata", onLoadedData);
    videoElement.addEventListener("waiting", onWaiting);

    return () => {
      videoElement.removeEventListener("play", onPlay);
      videoElement.removeEventListener("canplay", onCanPlay);
      videoElement.removeEventListener("seeked", onSeek);
      videoElement.removeEventListener("seeking", onSeeking);
      videoElement.removeEventListener("stalled", onStalled);
      videoElement.removeEventListener("loadeddata", onLoadedData);
      videoElement.removeEventListener("waiting", onWaiting);
    };
  }, [
    annotations,
    videoElement,
    isShowingBox,
    playerNameMap,
    trailFrameNumber,
    trailsEnabled,
    showField,
    trailSize,
    drawInField,
  ]);

  //triggered when user clicks on the video progress bar to change the video time
  useEffect(() => {
    if (!videoElement) return;

    if (videoElement.seeking && trailsEnabled) {
      trailsFullRedraw(
        canvas,
        annotations,
        frameNumber,
        trailFrameNumber,
        isShowingAnnotation,
        colorSet,
        canvas.width / 3840,
        canvas.height / 2160,
        setSelectedTrails,
        trailSize,
      );
    }
  }, [videoElement?.seeking]);

  //triggered when new player is added, or when merge or swap happens //TODO: remember to check
  useEffect(() => {
    //remove old canvas objects
    canvas.remove(...canvas.getObjects());

    const horizontalScalingFactor = canvas.width / 3840;
    const verticalScalingFactor = canvas.height / 2160;
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
        setSelectedTrails,
        trailSize,
      );
    }

    //same thing we do in drawBoundingBoxes..
    if (annotations.length > 0) {
      var boundingBoxesToDraw = drawInField
        ? annotations.filter(
            (a) => a.FrameNo === frameNumber && isInField(a.in_field),
          )
        : annotations.filter((a) => a.FrameNo === frameNumber);

      if (boundingBoxesToDraw.length > 0) {
        //draw boxes
        boundingBoxesToDraw.forEach((boundingBox) => {
          const boxColor = colorSet.get(boundingBox.PlayerKey); //used in 'stroke' property of playerBox
          let playerBox = convertAnnotationToBox(
            boundingBox,
            horizontalScalingFactor,
            verticalScalingFactor,
          );
          playerBox.visible = isShowingBox;
          playerBox.stroke = `rgb(${boxColor.r}, ${boxColor.g}, ${boxColor.b})`;
          playerBox.setControlVisible("mtr", false);
          playerBox = defineBoxBehavior(playerBox);
          canvas.add(playerBox);

          tempList = tempList.concat([
            <TrackListItemPlayer
              key={runningIndex++}
              playerBox={playerBox}
              name={playerNameMap.get(boundingBox.PlayerKey)}
              changeSelection={changeSelection}
              setName={setName}
              blink={blink}
              delete={deletePlayer}
              color={boxColor}
              handleModalOpen={handleModalOpen}
            />,
          ]);
        });
        setPlayerList(tempList);
      }
    }
  }, [
    annotations,
    playerNameMap,
    trailsEnabled,
    trailSize,
    trailFrameNumber,
    drawInField,
  ]);

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
      deleteFieldDrawing();
      setFrameNumber(nextFrame);
      setTimestamp(referenceTimestamp);
      drawField();
    }
  };

  const handlePreviousFrame = () => {
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
        in_field: true,
      }),
    );
    setPlayerNameMap(
      new Map(playerNameMap.set(newPlayerKey, "player" + newPlayerKey)),
    );
  }

  const handleEnablingTrails = () => {
    if (trailsEnabled) {
      setTrailsEnabled(false);
    } else {
      setTrailsEnabled(true);
    }
  };

  const handleEnablingField = () => {
    if (showField) {
      setShowField(false);
      setEditField(false);
      deleteFieldDrawing();
    } else {
      setShowField(true);
      drawField();
    }
  };

  const handleEnablingEditField = () => {
    if (editField) {
      setEditField(false);
    } else {
      setEditField(true);
    }
  };

  useEffect(() => {
    canvas.getObjects().forEach((obj) => {
      if (obj.properties?.type === "fieldPoint") {
        obj.set({ selectable: editField });
      }
    });
  }, [editField, canvas]);

  const deleteFieldDrawing = () => {
    canvas.remove(
      ...canvas
        .getObjects()
        .filter(
          (obj) =>
            obj.properties?.type === "field" ||
            obj.properties?.type === "fieldPoint",
        ),
    );
  };

  const drawField = () => {
    console.log("drawing field", "frameNumber", getCurrentTimestampFrame());
    // var homographyToApply = editedHomographies ? editedHomographies[getCurrentTimestampFrame()] : homographies[getCurrentTimestampFrame()];
    // console.log("homography to apply", homographyToApply);
    //log the field size
    if (!homographies) {
      return;
    }
    drawFieldPoints(
      canvas,
      getCurrentTimestampFrame(),
      homographies,
      canvas.width / 3840,
      canvas.height / 2160,
      logFile.Sport,
      fieldSize?.length,
      fieldSize?.width,
      videoElement,
    );
  };

  const handleSwitchingTrailSize = (event) => {
    setTrailSize(event.target.value);
  };

  const handleApplyHomography = () => {
    const frameNumber = getCurrentTimestampFrame();
    deleteFieldDrawing();
    drawField();
    setShowApplyHomographyModal(false);
    handleEnablingEditField();
    setIsPlaying(true);
    videoElement.play();
  };

  const handleContinueWithoutApplyingHomographies = async () => {
    console.log("Continuing without applying homographies");
    setShowApplyHomographyModal(false);
    handleEnablingEditField();
    videoElement.play();
    setIsPlaying(true);
  };

  return (
    <div>
      <ApplyHomographyModal
        showApplyHomographyModal={showApplyHomographyModal}
        handleClose={() => setShowApplyHomographyModal(false)}
        handleApply={() => handleApplyHomography()}
        handleContinueWithoutApplying={() =>
          handleContinueWithoutApplyingHomographies()
        }
      />
      <MergeAndSwapModal
        playerChosenInList={playerChosenInList}
        playerNameMap={playerNameMap}
        setPlayerNameMap={setPlayerNameMap}
        annotations={annotations}
        setAnnotations={setAnnotations}
        frameNumber={frameNumber}
        mergeModalState={mergeModalState}
        handleClose={handleModalClose}
      />
      <div className="controls">
        <Box id="tools-container" sx={{ display: "flex", gap: "10px" }}>
          <div>Show Annotation:</div>

          <Switch
            color="default"
            checked={isShowingAnnotation}
            onChange={handleDisplayingAnnotation}
          />

          <div>Show Player Box:</div>

          <Switch
            color="default"
            checked={isShowingBox}
            onChange={handleDisplayingBox}
          />
          <div>Show In Field:</div>

          <Switch
            color="default"
            checked={drawInField}
            disabled={!videoElement?.paused}
            onChange={() => setDrawInField(!drawInField)}
          />

          <Button
            data-testid="add-player-button"
            variant="contained"
            onClick={handleAddPlayer}
            sx={{
              backgroundColor: "#BBC3C9 !important",
              color: "#1b1f22 !important",
            }}
          >
            Add player
          </Button>
          <Button
            data-testid="merge-button"
            variant="contained"
            onClick={handleMultiSelectMerge}
            sx={{
              backgroundColor: "#BBC3C9 !important",
              color: "#1b1f22 !important",
            }}
          >
            Merge
          </Button>
          <Typography sx={{ marginLeft: "10px" }}>Trails </Typography>

          <Switch
            color="default"
            checked={trailsEnabled}
            disabled={!videoElement?.paused}
            onChange={handleEnablingTrails}
          />
          <Typography>Trails Size </Typography>
          <Slider
            sx={{
              width: "60px",
              "& .MuiSlider-thumb": {
                color: "white",
              },
              "& .MuiSlider-track": {
                color: "var(--accent)",
              },
              "& .MuiSlider-rail": {
                color: "var(--main-bg)",
              },
            }}
            value={trailSize}
            disabled={!videoElement?.paused}
            onChange={handleSwitchingTrailSize}
            min={10}
            max={100}
            step={10}
            aria-label="Default"
            valueLabelDisplay="auto"
          />
          <Typography sx={{ marginLeft: "10px" }}>Trail frames: </Typography>
          <TextField
            variant="standard"
            sx={{
              width: "50px",
              input: { color: "white" },
              mr: 2,
            }}
            value={trailFrameNumber}
            type="number"
            onChange={(event, val) => setTrailFrameNumber(event.target.value)}
          />
          <FieldDetailsButton
            handleEnablingField={handleEnablingField}
            showField={showField}
            editField={editField}
            handleEnablingEditField={handleEnablingEditField}
            videoElement={videoElement}
            fieldSize={fieldSize}
          />
          <div className="tests">
            <Button
              data-testid="from-annotation"
              className="tests"
              onClick={() => drawBoundingBoxes(frameNumber)}
            >
              draw players from annotation
            </Button>
          </div>
          <DownloadButton
            players={annotations}
            video={video}
            homographies={homographies}
          />
        </Box>
      </div>

      <div id="canvas-container">
        <canvas
          data-testid="fabric-canvas"
          ref={canvasRef}
          canvas={JSON.stringify(canvas)}
          annotations={annotations.length}
          playerlist={JSON.stringify(playerList)}
          className="canvas"
          id="tracking-editor-canvas"
          width="1920"
          height="1080"
          style={{ display: "block", width: "100%", height: "auto" }}
        ></canvas>
        {/* <div className="sidebar">sidebar is here</div> */}
        <TrackList children={playerList} groups={ballList}></TrackList>
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
