import { fabric } from "fabric";
import { getTemplate } from "./templates";
import { calculateNewHomography, transformPoint } from "./homographyUtils";
import { inverse } from "./mathUtils";
import config from "../config.json";

export const trailsFullRedraw = (
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
) => {
  if (isShowingPlayerTrails) {
    const pastTrailsToDraw = annotations.filter((a) => {
      return (
        a.FrameNo > frameNumber - trailFrameNumber &&
        a.FrameNo < frameNumber &&
        (a.in_field || a.in_field === null)
      );
    });

    pastTrailsToDraw.forEach((a) => {
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
        strokeWidth: config.soccer.trail.strokeWidth,
        fill: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
        radius: (radius * trailSize) / 50,
        visible: isShowingAnnotation,
      });
      trail.properties = {
        type: "trail",
        frame: a.FrameNo,
        playerKey: a.PlayerKey,
      };
      trail.hasRotatingPoint = false;
      defineTrailBehaviour(trail, setSelectedTrails);
      canvas.add(trail);
    });
  }
  if (isShowingBallTrails) {
    const pastBallTrailsToDraw = annotationBallTracks.filter((a) => {
      return (
        a.FrameNo > frameNumber - trailFrameNumber && a.FrameNo < frameNumber
      );
    });

    pastBallTrailsToDraw.forEach((a) => {
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
        strokeWidth: config.soccer.trail.strokeWidth,
        fill: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
        radius: (radius * trailSize) / 50,
        visible: isShowingAnnotation,
      });
      trail.properties = {
        type: "trail",
        frame: a.FrameNo,
        ballKey: a.trackNo,
      };
      trail.hasRotatingPoint = false;
      defineTrailBehaviourBall(trail, setSelectedTrailsBall);
      canvas.add(trail);
    });
  }
};

export const defineTrailBehaviour = (trail, setSelectedTrails) => {
  trail.on("selected", () => {
    setSelectedTrails((prevTrails) => {
      const newSet = new Set(prevTrails);
      newSet.add(trail.properties.playerKey);
      return newSet;
    });
  });
};

export const defineTrailBehaviourBall = (trail, setSelectedTrailsBall) => {
  trail.on("selected", () => {
    setSelectedTrailsBall((prevTrails) => [
      ...prevTrails,
      { ballKey: trail.properties.ballKey, frame: trail.properties.frame },
    ]);
  });
};

