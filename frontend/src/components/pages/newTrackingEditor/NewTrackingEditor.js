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
  convertAnnotationBallToBallbox,
  convertBallboxToAnnotationBall,
} from "../../../utils/AnnotationBoxConverter";
// import tracking from "../../../data/tracking_data.json";
// import tracking from "../../../data/tracking-data-for-tests.json";
import { fabric } from "fabric";
import "./NewTrackingEditor.css";
import SeekBar from "./SeekBar";
import {
  Switch,
  Button,
  Box,
} from "@mui/material";

import TrackList from "../newTrackingEditor/TrackList";
import TrackListItemPlayer from "./TrackListItemPlayer";
import TrackListItemBall from "./TrackListItemBall";
import MergeAndSwapModal from "./MergeAndSwapModal";
import MergeAndSwapModalBall from "./MergeAndSwapModalBall";
import ApplyHomographyModal from "./ApplyHomographyModal";
import {
  trailsFullRedraw,
  drawFieldPoints,
  defineTrailBehaviour,
  defineTrailBehaviourBall,
} from "../../../utils/canvasUtils";
import {
  multiPlayerMerge,
  multiBallMerge,
  multiBallTrailsDelete,
} from "../../../utils/validation";
import { DownloadButton } from "./DownloadButton";
import { parseLogFile } from "../../../utils/logFileParser";
import Slider from "@mui/material/Slider";
import { FieldDetailsButton } from "./field/FieldDetailsButton";
import api from "../../../api/api";
import { SettingsBallButton } from "./SettingsBallButton";
import { SettingsTrailsButton } from "./SettingsTrailsButton";
import {
  handleMultiSelectMerge,
  handleMultiSelectMergeBall,
  handleMultiBallTrailsDelete,
} from './multiSelectHandlers';
import {updateSidebar} from "./sidebarUpdater";
import {
  getCurrentTimestampFrame,
  getReferenceTimestampForFrame,
  updateTimestamp,
  handleNextFrame,
  handlePreviousFrame,
  handlePreviousChunk,
  handleNextChunk,
  handlePlayPause,
  handleSeekStart,
  handleSeekPercent,
  handleSeekEnd,
  formatTime,
  handleDisplayingBox,
  handleDisplayingAnnotation,
  handleAddPlayer
} from './videoControls';
import {generatePoster} from "./postGenerator";
import {
  blink,
  deletePlayer,
  deleteBall,
  setName,
  setNameBall
} from './canvasUtils';
import {modalBallOpen, modalOpen, modalsClose} from "./modalHandler";
import useInitializeTrackingData from "./useInitializeTrackingData";
import {generateColor} from "../../../utils/colorGenerator";

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
  const [showField, setShowField] = useState(false);
  const [editField, setEditField] = useState(false);
  const [wasVideoPlaying, setWasVideoPlaying] = useState(false);
  const logFile = parseLogFile(log);
  const [selectedTrails, setSelectedTrails] = useState(new Set());
  const [trailSize, setTrailSize] = useState(50);
  const [drawInField, setDrawInField] = useState(false);
  const [showApplyHomographyModal, setShowApplyHomographyModal] =
    useState(false);
  const [fieldPoints, setFieldPoints] = useState([]);
  const [isShowingPlayerTrails, setIsShowingPlayerTrails] = useState(true);
  const [annotationBallTracks, setAnnotationBallTracks] = useState([]);
  const [ballList, setBallList] = useState([]); //list of ball TrackListItemBall
  const [canvasBoxesBall, setCanvasBoxesBall] = useState([]); //list of canvas boxes for ball
  const [ballNameMap, setBallNameMap] = useState(new Map()); //map of ballkey to ballname
  const [colorSetBall, setColorSetBall] = useState(new Map()); //map of ballkey to color
  const [ballChosenInList, setBallChosenInList] = useState(""); //ball which is selected in sidebar
  const [mergeModalBallState, setMergeModalBallState] = useState(false);
  const [isShowingBallBox, setIsShowingBallBox] = useState(true);
  const [isShowingBallTrails, setIsShowingBallTrails] = useState(true);
  const [selectedTrailsBall, setSelectedTrailsBall] = useState([]);

  const handleModalOpen = modalOpen(setPlayerChosenInList, setMergeModalState);
  const handleModalBallOpen = modalBallOpen(setBallChosenInList, setMergeModalBallState);
  const handleModalsClose = modalsClose(setMergeModalState, setMergeModalBallState);

  useInitializeTrackingData(
      video,
      processedPlayers,
      processedBallTracks,
      setVideoUrl,
      setAnnotations,
      setColorSet,
      setPlayerNameMap,
      setAnnotationBallTracks,
      setColorSetBall,
      setBallNameMap
  );

  let { videoName } = useParams();

  const canvasRef = useRef(null);
  const frameDuration = 1001 / 24000; // TODO Get this information from the backend
  // could be used to display annotations in canvas


  const refreshSidebar = () => {
    updateSidebar({
      canvasBoxes,
      canvasBoxesBall,
      colorSet,
      colorSetBall,
      getCurrentTimestampFrame,
      playerNameMap,
      ballNameMap,
      changeSelection,
      handleSetName,
      handleSetNameBall,
      handleBlink,
      handleDeletePlayer,
      handleDeleteBall,
      handleModalOpen,
      handleModalBallOpen,
      setPlayerList,
      setBallList,
    });
  };

  const handleBlink = (playerBox) => {
    blink(canvas, playerBox, setActiveObject);
  };

  const handleDeletePlayer = (playerBox) => {
    deletePlayer(canvas, playerBox, setAnnotations, setCanvasBoxes, playerNameMap, setPlayerNameMap, refreshSidebar);
  };

  const handleDeleteBall = (ballBox) => {
    deleteBall(canvas, ballBox, setAnnotationBallTracks, setCanvasBoxesBall, ballNameMap, setBallNameMap, refreshSidebar);
  };

  const handleSetName = (playerBox, name) => {
    setName(canvas, playerBox, name, playerNameMap);
  };

  const handleSetNameBall = (ballBox, name) => {
    setNameBall(canvas, ballBox, name, ballNameMap);
  };

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

  function defineBoxBehavior(box, is_playerBox = true) {
    box.on({
      selected: () => {},
      mousedown: () => {},
      mouseover: () => {},
    });

    box.on({
      deselected: () => {},
      mouseout: () => {},
    });

    if (is_playerBox) {
      box.on({
        modified: () => {
          var boundingRect = box.getBoundingRect();
          var scaleX = box.scaleX; // Save current scale factors
          var scaleY = box.scaleY;
          // Calculate actual width and height based on scale factors
          //when scaling the box, only scaleX and scaleY change, while width and height not
          var actualWidth = (boundingRect.width - box.strokeWidth) / scaleX;
          var actualHeight = (boundingRect.height - box.strokeWidth) / scaleY;
          box.left = boundingRect.left;
          box.top = boundingRect.top;
          box.width = actualWidth;
          box.height = actualHeight;

          const horizontalScalingFactor = canvas.width / 3840;
          const verticalScalingFactor = canvas.height / 2160;
          const modifiedAnnotation = convertBoxToAnnotation(
            box,
            horizontalScalingFactor,
            verticalScalingFactor,
          );
          console.log(modifiedAnnotation);
          const annotationToReplace = annotations.findIndex(
            (a) => a.FrameNo == box.my.frame && a.PlayerKey == box.my.key,
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
    } else {
      box.on({
        modified: () => {
          var boundingRect = box.getBoundingRect();
          var scaleX = box.scaleX; // Save current scale factors
          var scaleY = box.scaleY;
          // Calculate actual width and height based on scale factors
          //when scaling the box, only scaleX and scaleY change, while width and height not
          var actualWidth = (boundingRect.width - box.strokeWidth) / scaleX;
          var actualHeight = (boundingRect.height - box.strokeWidth) / scaleY;
          box.left = boundingRect.left;
          box.top = boundingRect.top;
          box.width = actualWidth;
          box.height = actualHeight;

          const horizontalScalingFactor = canvas.width / 3840;
          const verticalScalingFactor = canvas.height / 2160;
          const modifiedAnnotation = convertBallboxToAnnotationBall(
            box,
            horizontalScalingFactor,
            verticalScalingFactor,
          );
          console.log(modifiedAnnotation);
          const annotationToReplace = annotationBallTracks.findIndex(
            (a) => a.FrameNo == box.my.frame && a.trackNo == box.my.key,
          );
          if (annotationToReplace == -1) {
            console.error(
              "the modified bounding box doesn't exist in annotationBallTracks.",
            );
          }
          annotationBallTracks.splice(
            annotationToReplace,
            1,
            modifiedAnnotation,
          );
          canvas.renderAll();
        },
      });
    }
    return box;
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

  // TODO: Move to hook
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
              setName={handleSetName}
              blink={handleBlink}
              color={boxColor}
              delete={handleDeletePlayer}
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
              setName={handleSetName}
              blink={handleBlink}
              color={boxColor}
              delete={handleDeletePlayer}
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
              setName={handleSetNameBall}
              blink={handleBlink}
              color={boxColor}
              delete={handleDeleteBall}
              handleModalOpen={handleModalBallOpen}
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
              setName={handleSetNameBall}
              blink={handleBlink}
              color={boxColor}
              delete={handleDeleteBall}
              handleModalOpen={handleModalBallOpen}
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
      if (isShowingPlayerTrails) {
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
      }
      if (isShowingBallTrails) {
        const currentBallTrailsToDraw = annotationBallTracks.filter(
          (a) => a.FrameNo === frameNumber,
        );

        currentBallTrailsToDraw.forEach((a) => {
          const scaledX = a.x1 * horizontalScalingFactor;
          const scaledY = a.y1 * verticalScalingFactor;
          const scaledWidth = (a.x2 - a.x1) * horizontalScalingFactor;
          const scaledHeight = (a.y2 - a.y1) * verticalScalingFactor;
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
          defineTrailBehaviourBall(trail, setSelectedTrailsBall);
          canvas.add(trail);
        });
      }
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
            setName={handleSetName}
            blink={handleBlink}
            color={boxColor}
            delete={handleDeletePlayer}
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
              setName={handleSetName}
              blink={handleBlink}
              delete={handleDeletePlayer}
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
            setName={handleSetNameBall}
            blink={handleBlink}
            color={boxColor}
            handleModalOpen={handleModalBallOpen}
            delete={handleDeleteBall}
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
          let ballBox = convertAnnotationBallToBallbox(
            boundingBox,
            horizontalScalingFactor,
            verticalScalingFactor,
          );
          ballBox.visible = isShowingBallBox;
          ballBox.stroke = `rgb(${boxColor.r}, ${boxColor.g}, ${boxColor.b})`;
          ballBox.setControlVisible("mtr", false);
          ballBox = defineBoxBehavior(ballBox, false); //false indicates that this is a ball box
          if (isShowingBallBox) canvas.add(ballBox);

          tempList = tempList.concat([
            <TrackListItemBall
              key={runningIndex++}
              ballBox={ballBox}
              color={boxColor}
              name={ballNameMap.get(boundingBox.trackNo)}
              changeSelection={changeSelection}
              setName={handleSetNameBall}
              blink={handleBlink}
              handleModalOpen={handleModalBallOpen}
              delete={handleDeleteBall}
            />,
          ]);
        });
      }
    }
    setBallList(tempList);

    canvas.remove(
      ...canvas
        .getObjects()
        .filter(
          (obj) =>
            obj.properties?.type === "field" ||
            obj.properties?.type === "fieldPoint",
        ),
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

  function handleUpdateTimeStamp(newTimestamp) {
    updateTimestamp(newTimestamp, frameDuration, setTimestamp,setFrameNumber)
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
    let previousFrameNumber = 0;

    const updateCanvas = () => {
      const currentFrameNumber = getCurrentTimestampFrame(videoElement, frameDuration);
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

      const currentFrameNumber = getCurrentTimestampFrame(videoElement, frameDuration);
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
      const poster = generatePoster(videoElement, frameDuration);
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
    annotationBallTracks,
    videoElement,
    isShowingBox,
    isShowingBallBox,
    isShowingBallTrails,
    isShowingPlayerTrails,
    playerNameMap,
    ballNameMap,
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
        annotationBallTracks,
        colorSetBall,
        frameNumber,
        trailFrameNumber,
        isShowingAnnotation,
        colorSet,
        canvas.width / 3840,
        canvas.height / 2160,
        setSelectedTrails,
        setSelectedTrailsBall,
        trailSize,
        isShowingBallTrails,
        isShowingPlayerTrails,
      );
    }
  }, [videoElement?.seeking]);

  //triggered when new player is added, or when merge or swap happens
  useEffect(() => {
    //remove old canvas objects
    canvas.remove(
      ...canvas
        .getObjects()
        .filter(
          (obj) =>
            obj?.properties?.type !== "fieldPoint" &&
            obj?.properties?.type !== "field",
        ),
    );

    const horizontalScalingFactor = canvas.width / 3840;
    const verticalScalingFactor = canvas.height / 2160;
    var tempList = [];
    let runningIndex = 0;

    if (trailsEnabled) {
      //all trails have to be redrawn in this case
      trailsFullRedraw(
        canvas,
        annotations,
        annotationBallTracks,
        colorSetBall,
        frameNumber,
        trailFrameNumber,
        isShowingAnnotation,
        colorSet,
        horizontalScalingFactor,
        verticalScalingFactor,
        setSelectedTrails,
        setSelectedTrailsBall,
        trailSize,
        isShowingBallTrails,
        isShowingPlayerTrails,
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
              setName={handleSetName}
              blink={handleBlink}
              delete={handleDeletePlayer}
              color={boxColor}
              handleModalOpen={handleModalOpen}
            />,
          ]);
        });
        setPlayerList(tempList);
      }
    }

    if (annotationBallTracks.length > 0) {
      var boundingBoxesToDrawBall = annotationBallTracks.filter(
        (a) => a.FrameNo === frameNumber,
      );
      tempList = [];
      runningIndex = 0;
      if (boundingBoxesToDrawBall.length > 0) {
        //draw boxes
        boundingBoxesToDrawBall.forEach((boundingBox) => {
          const boxColor = colorSetBall.get(boundingBox.trackNo);
          let ballBox = convertAnnotationBallToBallbox(
            boundingBox,
            horizontalScalingFactor,
            verticalScalingFactor,
          );
          ballBox.visible = isShowingBallBox;
          ballBox.stroke = `rgb(${boxColor.r}, ${boxColor.g}, ${boxColor.b})`;
          ballBox.setControlVisible("mtr", false);
          ballBox = defineBoxBehavior(ballBox, false); //false indicates that this is a ball box
          canvas.add(ballBox);

          tempList = tempList.concat([
            <TrackListItemBall
              key={runningIndex++}
              ballBox={ballBox}
              color={boxColor}
              name={ballNameMap.get(boundingBox.trackNo)}
              changeSelection={changeSelection}
              setName={handleSetNameBall}
              blink={handleBlink}
              handleModalOpen={handleModalBallOpen}
              delete={handleDeleteBall}
            />,
          ]);
        });
        setBallList(tempList);
      }
    }
  }, [
    annotations,
    annotationBallTracks,
    playerNameMap,
    ballNameMap,
    trailsEnabled,
    isShowingBallTrails,
    isShowingPlayerTrails,
    isShowingBallBox,
    trailSize,
    trailFrameNumber,
    drawInField,
  ]);

  const handleKeyDown = (event) => {
    switch (event.keyCode) {
      case 74: // j
        handlePreviousChunk(videoElement, handleUpdateTimeStamp);
        break;
      case 75: // k
        handlePlayPause({videoElement, editField, setShowApplyHomographyModal, setIsPlaying});
        break;
      case 76: // l
        handleNextChunk(videoElement, handleUpdateTimeStamp);
        break;
      case 188: // ,
        handlePreviousFrame({
          videoElement,
          frameNumber,
          getReferenceTimestampForFrame,
          deleteFieldDrawing,
          setFrameNumber,
          setTimestamp,
          drawField});
        break;
      case 190: // .
        handleNextFrame({videoElement, frameNumber, getReferenceTimestampForFrame, deleteFieldDrawing, setFrameNumber, setTimestamp, drawField});
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  function addBoundingBoxBallAtMousePosition(event) {
    const pointer = canvas.getPointer(event.e);
    const horizontalScalingFactor = canvas.width / 3840;
    const verticalScalingFactor = canvas.height / 2160;
    const x = pointer.x / horizontalScalingFactor;
    const y = pointer.y / verticalScalingFactor;
    //console.log(`Mouse clicked at: (${x}, ${y})`);
    const newBallKey = ballNameMap.size + 1; //ball keys start from 1
    const boxColor = generateColor(newBallKey);
    setColorSetBall(colorSetBall.set(newBallKey, boxColor));
    setAnnotationBallTracks(
      annotationBallTracks.concat({
        FrameNo: frameNumber,
        trackNo: newBallKey,
        x1: x,
        x2: x + 30,
        y1: y,
        y2: y + 30,
        detection: 1,
        x: 0,
        y: 0,
      }),
    );
    setBallNameMap(new Map(ballNameMap.set(newBallKey, "ball" + newBallKey)));

    canvas.off("mouse:down");
  }

  function handleAddBall() {
    canvas.on("mouse:down", function (e) {
      addBoundingBoxBallAtMousePosition(e);
    });
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
      drawField(true);
    }
  };

  const handleEnablingEditField = () => {
    if (editField) {
      setEditField(false);
    } else {
      setEditField(true);
    }
  };

  const handleShowBallBox = () => {
    console.log("showing ball box", isShowingBallBox);
    if (isShowingBallBox) {
      setIsShowingBallBox(false);
    } else {
      setIsShowingBallBox(true);
    }
  };

  const handleShowBallTrails = () => {
    if (isShowingBallTrails) {
      setIsShowingBallTrails(false);
    } else {
      setIsShowingBallTrails(true);
    }
  };

  const handleShowPlayerTrails = () => {
    if (isShowingPlayerTrails) {
      setIsShowingPlayerTrails(false);
    } else {
      setIsShowingPlayerTrails(true);
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

  const drawField = (forceDraw = false) => {
    if (!homographies) {
      return;
    }

    if (showField || forceDraw) {
      const newFieldPoints = drawFieldPoints(
        canvas,
        getCurrentTimestampFrame(videoElement, frameDuration),
        homographies,
        canvas.width / 3840,
        canvas.height / 2160,
        logFile.Sport,
        fieldSize?.length,
        fieldSize?.width,
        videoElement,
      );
      setFieldPoints(newFieldPoints);
      console.log("newFieldPoints", newFieldPoints);
    }
  };

  const handleSwitchingTrailSize = (event) => {
    setTrailSize(event.target.value);
  };

  const handleApplyHomography = (frameNumber) => {
    frameNumber = parseInt(frameNumber);
    var currentFrame = getCurrentTimestampFrame(videoElement, frameDuration);
    var fieldPoints = canvas
      .getObjects()
      .filter((obj) => obj.properties?.type === "fieldPoint")
      .map((obj) => ({
        id: obj.id,
        x: obj.left,
        y: obj.top,
      }));
    console.log("Field points: ", fieldPoints);
    api
      .post("/annotation/track", {
        video_id: video.name,
        start_frame: currentFrame,
        end_frame: currentFrame + frameNumber,
        points: fieldPoints,
        player_boxes: annotations
          .filter(
            (a) =>
              a.FrameNo >= currentFrame &&
              a.FrameNo <= currentFrame + frameNumber,
          )
          .map((a) => ({
            frame_no: a.FrameNo,
            x_1: a.x1,
            y_1: a.y1,
            x_2: a.x2,
            y_2: a.y2,
          })),
      })
      .then((response) => {});

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
        handleApply={handleApplyHomography}
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
        handleClose={handleModalsClose}
      />
      <MergeAndSwapModalBall
        ballChosenInList={ballChosenInList}
        ballNameMap={ballNameMap}
        setBallNameMap={setBallNameMap}
        annotationBallTracks={annotationBallTracks}
        setAnnotationBallTracks={setAnnotationBallTracks}
        frameNumber={frameNumber}
        mergeModalBallState={mergeModalBallState}
        handleClose={handleModalsClose}
      />
      <div className="controls">
        <Box id="tools-container" sx={{ display: "flex", gap: "10px" }}>
          <div>Show Annotation:</div>

          <Switch
            color="default"
            checked={isShowingAnnotation}
            onChange={() => handleDisplayingAnnotation(isShowingAnnotation, setIsShowingAnnotation)}
          />

          <div>Show Player Box:</div>

          <Switch
            color="default"
            checked={isShowingBox}
            onChange={() => handleDisplayingBox({isShowingBox, setIsShowingBox, setIsShowingAnnotation, videoElement})}
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
            onClick={() => handleAddPlayer({playerNameMap, frameNumber, setColorSet, colorSet, setAnnotations, annotations, setPlayerNameMap, generateColor})}
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
            onClick={() => handleMultiSelectMerge(selectedTrails,
                annotations,
                setAnnotations,
                playerNameMap,
                setPlayerNameMap,
                setSelectedTrails,
                multiPlayerMerge)}
            sx={{
              backgroundColor: "#BBC3C9 !important",
              color: "#1b1f22 !important",
            }}
          >
            Merge Player
          </Button>
          <Button
            data-testid="merge-button-ball"
            variant="contained"
            onClick={() =>
                handleMultiSelectMergeBall(
                    selectedTrailsBall,
                    annotationBallTracks,
                    setAnnotationBallTracks,
                    ballNameMap,
                    setBallNameMap,
                    setSelectedTrailsBall,
                    multiBallMerge
                )}
            sx={{
              backgroundColor: "#BBC3C9 !important",
              color: "#1b1f22 !important",
            }}
          >
            Merge Ball
          </Button>
          <Button
            data-testid="delete-ball-trails-button"
            variant="contained"
            onClick={() =>
                handleMultiBallTrailsDelete(
                    selectedTrailsBall,
                    annotationBallTracks,
                    setAnnotationBallTracks,
                    ballNameMap,
                    setBallNameMap,
                    setSelectedTrailsBall,
                    multiBallTrailsDelete
                )}
            sx={{
              backgroundColor: "#BBC3C9 !important",
              color: "#1b1f22 !important",
            }}
          >
            Del selected Balltrails
          </Button>
          <FieldDetailsButton
            handleEnablingField={handleEnablingField}
            showField={showField}
            editField={editField}
            handleEnablingEditField={handleEnablingEditField}
            videoElement={videoElement}
            fieldSize={fieldSize}
          />
          <SettingsBallButton
            disabled={!videoElement?.paused}
            isShowingBallBox={isShowingBallBox}
            handleShowBallBox={handleShowBallBox}
            handleAddBall={handleAddBall}
          />
          <SettingsTrailsButton
            disabled={!videoElement?.paused}
            trailsEnabled={trailsEnabled}
            handleEnablingTrails={handleEnablingTrails}
            isShowingPlayerTrails={isShowingPlayerTrails}
            handleShowPlayerTrails={handleShowPlayerTrails}
            isShowingBallTrails={isShowingBallTrails}
            handleShowBallTrails={handleShowBallTrails}
            trailSize={trailSize}
            handleSwitchingTrailSize={handleSwitchingTrailSize}
            trailFrameNumber={trailFrameNumber}
            setTrailFrameNumber={setTrailFrameNumber}
          />
          <div className="tests">
            <Button
              data-testid="from-annotation"
              className="tests"
              onClick={() => drawBoundingBoxes(frameNumber)}
            >
              draw players from annotation and Ball tracks
            </Button>
          </div>
          <DownloadButton
            players={annotations}
            video={video}
            homographies={homographies}
            balls={annotationBallTracks}
          />
        </Box>
      </div>

      <div id="canvas-container">
        <canvas
          data-testid="fabric-canvas"
          ref={canvasRef}
          canvas={JSON.stringify(canvas)}
          annotations={annotations.length}
          annotationballtracks={annotationBallTracks.length}
          playerlist={JSON.stringify(playerList)}
          fieldPoints={JSON.stringify(fieldPoints)}
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
          onSeekStart={() => handleSeekStart(videoElement, setWasVideoPlaying)}
          onSeekPercent={(value) => console.log("Got here") || handleSeekPercent(value, videoElement, setProgress, handleUpdateTimeStamp)}
          onSeekEnd={() => handleSeekEnd(wasVideoPlaying, videoElement)}
          progress={progress}
        />
        <div id="buttons-container">
          <button className="icon-button" onClick={() => handlePreviousFrame({videoElement, frameNumber, getReferenceTimestampForFrame, deleteFieldDrawing, setFrameNumber, setTimestamp, drawField})}>
            <BackwardStepIcon className="icon" />
          </button>
          <span id="frame-number-display">Frame {frameNumber}</span>
          <button
            className="icon-button"
            data-testid="next-frame-button"
            onClick={handleNextFrame}
          >
            <ForwardStepIcon className="icon" />
          </button>
          <button className="icon-button" onClick={() => handlePlayPause({videoElement, editField, setShowApplyHomographyModal, setIsPlaying})}>
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
