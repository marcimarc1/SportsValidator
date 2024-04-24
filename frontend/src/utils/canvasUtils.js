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
  trailSize
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
    const scaledWidth = a.w * horizontalScalingFactor;
    const scaledHeight =a.h * verticalScalingFactor;
    const radius = scaledWidth < scaledHeight ? scaledWidth / 4 : scaledHeight / 4;
    const trailColor = colorSet.get(a.PlayerKey);
    let trail = new fabric.Circle({
      left: scaledX,
      top: scaledY,
      stroke: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
      strokeWidth: 3,
      fill: `rgb(${trailColor.r}, ${trailColor.g}, ${trailColor.b})`,
      radius: radius * trailSize / 50,
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
