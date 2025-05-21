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
      key: annotation.displayName,
      frame: annotation.frame_number,
      in_field: annotation.in_field,
      id: annotation.id,
      video_id: annotation.video_id,
      game_id: annotation.game_id,
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
      id: boundingBox.my.id,
      video_id: boundingBox.my.video_id,
      game_id: boundingBox.my.game_id,
      frame_number: boundingBox.my.frame,
      displayName: boundingBox.my.key,
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
      type: 0,
    };
  } catch {
    console.error("the data format of bounding box and annotation doesn't fit");
  }
};

export const convertAnnotationBallToBallbox = (
  annotationBall,
  horizontalScalingFactor,
  verticalScalingFactor,
) => {
  try {
    const scaledX = annotationBall.x1 * horizontalScalingFactor;
    const scaledY = annotationBall.y1 * verticalScalingFactor;
    const scaledWidth =
      (annotationBall.x2 - annotationBall.x1) * horizontalScalingFactor;
    const scaledHeight =
      (annotationBall.y2 - annotationBall.y1) * verticalScalingFactor;
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
      key: annotationBall.displayName,
      frame: annotationBall.frame_number,
      id: annotationBall.id,
      video_id: annotationBall.video_id,
      game_id: annotationBall.game_id,
    };
    return boundingBox;
  } catch {
    console.error("the data format of bounding box and annotation doesn't fit");
  }
};

export const convertBallboxToAnnotationBall = (
  boundingBox,
  horizontalScalingFactor,
  verticalScalingFactor,
) => {
  try {
    const x1 = boundingBox.left / horizontalScalingFactor;
    const y1 = boundingBox.top / verticalScalingFactor;
    return {
      id: boundingBox.id,
      video_id: boundingBox.my.video_id,
      game_id: boundingBox.my.game_id,
      frame_number: boundingBox.my.frame,
      displayName: boundingBox.my.key,
      x1: x1,
      y1: y1,
      x2:
        (boundingBox.width * boundingBox.scaleX) / horizontalScalingFactor + x1,
      y2:
        (boundingBox.height * boundingBox.scaleY) / verticalScalingFactor + y1,
      detection: 1,
      x: 0,
      y: 0,
      type: 1,
    };
  } catch {
    console.error(
      "the data format of bounding box ball and annotationBallTracks doesn't fit",
    );
  }
};
