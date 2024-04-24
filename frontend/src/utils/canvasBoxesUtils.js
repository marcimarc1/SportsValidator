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

export function defineBoxBehavior(playerBox, canvas, annotations) {
  playerBox.on({
    selected: () => {},
    mousedown: () => {},
    mouseover: () => {},
  });

  playerBox.on({
    deselected: () => {},
    mouseout: () => {},
  });

  playerBox.on({
    modified: () => {
      var boundingRect = playerBox.getBoundingRect();
      var scaleX = playerBox.scaleX; // Save current scale factors
      var scaleY = playerBox.scaleY;
      // Calculate actual width and height based on scale factors
      //when scaling the box, only scaleX and scaleY change, while width and height not
      var actualWidth = (boundingRect.width - playerBox.strokeWidth) / scaleX;
      var actualHeight = (boundingRect.height - playerBox.strokeWidth) / scaleY;
      playerBox.left = boundingRect.left;
      playerBox.top = boundingRect.top;
      playerBox.width = actualWidth;
      playerBox.height = actualHeight;

      const horizontalScalingFactor = canvas.width / 3840;
      const verticalScalingFactor = canvas.height / 2160;
      const modifiedAnnotation = convertBoxToAnnotation(
        playerBox,
        horizontalScalingFactor,
        verticalScalingFactor,
      );
      console.log(modifiedAnnotation);
      const annotationToReplace = annotations.findIndex(
        (a) =>
          a.FrameNo == playerBox.my.frame && a.PlayerKey == playerBox.my.key,
      );
      if (annotationToReplace == -1) {
        console.error(
          "the modified bounding box doesn't exist in annotations.",
        );
      }
      annotations.splice(annotationToReplace, 1, modifiedAnnotation);
      canvas.renderAll();
    },
  });

  return playerBox;
}
