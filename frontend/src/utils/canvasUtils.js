import { fabric } from "fabric";
import { getTemplate } from "./templates";

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

function inverseMatrix(m) {
  let det = m[0][0] * (m[1][1] * m[2][2] - m[2][1] * m[1][2]) -
            m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
            m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

  let invDet = 1 / det;

  return [
      [(m[1][1] * m[2][2] - m[2][1] * m[1][2]) * invDet, (m[0][2] * m[2][1] - m[0][1] * m[2][2]) * invDet, (m[0][1] * m[1][2] - m[0][2] * m[1][1]) * invDet],
      [(m[1][2] * m[2][0] - m[1][0] * m[2][2]) * invDet, (m[0][0] * m[2][2] - m[0][2] * m[2][0]) * invDet, (m[1][0] * m[0][2] - m[0][0] * m[1][2]) * invDet],
      [(m[1][0] * m[2][1] - m[2][0] * m[1][1]) * invDet, (m[2][0] * m[0][1] - m[0][0] * m[2][1]) * invDet, (m[0][0] * m[1][1] - m[1][0] * m[0][1]) * invDet]
  ];
}


function applyHomography(homography, point) {
    let [x, y] = point;
    let w = homography[2][0] * x + homography[2][1] * y + homography[2][2];
    let transformedX = (homography[0][0] * x + homography[0][1] * y + homography[0][2]) / w;
    let transformedY = (homography[1][0] * x + homography[1][1] * y + homography[1][2]) / w;

    return { x: transformedX, y: transformedY };
}

export const drawField = (
    canvas, 
    frameNumber, 
    homographies,
    horizontalScalingFactor,
    verticalScalingFactor,
  ) => {
  const template = getTemplate("Soccer", 103.82979583740234, 68.09894561767578);
  const homography = homographies[frameNumber];
  const invHomography = inverseMatrix(homography);

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
      });
      circle.properties = {
        type: "field",
        subtype: key,
      };
      canvas.add(circle);
    
    const text = new fabric.Text(key, {
      left: transformedPoint.x + 7,
      top: transformedPoint.y + 7,
      fill: 'blue',
      fontSize: 16,
      visible: true,
    });
    canvas.add(text);
    });
  });
}


