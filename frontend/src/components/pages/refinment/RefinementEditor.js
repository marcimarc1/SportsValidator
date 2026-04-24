import React, { useEffect, useRef, useState } from "react";
import { ReactComponent as ForwardStepIcon } from "../../../icons/forward-step.svg";
import { ReactComponent as BackwardStepIcon } from "../../../icons/backward-step.svg";
import { ReactComponent as KeyboardIcon } from "../../../icons/keyboard.svg";
import { useLocation } from "react-router-dom";
import { fabric } from "fabric";
import "../newTrackingEditor/NewTrackingEditor.css";
import SeekBar from "../newTrackingEditor/SeekBar";
import config from "../../../config.json";
import { drawFieldPoints, updateHomography } from "../../../utils/canvasUtils";
import { parseLogFile } from "../../../utils/logFileParser";
import api from "../../../api/api";
import { getPointsToTrack, getTemplate } from "../../../utils/templates";
import { invertNoCV } from "../../../utils/mathUtils";
import { transformPoint } from "../../../utils/homographyUtils";
import { convertFieldPointsFormat } from "./util";
import BounceLoader from "react-spinners/BounceLoader";
import SideBar from "./SideBar";
import SaveRefinementModal from "./SaveRefinementModal";

// TODO Take a video_id instead and have an endpoint on the server where we supply a video_id and get the corresponding video
const RefinementEditor = () => {
  const location = useLocation();
  const {
    video,
    homographies,
    log,
    fieldSize,
    // filterBoxes,
  } = location.state || {};
  const [annotations, setAnnotations] = useState([]);
  const [canvas, setCanvas] = useState(new fabric.Canvas());
  const [videoUrl, setVideoUrl] = useState("");
  const [frameNumber, setFrameNumber] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [videoElement, setVideoElement] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isShowingBox, setIsShowingBox] = useState(false);
  const [canvasBoxes, setCanvasBoxes] = useState([]); //list of canvas boxes for player
  const [trailsEnabled, setTrailsEnabled] = useState(false);
  const [trailFrameNumber, setTrailFrameNumber] = useState(50);
  const [showField, setShowField] = useState(true);
  const [editField, setEditField] = useState(true);
  const logFile = parseLogFile(log);
  const [drawInField, setDrawInField] = useState(false);
  const [fieldPoints, setFieldPoints] = useState([]);
  const [isZoomModeEnabled, setIsZoomModeEnabled] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const [bindingAction, setBindingAction] = useState(null);
  const [keyBindings, setKeyBindings] = useState({
    playPause: config.general.keyBindings.playPause,
    nextFrame: config.general.keyBindings.nextFrame,
    previousFrame: config.general.keyBindings.previousFrame,
    jumpForward: config.general.keyBindings.jumpForward,
    jumpBackward: config.general.keyBindings.jumpBackward,
  });
  const [watchedFrames, setWatchedFrames] = useState([]);
  const [curFrameCount, setFrameCount] = useState(0);
  const [maxFrameCount, setMaxFrameCount] = useState(10);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);

  // Send the full homography data to the backend
  useEffect(() => {
    // Send out ALL
    const { points, lines } = getTemplate(
      logFile.Sport,
      fieldSize?.length ?? 103,
      fieldSize?.height ?? 68,
    );

    const res = {};

    for (let i = 0; i < Object.entries(homographies).length; i++) {
      // Fill out the entire refinement object for this frame
      let homography = homographies[i];
      // Using normal invert causes issue window.cv.Mat is not a constructor, this is a workaround
      let invHomography = invertNoCV(homography);

      const innerRes = {};

      for (const [key, value] of Object.entries(points)) {
        if (Array.isArray(value) && key !== "middleCircle") {
          innerRes[key] = [];
          // invert
          value.forEach((elem) => {
            innerRes[key].push(
              transformPoint(
                elem,
                invHomography,
                canvas.height / 3840,
                canvas.width / 2460,
              ),
            );
          });
        }
      }
      innerRes["frame"] = i;
      // Enable once filterBoxes data is correct
      // innerRes["filterBoxes"] = filterBoxes[i]
      res[i] = innerRes;
    }

    api
      .post(`/annotation/refine/${logFile.Sport}/${video.name}`, res)
      .then((resp) => {
        setWatchedFrames(resp.data);

        if (resp.data.length > 0) {
          setMaxFrameCount(resp.data.length);
          const nextFrame = resp.data[0][0];
          setFrameNumber(nextFrame);
          const referenceTimestamp = getReferenceTimestampForFrame(nextFrame);
          setTimestamp(referenceTimestamp);
        }
        setIsLoadingData(false);
      })
      .catch((resp) => {
        console.log("Got error from refine: ", resp);
      });
  }, []);

  function sendUpdatesToBackend(newData) {
    // Get all updates frames new value
    api
      .post(`/annotation/save-refine/${logFile.Sport}/${video.name}`, newData)
      .then((resp) => {
        console.log("Refinement got saved in Db");
      })
      .catch((resp) => {
        console.log("Got error from save-refine: ", resp);
      });
  }

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty(
      "--main-text-color",
      config.general.trackingEditor.color.mainText,
    );
    root.style.setProperty(
      "--main-bg",
      config.general.trackingEditor.color.mainBg,
    );
    root.style.setProperty(
      "--secondary-bg",
      config.general.trackingEditor.color.secondaryBg,
    );
    root.style.setProperty(
      "--accent",
      config.general.trackingEditor.color.accent,
    );
  }, []);

  const canvasRef = useRef(null);
  const frameDuration = 1001 / 24000; // TODO Get this information from the backend
  // could be used to display annotations in canvas

  useEffect(() => {
    if (video) {
      setVideoUrl(URL.createObjectURL(video));
    }
  }, [location.state]);

  function deselectAllBox() {
    canvas.discardActiveObject();
  }

  const Tooltip = ({ isVisible, children }) => {
    return (
      <div className={`tooltip ${isVisible ? "visible" : ""}`}>{children}</div>
    );
  };

  const toggleTooltip = () => {
    if (videoElement && !videoElement.paused) {
      videoElement.pause();
      setIsPlaying(false);
    }

    setTooltipVisible((prev) => !prev);
  };

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
    }

    var boundingBoxesToDraw = drawInField
      ? canvasBoxes.filter(
          (a) => a.my.frame === frameNumber && isInField(a.my.in_field),
        )
      : canvasBoxes.filter((a) => a.my.frame === frameNumber);

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

  useEffect(() => {
    if (!videoElement) return;
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

    const onSeek = () => {};

    const onSeeking = () => {};

    const onStalled = () => {};

    const onLoadedData = () => {
      console.log("Loaded data");
      const poster = generatePoster(videoElement);
      if (poster) {
        canvas.add(poster);
      }
    };

    const onWaiting = () => {};

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
    trailFrameNumber,
    trailsEnabled,
    showField,
  ]);

  const handleKeyPress = (event) => {
    if (!videoElement) return;

    const { key } = event;

    if (bindingAction) {
      if (Object.values(keyBindings).includes(key)) {
        alert("This key is already bound to another action!");
        setBindingAction(null);
        return;
      }

      setKeyBindings((prevBindings) => ({
        ...prevBindings,
        [bindingAction]: key,
      }));

      setBindingAction(null);
      return;
    }

    switch (event.key) {
      case keyBindings.previousFrame:
        handlePreviousFrame();
        break;
      case keyBindings.nextFrame:
        handleNextFrame();
        break;
      case keyBindings.jumpBackward:
        event.preventDefault();
        handlePreviousChunk();
        break;
      case keyBindings.jumpForward:
        event.preventDefault();
        handleNextChunk();
        break;
      default:
        break;
    }
  };

  const handleClick = (e) => {
    if (bindingAction) {
      e.stopPropagation();
      setBindingAction(null);
      return;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);

      document.addEventListener("click", handleClick);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isZoomModeEnabled) return;

    const handleWheel = (event) => {
      event.preventDefault();

      let delta = event.deltaY;
      let newZoomLevel = canvas.getZoom();

      if (delta < 0) {
        newZoomLevel = Math.min(newZoomLevel + 0.1, 3);
      } else {
        newZoomLevel = Math.max(newZoomLevel - 0.1, 0.5);
      }

      canvas.zoomToPoint({ x: event.offsetX, y: event.offsetY }, newZoomLevel);
      canvas.renderAll();
    };

    const handleMouseDown = (event) => {
      canvas.isDragging = true;
      canvas.selection = false;
      canvas.lastPosX = event.e.clientX;
      canvas.lastPosY = event.e.clientY;
    };

    const handleMouseMove = (event) => {
      if (canvas.isDragging) {
        const deltaX = event.e.clientX - canvas.lastPosX;
        const deltaY = event.e.clientY - canvas.lastPosY;

        canvas.viewportTransform[4] += deltaX;
        canvas.viewportTransform[5] += deltaY;

        canvas.lastPosX = event.e.clientX;
        canvas.lastPosY = event.e.clientY;

        canvas.renderAll();
      }
    };

    const handleMouseUp = () => {
      canvas.isDragging = false;
      canvas.selection = true;
    };

    canvas.wrapperEl.addEventListener("wheel", handleWheel);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.wrapperEl.removeEventListener("wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [isZoomModeEnabled, canvas]);

  const startBindingKey = (action) => {
    setBindingAction(action);
  };

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
    if (videoElement && curFrameCount < maxFrameCount - 1) {
      const nextFrame = watchedFrames[curFrameCount + 1][0];
      setFrameCount(curFrameCount + 1);

      const referenceTimestamp = getReferenceTimestampForFrame(nextFrame);
      videoElement.currentTime = referenceTimestamp;
      deleteFieldDrawing();
      setFrameNumber(nextFrame);
      setTimestamp(referenceTimestamp);

      const currentProgress =
        (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(currentProgress);

      drawField();
    }
  };

  const handlePreviousFrame = () => {
    if (videoElement && curFrameCount > 0) {
      const previousFrame = watchedFrames[curFrameCount - 1][0];

      // console.log("Previous frame: ", previousFrame);
      setFrameCount(curFrameCount - 1);
      const referenceTimestamp = getReferenceTimestampForFrame(previousFrame);
      videoElement.currentTime = referenceTimestamp;
      deleteFieldDrawing();
      setFrameNumber(previousFrame);
      setTimestamp(referenceTimestamp);

      const currentProgress =
        (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(currentProgress);
      drawField();
    }
  };

  const handlePreviousChunk = () => {
    const newTimestamp = Math.max(0, videoElement.currentTime - 5);
    videoElement.currentTime = newTimestamp;
    updateTimestamp(newTimestamp);
  };

  const handleNextChunk = () => {
    const newTimestamp = Math.min(
      videoElement.duration,
      videoElement.currentTime + 5,
    );
    videoElement.currentTime = newTimestamp;
    updateTimestamp(newTimestamp);
  };

  // Seeking

  useEffect(() => {
    const updateProgressBar = () => {
      const currentProgress =
        (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(currentProgress);
    };

    if (videoElement) {
      videoElement.addEventListener("timeupdate", updateProgressBar);
      return () => {
        videoElement.removeEventListener("timeupdate", updateProgressBar);
      };
    }
  }, [videoElement]);

  const handleEnablingEditField = () => {
    if (editField) {
      setEditField(false);
    } else {
      setEditField(true);
    }
  };

  const handleZoomReset = () => {
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.setZoom(1);
    canvas.renderAll();
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
    }
  };

  const handleApplyHomography = (frameNumber, trackPoints) => {
    const { points, lines } = getTemplate(
      logFile.Sport,
      fieldSize?.length ?? 10,
      fieldSize?.height ?? 10,
    );

    const flattenedPoints = Object.entries(points).reduce(
      (acc, [key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item.id) {
              acc[item.id] = item.coords;
            }
          });
        } else if (typeof value === "object" && value !== null) {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );

    // GET all points on the field in format of other one
    var fieldPoints = canvas
      .getObjects()
      .filter(
        (obj) =>
          obj.properties?.type === "fieldPoint" &&
          getPointsToTrack(logFile.Sport).includes(obj.id),
      )
      .map((obj) => ({
        id: obj.id,
        x: obj.left,
        y: obj.top,
        originalCoords: flattenedPoints[obj.id],
      }));

    if (!trackPoints) {
      updateHomography(
        fieldPoints,
        homographies,
        frameNumber,
        canvas.width / 3840,
        canvas.height / 2160,
        logFile.Sport,
        fieldSize?.length,
        fieldSize?.width,
      );
      deleteFieldDrawing();
      drawField();
      handleEnablingEditField();

      // update entry in the watched data
      const newWatchedFrames = watchedFrames.map((frame) => {
        if (frame[0] === frameNumber) {
          frame[1] = convertFieldPointsFormat(fieldPoints);
        }
        return frame;
      });
      setWatchedFrames(newWatchedFrames);
    }
  };

  return (
    <div>
      <SaveRefinementModal
        showApplyHomographyModal={showSendModal}
        handleClose={() => setShowSendModal(false)}
        handleApply={() => {
          sendUpdatesToBackend(watchedFrames);
          setShowSendModal(false);
        }}
      />
      <div
        style={{
          display: isLoadingData ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column", // Ensures the loader and text are stacked vertically
          height: "100vh",
          visibility: isLoadingData ? "visible" : "hidden",
        }}
      >
        <BounceLoader
          color={config.general.trackingEditor.color.accent}
          loading={isLoadingData}
          cssOverride={true}
          size={300}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <div
          style={{
            marginTop: "20px",
            fontSize: "32px",
            color: config.general.trackingEditor.color.accent,
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          Analyzing data, please wait a few seconds
        </div>
      </div>
      <div style={{ visibility: !isLoadingData ? "visible" : "hidden" }}>
        <div id="canvas-container">
          <canvas
            data-testid="fabric-canvas"
            ref={canvasRef}
            canvas={JSON.stringify(canvas)}
            annotations={annotations.length}
            fieldPoints={JSON.stringify(fieldPoints)}
            className="canvas"
            id="tracking-editor-canvas"
            width="1920"
            height="1080"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              position: "relative",
            }}
          ></canvas>
          <SideBar
            watchedFrames={watchedFrames}
            maxHeight={750}
            onSendUpdates={() => {
              setShowSendModal(true);
            }}
            onClickFrame={(elemIndex) => {
              // update progress
              const nextFrame = watchedFrames[elemIndex][0];
              setFrameCount(elemIndex);

              const referenceTimestamp =
                getReferenceTimestampForFrame(nextFrame);
              videoElement.currentTime = referenceTimestamp;
              deleteFieldDrawing();
              setFrameNumber(nextFrame);
              setTimestamp(referenceTimestamp);

              const currentProgress =
                (videoElement.currentTime / videoElement.duration) * 100;
              setProgress(currentProgress);

              drawField();
            }}
          ></SideBar>
        </div>
        <div className="controls" style={{ zIndex: 99, position: "relative" }}>
          <SeekBar
            onSeekStart={() => {}}
            onSeekPercent={() => {}}
            onSeekEnd={() => {}}
            progress={progress}
          />
          <div id="buttons-container">
            <button
              className="icon-button"
              onClick={() => {
                if (curFrameCount < maxFrameCount - 1 && curFrameCount >= 0) {
                  handleApplyHomography(watchedFrames[curFrameCount][0], false);
                }
                handlePreviousFrame();
              }}
            >
              <BackwardStepIcon className="icon" />
            </button>
            <span id="frame-number-display">Frame {frameNumber}</span>
            <button
              className="icon-button"
              data-testid="next-frame-button"
              onClick={() => {
                if (curFrameCount < maxFrameCount - 1 && curFrameCount >= 0) {
                  handleApplyHomography(watchedFrames[curFrameCount][0], false);
                }
                handleNextFrame();
              }}
            >
              <ForwardStepIcon className="icon" />
            </button>
            <div>
              <button
                className="zoom-text-button"
                onClick={() => setIsZoomModeEnabled(!isZoomModeEnabled)}
              >
                {isZoomModeEnabled ? "Disable Zoom Mode" : "Enable Zoom Mode"}
              </button>
            </div>
            <button className="zoom-text-button" onClick={handleZoomReset}>
              Reset Zoom
            </button>
            <button
              className="icon-button"
              style={{ marginLeft: "auto", position: "relative" }}
              onClick={toggleTooltip}
            >
              <KeyboardIcon />
              <Tooltip isVisible={isTooltipVisible}>
                <div
                  className="tooltip-content"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {Object.keys(keyBindings).map((action) => (
                    <div
                      key={action}
                      className={`key-binding-box ${bindingAction === action ? "binding" : ""}`}
                      onClick={() => startBindingKey(action)}
                    >
                      {action}:{" "}
                      {keyBindings[action] == " "
                        ? "Space"
                        : keyBindings[action]}
                    </div>
                  ))}
                </div>
              </Tooltip>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefinementEditor;