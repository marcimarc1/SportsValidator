import { fabric } from "fabric";
export const convertAnnotationToBox = (
  annotation,
  horizontalScalingFactor,
  verticalScalingFactor,
) => {
  try {
    const scaledX = annotation.x1 * horizontalScalingFactor;
    const scaledY = annotation.y1 * verticalScalingFactor;
    const scaledWidth = annotation.w * horizontalScalingFactor;
    const scaledHeight = annotation.h * verticalScalingFactor;
    const boundingBox = new fabric.Rect({
      left: scaledX,
      top: scaledY,
      fill: "rgba(0,0,0,0)",
      width: scaledWidth,
      height: scaledHeight,
      dirty: false,

      hasBorders: false, // disables the control borders (the lines connecting the controls the show up when object is selected
      strokeWidth: 2,
      strokeUniform: true, // to keep the bounding box a consisten thickness, independent of its size
      padding: 0, // to make sure the pixel coordinates are correct
      cornerSize: 10,
      cornerStyle: "rect",
      lockRotation: true,
    });
    boundingBox.my = {
      selected: false,
      key: annotation.PlayerKey,
      frame: annotation.FrameNo,
      in_field: annotation.in_field,
      // also connect it to corresponding annotation
    };
    return boundingBox;
  } catch {
    console.error("the data format of bounding box and annotation doesn't fit");
  }
};

export const convertBoxToAnnotation = (
  boundingBox,
  horizontalScalingFactor,
  verticalScalingFactor,
) => {
  try {
    return {
      FrameNo: boundingBox.my.frame,
      PlayerKey: boundingBox.my.key,
      h: (boundingBox.height * boundingBox.scaleY) / verticalScalingFactor,
      w: (boundingBox.width * boundingBox.scaleX) / horizontalScalingFactor,
      //x,x2,x_trans and other data should be retrieved in future
      //currently only fetch x1,x2,width and height
      x: 0,
      x1: boundingBox.left / horizontalScalingFactor,
      x2: 0,
      x_trans: 0,
      y: 0,
      y1: boundingBox.top / verticalScalingFactor,
      y2: 0,
      y_trans: 0,
      in_field: boundingBox.my.in_field,
    };
  } catch {
    console.error("the data format of bounding box and annotation doesn't fit");
  }
};

export const convertBallsAnnotationToBox = (
  ballinfo,
  horizontalScalingFactor,
  verticalScalingFactor,
) => {
  try {
    const scaledX = ballinfo.x1 * horizontalScalingFactor;
    const scaledY = ballinfo.y1 * verticalScalingFactor;
    const scaledWidth = 10 * horizontalScalingFactor;
    const scaledHeight = 10 * verticalScalingFactor;
    const boundingBox = new fabric.Rect({
      left: scaledX,
      top: scaledY,
      fill: "rgba(0,0,0,0)",
      width: scaledWidth,
      height: scaledHeight,
      dirty: false,

      hasBorders: false, // disables the control borders (the lines connecting the controls the show up when object is selected
      strokeWidth: 2,
      strokeUniform: true, // to keep the bounding box a consisten thickness, independent of its size
      padding: 0, // to make sure the pixel coordinates are correct
      cornerSize: 10,
      cornerStyle: "rect",
      lockRotation: true,
    });
    boundingBox.my = {
      selected: false,
      key: ballinfo.trackNo,
      frame: ballinfo.FrameNo,
      // also connect it to corresponding annotation
    };
    return boundingBox;
  } catch {
    console.error("the data format of bounding box and ballinfo doesn't fit");
  }
};
