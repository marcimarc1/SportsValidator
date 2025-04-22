import React, {useRef, useState, useEffect} from "react";
import {useParams} from "react-router";
import {ReactComponent as PlayIcon} from "../../../icons/play.svg";
import {ReactComponent as PauseIcon} from "../../../icons/pause.svg";
import {ReactComponent as ForwardStepIcon} from "../../../icons/forward-step.svg";
import {ReactComponent as BackwardStepIcon} from "../../../icons/backward-step.svg";
import {useLocation} from "react-router-dom";
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
import {fabric} from "fabric";
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
import {DownloadButton} from "./DownloadButton";
import {parseLogFile} from "../../../utils/logFileParser";
import Slider from "@mui/material/Slider";
import {FieldDetailsButton} from "./field/FieldDetailsButton";
import api from "../../../api/api";
import {SettingsBallButton} from "./SettingsBallButton";
import {SettingsTrailsButton} from "./SettingsTrailsButton";
import LoadingOverlay from "react-loading-overlay-ts";

const NewTrackingEditor = () => {
    const [video, setVideo] = useState(null);
    const [videoMetadata, setVideoMetadata] = useState(null);
    const [homographies, setHomographies] = useState(null);
    const [fieldSize, setFieldSize] = useState(null);
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
    const [activeObject, setActiveObject] = useState(null);
    const [colorSet, setColorSet] = useState(new Map()); //map of playerkey to color
    const [trailsEnabled, setTrailsEnabled] = useState(true);
    const [trailFrameNumber, setTrailFrameNumber] = useState(50);
    const [mergeModalState, setMergeModalState] = useState(false);
    const [playerChosenInList, setPlayerChosenInList] = useState("");
    const [showField, setShowField] = useState(false);
    const [editField, setEditField] = useState(false);
    const [logFile, setLogFile] = useState(null);
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
    const [colorSetBall, setColorSetBall] = useState(new Map()); //map of ballkey to color
    const [ballChosenInList, setBallChosenInList] = useState(""); //ball which is selected in sidebar
    const [mergeModalBallState, setMergeModalBallState] = useState(false);
    const [isShowingBallBox, setIsShowingBallBox] = useState(true);
    const [isShowingBallTrails, setIsShowingBallTrails] = useState(true);
    const [selectedTrailsBall, setSelectedTrailsBall] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaderText, setLoaderText] = useState("Loading...");

    const handleModalOpen = (playerInList) => {
        setPlayerChosenInList(playerInList);
        setMergeModalState(true);
    };

    const handleModalBallOpen = (ballInList) => {
        setBallChosenInList(ballInList);
        setMergeModalBallState(true);
        console.log("test2");
    };

    const handleModalsClose = () => {
        setMergeModalState(false);
        setMergeModalBallState(false);
    };

    const handleMultiSelectMerge = () => {
        console.log("Multiplayer merge");
        console.log(Array.from(selectedTrails));
        multiPlayerMerge(
            Array.from(selectedTrails),
            annotations,
            setAnnotations
        );
        setSelectedTrails(new Array());
    };

    const handleMultiSelectMergeBall = () => {
        console.log("Multiplayer merge ball");
        console.log(Array.from(selectedTrailsBall));
        multiBallMerge(
            Array.from(selectedTrailsBall),
            annotationBallTracks,
            setAnnotationBallTracks,
        );
        setSelectedTrailsBall(new Array());
    };

    const handleMultiBallTrailsDelete = () => {
        console.log("Multiplayer delete ball trails");
        console.log(Array.from(selectedTrailsBall));
        multiBallTrailsDelete(
            Array.from(selectedTrailsBall),
            annotationBallTracks,
            setAnnotationBallTracks,
        );
        setSelectedTrailsBall(new Array());
    };

    const canvasRef = useRef(null);
    const frameDuration = 1001 / 24000; // TODO Get this information from the backend
    // could be used to display annotations in canvas

    useEffect(async () => {
        // Load Video File:
        const path = window.location.pathname;
        const videoId = path.substring(path.lastIndexOf("/") + 1);

        try {
            await fetchVideo(videoId)
            await fetchPlayerAnnotations(videoId);
            await fetchBallAnnotations(videoId);
        } catch (error) {
            console.error(error)
        }
    }, []);

    async function fetchVideo(videoId) {
        setLoaderText("Loading Video...")
        setLoading(true);
        try {
            console.log("Loading Video File")
            const response = await api.get("/video/get_video_file/" + videoId, {
                responseType: "blob"
            });
            const videoBlob = new Blob([response.data], {type: "video/mp4"});
            const videoURL = URL.createObjectURL(videoBlob); // Create an object URL
            setVideoUrl(videoURL);
            console.log("Setting the video URL")
            return videoURL
        } finally {
            setLoading(false);
        }

    }

    async function fetchPlayerAnnotations(videoId) {
        setLoaderText("Loading Player Annotations...")
        setLoading(true);
        try {
            console.log("Loading Annotations")
            const playerAnnotationsResponse = await api.get("/annotation/getPlayers/" + videoId);
            const playerAnnotations = playerAnnotationsResponse.data.annotations;
            const set = new Map(boundingBoxColorSet(playerAnnotations));
            setColorSet(set);
            setAnnotations(playerAnnotations);
        } finally {
            setLoading(false);
        }
    }

    async function fetchBallAnnotations(videoId) {
        setLoaderText("Loading Ball Annotations...")
        setLoading(true);
        try {
            const ballAnnotationResponse = await api.get("/annotation/getBalls/" + videoId);
            const ballAnnotations = ballAnnotationResponse.data.annotations;
            const set = new Map(boundingBoxColorSet(ballAnnotations));
            setColorSetBall(set);
            setAnnotationBallTracks(ballAnnotations)
        } finally {
            setLoading(false);
        }
    }

    let wasVideoPlaying = false;

    function updateSidebar() {
        let tempList = [];
        let runningIndex = 0;
        let boxes = canvasBoxes.filter(
            (box) => box.my.frame == getCurrentTimestampFrame(),
        );
        boxes.forEach((box) => {
            const boxColor = colorSet.get(box.displayName);

            tempList = tempList.concat([
                <TrackListItemPlayer
                    key={runningIndex++}
                    playerBox={box}
                    name={box.displayName}
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
        debugger;
        setPlayerList(tempList);

        tempList = [];
        runningIndex = 0;
        let ballBoxes = canvasBoxesBall.filter(
            (box) => box.my.frame == getCurrentTimestampFrame(),
        );
        ballBoxes.forEach((box) => {
            const boxColor = colorSetBall.get(box.displayName);

            tempList = tempList.concat([
                <TrackListItemBall
                    key={runningIndex++}
                    ballBox={box}
                    name={box.displayName}
                    changeSelection={changeSelection}
                    setName={setNameBall}
                    blink={blink}
                    delete={deleteBall}
                    color={boxColor}
                    handleModalOpen={handleModalBallOpen}
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
        setAnnotations(annotations.filter((a) => a.displayName != playerBox.displayName));
        setCanvasBoxes(canvasBoxes.filter((a) => a.displayName != playerBox.displayName));

        updateSidebar();
        canvas.discardActiveObject();
        canvas.remove(playerBox);
        canvas.requestRenderAll();

        //Todo: Integrate Backend
    }

    function deleteBall(ballBox) {
        canvas.setActiveObject(ballBox);
        setActiveObject(ballBox);
        setAnnotationBallTracks(
            annotationBallTracks.filter((a) => a.displayName != ballBox.displayName),
        );
        setCanvasBoxesBall(
            canvasBoxesBall.filter((a) => a.displayName != ballBox.displayName),
        );

        updateSidebar();
        canvas.discardActiveObject();
        canvas.remove(ballBox);
        canvas.requestRenderAll();

        //Todo: Integrate Backend
    }

    function setName(playerBox, name) {
        fabric.Object.prototype.objectCaching = false;
        let playerIndex = playerBox.displayName;
        // Todo: Marco
        canvas.requestRenderAll();
        // TODO BACKEND
        // update data when leaving the page
        // the modified data is stored in canvasBoxes array
    }

    function setNameBall(ballBox, name) {
        fabric.Object.prototype.objectCaching = false;
        let ballIndex = ballBox.my.key;
        // TODO: Marco
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

    function defineBoxBehavior(box, is_playerBox = true) {
        box.on({
            selected: () => {
            },
            mousedown: () => {
            },
            mouseover: () => {
            },
        });

        box.on({
            deselected: () => {
            },
            mouseout: () => {
            },
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
                        (a) => a.frame_number == box.my.frame && a.displayName == box.my.key,
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
                        (a) => a.frame_number == box.my.frame && a.displayName == box.my.key,
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


    useEffect(() => {
        //rerender the sidebar when another item is selected
        if (activeObject) {
            let tempList = [];

            playerList.forEach((item) => {
                if (item.props.playerBox.displayName == activeObject.displayName) {
                    const boxColor = colorSet.get(activeObject.displayName); //used in 'stroke' property of playerBox

                    tempList = tempList.concat([
                        <TrackListItemPlayer
                            key={item.key}
                            playerBox={activeObject}
                            name={activeObject.displayName}
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
                            name={tempBox.displayName}
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
            debugger
            setPlayerList(tempList);

            tempList = [];
            ballList.forEach((item) => {
                if (item.props.ballBox.my.key == activeObject.my.key) {
                    const boxColor = colorSetBall.get(activeObject.displayName);
                    tempList = tempList.concat([
                        <TrackListItemBall
                            key={item.key}
                            ballBox={activeObject}
                            name={activeObject.displayName}
                            changeSelection={changeSelection}
                            setName={setNameBall}
                            blink={blink}
                            color={boxColor}
                            delete={deleteBall}
                            handleModalOpen={handleModalBallOpen}
                        />,
                    ]);
                } else {
                    let tempBox = item.props.ballBox;
                    tempBox.my.selected = false;
                    const boxColor = colorSetBall.get(tempBox.displayName);
                    tempList = tempList.concat([
                        <TrackListItemBall
                            key={item.key}
                            ballBox={tempBox}
                            name={tempBox.displayName}
                            changeSelection={changeSelection}
                            setName={setNameBall}
                            blink={blink}
                            color={boxColor}
                            delete={deleteBall}
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
        localVideoElement.src = videoUrl
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

    function generateColor() {
        var r = Math.floor(Math.random() * 256);
        var g = Math.floor(Math.random() * 256);
        var b = Math.floor(Math.random() * 256);
        return {r, g, b};
    }

    function boundingBoxColorSet(annotationList) {
        let uniquePlayers = new Set(
            annotationList.map((item) => item.displayName),
        );
        let colorSet = new Map();

        uniquePlayers.forEach((key) => {
            let color = generateColor();
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
            if (isShowingPlayerTrails) {
                const currentTrailsToDraw = drawInField
                    ? annotations.filter(
                        (a) => a.frame_number === frameNumber && isInField(a.in_field),
                    )
                    : annotations.filter((a) => a.frame_number === frameNumber);

                currentTrailsToDraw.forEach((a) => {
                    const scaledX = a.x1 * horizontalScalingFactor;
                    const scaledY = a.y1 * verticalScalingFactor;
                    const scaledWidth = a.w * horizontalScalingFactor;
                    const scaledHeight = a.h * verticalScalingFactor;
                    const radius =
                        scaledWidth < scaledHeight ? scaledWidth / 4 : scaledHeight / 4;
                    const trailColor = colorSet.get(a.displayName);
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
                        displayName: a.displayName,
                    };
                    trail.hasRotatingPoint = false;
                    defineTrailBehaviour(trail, setSelectedTrails);
                    canvas.add(trail);
                });
            }
            if (isShowingBallTrails) {
                const currentBallTrailsToDraw = annotationBallTracks.filter(
                    (a) => a.frame_number === frameNumber,
                );

                currentBallTrailsToDraw.forEach((a) => {
                    const scaledX = a.x1 * horizontalScalingFactor;
                    const scaledY = a.y1 * verticalScalingFactor;
                    const scaledWidth = (a.x2 - a.x1) * horizontalScalingFactor;
                    const scaledHeight = (a.y2 - a.y1) * verticalScalingFactor;
                    const radius =
                        scaledWidth < scaledHeight ? scaledWidth / 4 : scaledHeight / 4;
                    const trailColor = colorSetBall.get(a.displayName);
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
                        ballKey: a.displayName,
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
                const boxColor = colorSet.get(boundingBox.displayName); //used in 'stroke' property of playerBox

                tempList = tempList.concat([
                    <TrackListItemPlayer
                        key={runningIndex++}
                        playerBox={boundingBox}
                        name={boundingBox.displayName}
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
                    (a) => a.frame_number === frameNumber && isInField(a.in_field),
                )
                : annotations.filter((a) => a.frame_number === frameNumber);

            if (boundingBoxesToDraw.length > 0) {
                boundingBoxesToDraw.forEach((boundingBox, i) => {
                    const boxColor = colorSet.get(boundingBox.displayName); //used in 'stroke' property of playerBox
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
                            name={playerBox.my.key}
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
                const boxColor = colorSetBall.get(boundingBox.displayName);
                tempList = tempList.concat([
                    <TrackListItemBall
                        key={runningIndex++}
                        ballBox={boundingBox}
                        name={boundingBox.displayName}
                        changeSelection={changeSelection}
                        setName={setNameBall}
                        blink={blink}
                        color={boxColor}
                        handleModalOpen={handleModalBallOpen}
                        delete={deleteBall}
                    />,
                ]);
            });
        } else {
            boundingBoxesToDrawBall = annotationBallTracks.filter(
                (a) => a.frame_number === frameNumber,
            );
            if (boundingBoxesToDrawBall.length > 0) {
                //draw boxes
                boundingBoxesToDrawBall.forEach((boundingBox) => {
                    const boxColor = colorSetBall.get(boundingBox.displayName);
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
                            name={boundingBox.displayName}
                            changeSelection={changeSelection}
                            setName={setNameBall}
                            blink={blink}
                            handleModalOpen={handleModalBallOpen}
                            delete={deleteBall}
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
                const displayName = a.displayName.toString();
                let boxKey = new fabric.Text(displayName, {
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
        annotationBallTracks,
        videoElement,
        isShowingBox,
        isShowingBallBox,
        isShowingBallTrails,
        isShowingPlayerTrails,
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

        //same thing we do in drawBoundingBoxes.
        if (annotations.length > 0) {
            var boundingBoxesToDraw = drawInField
                ? annotations.filter(
                    (a) => a.frame_number === frameNumber && isInField(a.in_field),
                )
                : annotations.filter((a) => a.frame_number === frameNumber);

            if (boundingBoxesToDraw.length > 0) {
                //draw boxes
                boundingBoxesToDraw.forEach((boundingBox) => {
                    ;
                    const boxColor = colorSet.get(boundingBox.displayName);
                    const playerName = boundingBox.displayName;
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
                            name={playerName}
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

        if (annotationBallTracks.length > 0) {
            var boundingBoxesToDrawBall = annotationBallTracks.filter(
                (a) => a.frame_number === frameNumber,
            );
            tempList = [];
            runningIndex = 0;
            if (boundingBoxesToDrawBall.length > 0) {
                //draw boxes
                boundingBoxesToDrawBall.forEach((boundingBox) => {
                    const boxColor = colorSetBall.get(boundingBox.displayName);
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
                            name={boundingBox.displayName}
                            changeSelection={changeSelection}
                            setName={setNameBall}
                            blink={blink}
                            handleModalOpen={handleModalBallOpen}
                            delete={deleteBall}
                        />,
                    ]);
                });
                setBallList(tempList);
            }
        }
    }, [
        annotations,
        annotationBallTracks,
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
        const displayName = "new Player ";
        const boxColor = generateColor();
        setColorSet(colorSet.set(displayName, boxColor));
        setAnnotations(
            annotations.concat({
                FrameNo: frameNumber,
                displayName: displayName,
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
        //TODO: Backend
    }

    function addBoundingBoxBallAtMousePosition(event) {
        const pointer = canvas.getPointer(event.e);
        const horizontalScalingFactor = canvas.width / 3840;
        const verticalScalingFactor = canvas.height / 2160;
        const x = pointer.x / horizontalScalingFactor;
        const y = pointer.y / verticalScalingFactor;
        //console.log(`Mouse clicked at: (${x}, ${y})`);
        const newBallDisplayName = "new ball" //ball keys start from 1
        const boxColor = generateColor();
        setColorSetBall(colorSetBall.set(newBallDisplayName, boxColor));
        setAnnotationBallTracks(
            annotationBallTracks.concat({
                FrameNo: frameNumber,
                displayName: newBallDisplayName,
                x1: x,
                x2: x + 30,
                y1: y,
                y2: y + 30,
                detection: 1,
                x: 0,
                y: 0,
            }),
        );

        //Todo Backend

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
                obj.set({selectable: editField});
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
                getCurrentTimestampFrame(),
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
        const path = window.location.pathname;
        const videoId = path.substring(path.lastIndexOf("/") + 1);
        frameNumber = parseInt(frameNumber);
        var currentFrame = parseInt(getCurrentTimestampFrame());
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
                video_id: videoId,
                start_frame: currentFrame,
                end_frame: currentFrame + frameNumber,
                points: fieldPoints,
                player_boxes: annotations
                    .filter(
                        (a) =>
                            a.frame_number >= currentFrame &&
                            a.frame_number <= currentFrame + frameNumber,
                    )
                    .map((a) => ({
                        frame_no: a.frame_number,
                        x_1: a.x1,
                        y_1: a.y1,
                        x_2: a.x2,
                        y_2: a.y2,
                    })),
            })
            .then((response) => {
            });

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
        <LoadingOverlay
            className="FileOverview"
            active={loading}
            spinner text={loaderText}
            styles={{
                overlay: (base) => ({
                    ...base,
                    zIndex: 9999, // make sure it's high enough
                }),
            }}
        >
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
                annotations={annotations}
                setAnnotations={setAnnotations}
                frameNumber={frameNumber}
                mergeModalState={mergeModalState}
                handleClose={handleModalsClose}
            />
            <MergeAndSwapModalBall
                ballChosenInList={ballChosenInList}
                annotationBallTracks={annotationBallTracks}
                setAnnotationBallTracks={setAnnotationBallTracks}
                frameNumber={frameNumber}
                mergeModalBallState={mergeModalBallState}
                handleClose={handleModalsClose}
            />
            <div className="controls">
                <Box id="tools-container" sx={{display: "flex", gap: "10px"}}>
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
                        Merge Player
                    </Button>
                    <Button
                        data-testid="merge-button-ball"
                        variant="contained"
                        onClick={handleMultiSelectMergeBall}
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
                        onClick={handleMultiBallTrailsDelete}
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
                        video={videoUrl}
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
                    style={{display: "block", width: "100%", height: "auto"}}
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
                        <BackwardStepIcon className="icon"/>
                    </button>
                    <span id="frame-number-display">Frame {frameNumber}</span>
                    <button
                        className="icon-button"
                        data-testid="next-frame-button"
                        onClick={handleNextFrame}
                    >
                        <ForwardStepIcon className="icon"/>
                    </button>
                    <button className="icon-button" onClick={handlePlayPause}>
                        {isPlaying ? (
                            <PauseIcon className="icon"/>
                        ) : (
                            <PlayIcon className="icon"/>
                        )}
                    </button>
                    <span id="timestamp-display">
            {formatTime(timestamp)} / {formatTime(videoElement?.duration)}
          </span>
                </div>
            </div>
        </LoadingOverlay>
    );
};

export default NewTrackingEditor;
