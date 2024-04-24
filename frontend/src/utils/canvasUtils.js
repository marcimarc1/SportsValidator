import { fabric } from "fabric";

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
      frame: a.FrameNo,
      playerKey: a.PlayerKey,
    };
    trail.hasRotatingPoint = false;
    defineTrailBehaviour(trail, setSelectedTrails);
    canvas.add(trail);
  });
};

export const defineTrailBehaviour = (trail, setSelectedTrails) => {
  trail.on("selected", () => {
    setSelectedTrails((prevTrails) => {
      return new Set(prevTrails.add(trail.properties.playerKey));
    });
  });
};
