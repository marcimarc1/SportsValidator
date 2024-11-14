// multiSelectHandlers.js

export const handleMultiSelectMerge = (
    selectedTrails,
    annotations,
    setAnnotations,
    playerNameMap,
    setPlayerNameMap,
    setSelectedTrails,
    multiPlayerMerge
) => {
    console.log("Multiplayer merge");
    console.log(Array.from(selectedTrails));
    multiPlayerMerge(
        Array.from(selectedTrails),
        annotations,
        setAnnotations,
        playerNameMap,
        setPlayerNameMap
    );
    setSelectedTrails([]);
};

export const handleMultiSelectMergeBall = (
    selectedTrailsBall,
    annotationBallTracks,
    setAnnotationBallTracks,
    ballNameMap,
    setBallNameMap,
    setSelectedTrailsBall,
    multiBallMerge
) => {
    console.log("Multiplayer merge ball");
    console.log(Array.from(selectedTrailsBall));
    multiBallMerge(
        Array.from(selectedTrailsBall),
        annotationBallTracks,
        setAnnotationBallTracks,
        ballNameMap,
        setBallNameMap
    );
    setSelectedTrailsBall([]);
};

export const handleMultiBallTrailsDelete = (
    selectedTrailsBall,
    annotationBallTracks,
    setAnnotationBallTracks,
    ballNameMap,
    setBallNameMap,
    setSelectedTrailsBall,
    multiBallTrailsDelete
) => {
    console.log("Multiplayer delete ball trails");
    console.log(Array.from(selectedTrailsBall));
    multiBallTrailsDelete(
        Array.from(selectedTrailsBall),
        annotationBallTracks,
        setAnnotationBallTracks,
        ballNameMap,
        setBallNameMap
    );
    setSelectedTrailsBall([]);
};
