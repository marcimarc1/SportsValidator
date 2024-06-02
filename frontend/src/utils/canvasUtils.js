import { fabric } from "fabric";
import { getTemplate } from "./templates";
import { inv } from "mathjs";

export const trailsFullRedraw = (
  canvas,
  annotations,
  frameNumber,
  trailFrameNumber,
  isShowingAnnotation,
  colorSet,
  horizontalScalingFactor,
  verticalScalingFactor,
  setSelectedTrails,
) => {
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
      type: "trail",
      frame: a.FrameNo,
      playerKey: a.PlayerKey,
    };
    trail.hasRotatingPoint = false;
    defineTrailBehaviour(trail, setSelectedTrails);
    canvas.add(trail);
  });
};

function applyHomography(homography, point) {
  let [x, y] = point;
  let w = homography[2][0] * x + homography[2][1] * y + homography[2][2];
  let transformedX =
    (homography[0][0] * x + homography[0][1] * y + homography[0][2]) / w;
  let transformedY =
    (homography[1][0] * x + homography[1][1] * y + homography[1][2]) / w;

  return { x: transformedX, y: transformedY };
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
) => {
  const { points, lines } = getTemplate(sport, length, width);
  const homography = homographies[frameNumber];
  const invHomography = inv(homography);

  const transformPoint = (point) => {
    let transformedPoint = applyHomography(invHomography, point.coords);
    return {
      id: point.id,
      x: transformedPoint.x * horizontalScalingFactor,
      y: transformedPoint.y * verticalScalingFactor,
    };
  };

  const drawPoint = (point, color, radius = 5) => {
    const transformedPoint = transformPoint(point);

    const circle = new fabric.Circle({
      left: transformedPoint.x,
      top: transformedPoint.y,
      radius: radius,
      fill: color,
      originX: 'center',
      originY: 'center',
      selectable: true,
      hasControls: false,
    });

    circle.properties = {
      type: 'fieldPoint',
      frame: frameNumber,
    };

    circle.id = point.id;
    canvas.add(circle);
    return circle;
  };

  const updateLines = () => {
    canvas.getObjects('line').forEach((line) => {
      const startPoint = canvas.getObjects().find((obj) => obj.id === line.startPointId);
      const endPoint = canvas.getObjects().find((obj) => obj.id === line.endPointId);

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
    const line = new fabric.Line([startPoint.left, startPoint.top, endPoint.left, endPoint.top], {
      stroke: color,
      strokeWidth: 3,
      selectable: false,
    });

    line.properties = {
      type: 'field',
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

      return drawPoint(point, color);
    });

    for (let i = 0; i < pointObjects.length - 1; i++) {
      const startPoint = pointObjects[i];
      const endPoint = pointObjects[i + 1];
      drawLine(startPoint, endPoint, color);
    }

    canvas.off('object:moving', updateLines);
    canvas.on('object:moving', updateLines);
  };

  const drawCircle = (center, radius, color) => {
    const transformedCenter = transformPoint({ coords: center });

    const radiusPointX = [center[0] + radius, center[1]];
    const radiusPointY = [center[0], center[1] + radius];
  
    const transformedRadiusPointX = transformPoint({ coords: radiusPointX });
    const transformedRadiusPointY = transformPoint({ coords: radiusPointY });
  
    // Calculate the transformed radii
    const transformedRadiusX = Math.abs(transformedRadiusPointX.x - transformedCenter.x);
    const transformedRadiusY = Math.abs(transformedRadiusPointY.y - transformedCenter.y);

    const ellipse = new fabric.Ellipse({
      left: transformedCenter.x,
      top: transformedCenter.y,
      rx: transformedRadiusX,
      ry: transformedRadiusY,
      stroke: color,
      strokeWidth: 3,
      fill: 'transparent',
      originX: 'center',
      originY: 'center',
      selectable: true,
    });

    ellipse.properties = {
      type: 'field',
      frame: frameNumber,
    };

    canvas.add(ellipse);
  };

  // Drawing lines from template
  Object.entries(lines).forEach(([lineId, points]) => {
    drawLineFromPoints(points, 'blue', lineId);
  });

  if (points.middleCircle) {
    drawCircle(points.middleCircle.center, points.middleCircle.radius, 'yellow');
  }
  if(points.penaltySpot){
    drawCircle(points.penaltySpot[0].coords, 0.3, 'red');
    drawCircle(points.penaltySpot[1].coords, 0.3, 'red');
  }
};


export const defineTrailBehaviour = (trail, setSelectedTrails) => {
  trail.on("selected", () => {
    setSelectedTrails((prevTrails) => {
      return new Set(prevTrails.add(trail.properties.playerKey));
    });
  });
};