export const drawFieldPoints = (
  canvas,
  frameNumber,
  homographies,
  horizontalScalingFactor,
  verticalScalingFactor,
  sport,
  length,
  width,
) => {
  const { points, lines } = getTemplate(sport, length, width);
  let homography = homographies[frameNumber];
  let invHomography = inverse(homography);

  const originalFieldPoints = Object.values(points)
    .flat()
    .map((point, index) => {
      if (!point.coords || point.coords.length < 2) {
        return null;
      }
      return {
        x: point.coords[0] * horizontalScalingFactor,
        y: point.coords[1] * verticalScalingFactor,
        id: point.id,
      };
    })
    .filter((p) => p !== null);

  const drawPoint = (point, color, radius = 5) => {
    const transformedPoint = transformPoint(
      point,
      invHomography,
      horizontalScalingFactor,
      verticalScalingFactor,
    );

    const circle = new fabric.Circle({
      left: transformedPoint.x,
      top: transformedPoint.y,
      radius: radius,
      fill: color,
      originX: "center",
      originY: "center",
      selectable: false,
      hasControls: false,
    });

    circle.properties = {
      type: "fieldPoint",
      frame: frameNumber,
    };

    circle.id = point.id;
    circle.originalCoords = point.coords; // Store original coordinates in the circle object
    canvas.add(circle);
    return circle;
  };

  const updateLines = () => {
    canvas.getObjects("line").forEach((line) => {
      const startPoint = canvas
        .getObjects()
        .find((obj) => obj.id === line.startPointId);
      const endPoint = canvas
        .getObjects()
        .find((obj) => obj.id === line.endPointId);

      if (startPoint && endPoint) {
        line.set({
          x1: startPoint.left,
          y1: startPoint.top,
          x2: endPoint.left,
          y2: endPoint.top,
        });
        line.setCoords();
      }
    });
    canvas.renderAll();
  };

  const drawLine = (startPoint, endPoint, color) => {
    const line = new fabric.Line(
      [startPoint.left, startPoint.top, endPoint.left, endPoint.top],
      {
        stroke: color,
        strokeWidth: config.soccer.line.strokeWidth,
        selectable: false,
      },
    );

    line.properties = {
      type: "field",
      frame: frameNumber,
    };

    line.startPointId = startPoint.id;
    line.endPointId = endPoint.id;

    canvas.add(line);
    return line;
  };

  const drawLineFromPoints = (points, color, lineId) => {
    const pointObjects = points.map((point, index) => {
      const id = point.id;
      const existingPoint = canvas.getObjects().find((obj) => obj.id === id);

      if (existingPoint) {
        return existingPoint;
      }

      return drawPoint(point, color, 7);
    });

    for (let i = 0; i < pointObjects.length - 1; i++) {
      const startPoint = pointObjects[i];
      const endPoint = pointObjects[i + 1];
      drawLine(startPoint, endPoint, color);
    }

    canvas.on("object:moving", updateLines);
    canvas.on("object:removed", () => {
      canvas.off("object:moving", updateLines);
    });
  };

  const drawCircle = (center, radius, color, id) => {
    const transformedCenter = transformPoint(
      { coords: center },
      invHomography,
      horizontalScalingFactor,
      verticalScalingFactor,
    );

    const radiusPointX = [center[0] + radius, center[1]];
    const radiusPointY = [center[0], center[1] + radius];

    const transformedRadiusPointX = transformPoint(
      { coords: radiusPointX },
      invHomography,
      horizontalScalingFactor,
      verticalScalingFactor,
    );
    const transformedRadiusPointY = transformPoint(
      { coords: radiusPointY },
      invHomography,
      horizontalScalingFactor,
      verticalScalingFactor,
    );

    // Calculate the transformed radii
    const transformedRadiusX = Math.abs(
      transformedRadiusPointX.x - transformedCenter.x,
    );
    const transformedRadiusY = Math.abs(
      transformedRadiusPointY.y - transformedCenter.y,
    );

    const ellipse = new fabric.Ellipse({
      left: transformedCenter.x,
      top: transformedCenter.y,
      rx: transformedRadiusX,
      ry: transformedRadiusY,
      stroke: color,
      strokeWidth: config.soccer.fieldPoint.strokeWidth,
      fill: "transparent",
      originX: "center",
      originY: "center",
      selectable: true,
      id: id,
    });

    ellipse.properties = {
      type: "fieldPoint",
      frame: frameNumber,
    };

    canvas.add(ellipse);
  };

  // Drawing lines from template
  Object.entries(lines).forEach(([lineId, points]) => {
    drawLineFromPoints(points, config.soccer.line.color, lineId);
  });

  if (points.middleCircle) {
    drawCircle(
      points.middleCircle.center,
      points.middleCircle.radius,
      config.soccer.middleCircle.color,
      "middle-circle",
    );
  }
  if (points.penaltySpot) {
    drawCircle(
      points.penaltySpot[0].coords,
      config.soccer.penaltyArea.radius,
      config.soccer.penaltyArea["color-spot-1"],
      "penalty-spot-1",
    );
    drawCircle(
      points.penaltySpot[1].coords,
      config.soccer.penaltyArea.radius,
      config.soccer.penaltyArea["color-spot-2"],
      "penalty-spot-2",
    );
  }

  return canvas
    .getObjects()
    .filter((obj) => obj.properties?.type === "fieldPoint");
};

export const updateHomography = (
  trackedPoints,
  homographies,
  frameNumber,
  horizontalScalingFactor,
  verticalScalingFactor,
  sport,
  length,
  width,
) => {
  const { points } = getTemplate(sport, length, width);

  const originalFieldPoints = Object.values(points)
    .flat()
    .map((point, index) => {
      if (!point.coords || point.coords.length < 2) {
        return null;
      }
      return {
        x: point.coords[0] * horizontalScalingFactor,
        y: point.coords[1] * verticalScalingFactor,
        id: point.id,
      };
    })
    .filter((p) => p !== null);

  const templatePoints = Object.values(points)
    .flat()
    .map((p) => p.coords);

  const trackedPointsTransformed = trackedPoints?.map((obj) => ({
    x: obj.x / horizontalScalingFactor,
    y: obj.y / verticalScalingFactor,
    id: obj.id,
  }));

  if (!trackedPointsTransformed) {
    return;
  }
  try {
    const newHomography = calculateNewHomography(
      originalFieldPoints,
      trackedPointsTransformed,
      templatePoints,
    );

    homographies[frameNumber] = newHomography;
  } catch (error) {
    console.log(error);
  }
};
