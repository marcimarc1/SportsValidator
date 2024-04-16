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
) => {
  const pastTrailsToDraw = annotations.filter((a) => {
    return (
      a.FrameNo > frameNumber - trailFrameNumber && a.FrameNo < frameNumber
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
      frame: frameNumber,
      type: "trail",
    };
    //turn off properties that are not needed to increase performance
    trail.selectable = false;
    trail.hasControls = false;
    trail.hasBorders = false;
    trail.hasRotatingPoint = false;
    canvas.add(trail);
  });
};

function applyHomography(homography, point) {
    let [x, y] = point;
    let w = homography[2][0] * x + homography[2][1] * y + homography[2][2];
    let transformedX = (homography[0][0] * x + homography[0][1] * y + homography[0][2]) / w;
    let transformedY = (homography[1][0] * x + homography[1][1] * y + homography[1][2]) / w;

    return { x: transformedX, y: transformedY };
}

export const drawFieldPoints = (
    canvas, 
    frameNumber, 
    homographies,
    horizontalScalingFactor,
    verticalScalingFactor,
  ) => {
  const template = getTemplate("Soccer", 103.82979583740234, 68.09894561767578);
  const homography = homographies[frameNumber];
  const invHomography = inv(homography);

  const templateKeys = Object.keys(template);
  templateKeys.forEach(key => {

    const points = template[key];
    points.forEach(point => {
      let transformedPoint = applyHomography(invHomography, point);
      transformedPoint = { x: transformedPoint.x * horizontalScalingFactor, y: transformedPoint.y * verticalScalingFactor };
    
      let circle = new fabric.Circle({
        left: transformedPoint.x,
        top: transformedPoint.y,
        stroke: 'blue',
        strokeWidth: 1,
        fill: 'blue',
        radius: 5,
        visible: true,
        originX: 'center',
        originY: 'center',
        hasRotatingPoint: false,
        hasBorders: false,
        hasControls: false,
      });
      circle.properties = {
        type: "field",
        subtype: key,
        frame: frameNumber,
      };
      canvas.add(circle);
    });
  });
}


