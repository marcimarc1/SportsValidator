// multiSelectHandlers.js
import {
  multiMerge,
  multiBallTrailsDelete,
} from "../../../utils/validation";

export const handleMultiSelectMerge = (
  selectedTrails,
  setSelectedTrails,
  annotations,
  setAnnotations,
  alteredAnnotations,
  setAlteredAnnotations
) => {
  console.log("Multiplayer merge");
  console.log(Array.from(selectedTrails));
  multiMerge(
      Array.from(selectedTrails),
      annotations,
      setAnnotations,
      alteredAnnotations,
      setAlteredAnnotations,
  );
  setSelectedTrails([]);
};

export const handleMultiSelectMergeBall = (
  selectedTrailsBall,
  setSelectedTrailsBall,
  annotationBallTracks,
  setAnnotationBallTracks,
  alteredAnnotations,
  setAlteredAnnotations,
) => {
  console.log("Multiplayer merge ball");
  console.log(Array.from(selectedTrailsBall));
  multiMerge(
    Array.from(selectedTrailsBall),
    annotationBallTracks,
    setAnnotationBallTracks,
      alteredAnnotations,
      setAlteredAnnotations,
  );
  setSelectedTrailsBall([]);
};

export const handleMultiBallTrailsDelete = (
  selectedTrailsBall,
  annotationBallTracks,
  setAnnotationBallTracks,
  setSelectedTrailsBall,
) => {
  console.log("Multiplayer delete ball trails");
  console.log(Array.from(selectedTrailsBall));
  multiBallTrailsDelete(
    Array.from(selectedTrailsBall),
    annotationBallTracks,
    setAnnotationBallTracks,
  );
  setSelectedTrailsBall([]);
};
