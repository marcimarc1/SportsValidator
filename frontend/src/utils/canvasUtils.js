import { fabric } from "fabric";

export const trailsFullRedraw = (canvas, annotations, frameNumber, trailFrameNumber, isShowingAnnotation, colorSet, horizontalScalingFactor, verticalScalingFactor) => {
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
    };
    //turn off properties that are not needed to increase performance
    trail.selectable = false;
    trail.hasControls = false;
    trail.hasBorders = false;
    trail.hasRotatingPoint = false;
    canvas.add(trail);
  });
}