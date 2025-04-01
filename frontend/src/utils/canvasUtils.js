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

function createLabel(text, topCoordinate, leftCoordinate) {
  return new fabric.IText(text, {
    top: topCoordinate,
    left: leftCoordinate,
    originX: "left",
    originY: "center",
    editable: true,
    fontSize: 14,
    fill: "red",
  });
}

export function getOriginalFieldPoints(
  points,
  horizontalScalingFactor,
  verticalScalingFactor,
) {
  return Object.values(points)
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
}

export const drawFieldPoints = (
  canvas,
  frameNumber,
  homographies,
  horizontalScalingFactor,
  verticalScalingFactor,
  sport,
  length,
  width,
  // filterBoxes, enable once filterBoxes data is correct
) => {
  const { points, lines } = getTemplate(sport, length, width);
  let homography = homographies[frameNumber];
  let invHomography = inverse(homography);

  const originalFieldPoints = getOriginalFieldPoints(points);

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

    // Create the label
    const label = createLabel(
      point.id,
      transformedPoint.y + 25,
      transformedPoint.x + 50,
    );

    // Group the circle and label together
    const group = new fabric.Group([circle, label], {
      left: transformedPoint.x,
      top: transformedPoint.y,
      originX: "center",
      originY: "center",
      selectable: true,
      hasBorder: true,
      hasControls: false,
    });

    group.id = point.id;
    group._objects[0].top = 0;
    group._objects[0].left = 0;

    group.properties = {
      type: "fieldPoint",
      frame: frameNumber,
      labelOffset: {
        top: group._objects[1].top,
        left: group._objects[1].left,
      },
    };
    canvas.add(group);
    return group;
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
          x1: startPoint.left + startPoint._objects[0].left,
          y1: startPoint.top + startPoint._objects[0].top,
          x2: endPoint.left + endPoint._objects[0].left,
          y2: endPoint.top + endPoint._objects[0].top,
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
      "penalty-spot-0",
    );
    drawCircle(
      points.penaltySpot[1].coords,
      config.soccer.penaltyArea.radius,
      config.soccer.penaltyArea["color-spot-2"],
      "penalty-spot-1",
    );
  }

  canvas.on("selection:created", (obj) => makeTextEditable(canvas, obj));
  canvas.on("selection:cleared", () =>
    exitEditingMode(curSelectedPreviousText, curSelectedLabel, originalGroup),
  );

  canvas.on("object:removed", () => {
    canvas.off("selection:created", (obj) => makeTextEditable(canvas, obj));
    canvas.off("selection:cleared", () =>
      exitEditingMode(curSelectedPreviousText, curSelectedLabel, originalGroup),
    );
  });

  return canvas
    .getObjects()
    .filter((obj) => obj.properties?.type === "fieldPoint");
};

let curSelectedLabel = null;
let curSelectedPreviousText = null;
let originalGroup = null;

const makeTextEditable = (canvas, obj) => {
  // FabricJs can not handle multiple editable text boxes, so only a single element is allowed to be selected
  if (
    obj === undefined ||
    obj.selected === undefined ||
    obj.selected.length !== 1 ||
    obj.selected[0]._objects === undefined ||
    obj.selected[0]._objects[1] === undefined
  )
    return;

  const labelElem = obj.selected[0]._objects[1]; // The label is the second object in the group

  if (labelElem === undefined) return;

  // Store the original group if available (this is important for the re-adding part)
  originalGroup = labelElem.group;

  // If the label is inside a group, remove it temporarily from the group for editing
  if (originalGroup) {
    originalGroup.removeWithUpdate(labelElem); // Remove from group
    canvas.add(labelElem); // Add to canvas temporarily
  }

  // Clear the current text to prepare for editing
  const originalText = labelElem.text;
  labelElem.text = ""; // Clear text to start fresh

  // Start editing the label
  labelElem.enterEditing();

  // Set the label as the active editable text for tracking
  curSelectedLabel = labelElem;
  curSelectedPreviousText = originalText;
};

const exitEditingMode = (originalText, labelElem, originalGroup) => {
  // Retrieve the text after editing
  if (originalText == null || labelElem == null || originalGroup == null)
    return;

  const newText = labelElem.text.trim();

  // If the label was inside a group, re-add it to the group after editing
  if (originalGroup) {
    // Update the label position relative to the group
    originalGroup.addWithUpdate(
      createLabel(
        newText || originalText,
        originalGroup.top + originalGroup.properties.labelOffset.top,
        originalGroup.left + originalGroup.properties.labelOffset.left,
      ),
    );
  }
  labelElem.visible = false;
  labelElem.exitEditing();

  curSelectedLabel = null;
  curSelectedPreviousText = null;
  originalGroup = null;
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

  const originalFieldPoints = getOriginalFieldPoints(
    points,
    horizontalScalingFactor,
    verticalScalingFactor,
  ).filter((p) => p !== null);

  const templatePoints = Object.values(points)
    .flat()
    .map((p) => p.coords)
    .filter((o) => o !== undefined);

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
