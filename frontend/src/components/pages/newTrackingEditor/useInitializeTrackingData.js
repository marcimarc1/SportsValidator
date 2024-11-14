// useInitializeTrackingData.js
import { useEffect } from "react";
import { parseProcessedPlayers, parseProcessedBallTracks } from "../../../utils/csvParser";
import { generateColor } from "../../../utils/colorGenerator";


function boundingBoxColorSet(annotationList) {
    let uniquePlayerKeys = new Set(
        annotationList.map((item) => item.PlayerKey),
    );
    let colorSet = new Map();

    uniquePlayerKeys.forEach((key) => {
        let color = generateColor(key);
        colorSet.set(key, color);
    });
    return colorSet;
}
function boundingBoxColorSetBall(annotationBallList) {
    let uniqueBallKeys = new Set(
        annotationBallList.map((item) => item.trackNo),
    );
    let colorSet = new Map();

    uniqueBallKeys.forEach((key) => {
        let color = generateColor(key);
        colorSet.set(key, color);
    });
    return colorSet;
}

const useInitializeTrackingData = (
    video,
    processedPlayers,
    processedBallTracks,
    setVideoUrl,
    setAnnotations,
    setColorSet,
    setPlayerNameMap,
    setAnnotationBallTracks,
    setColorSetBall,
    setBallNameMap
) => {
    useEffect(() => {
        if (video) {
            setVideoUrl(URL.createObjectURL(video));
        }

        if (processedPlayers) {
            const parsedData = parseProcessedPlayers(processedPlayers);
            setAnnotations(parsedData);
            console.log("retrieved annotation:", parsedData);
            setColorSet(boundingBoxColorSet(parsedData));

            const playerKeys = parsedData.map((a) => a.PlayerKey);
            const tempMap = new Map();
            playerKeys.forEach((key) => {
                const playerName = "player" + key;
                tempMap.set(key, playerName);
            });
            setPlayerNameMap(tempMap);
        }

        if (processedBallTracks) {
            const parsedBallTracks = parseProcessedBallTracks(processedBallTracks);
            setAnnotationBallTracks(parsedBallTracks);
            console.log("retrieved ball tracks:", parsedBallTracks);
            setColorSetBall(boundingBoxColorSetBall(parsedBallTracks));

            const ballKeys = parsedBallTracks.map((a) => a.trackNo);
            const tempMap = new Map();
            ballKeys.forEach((key) => {
                const ballName = "ball" + key;
                tempMap.set(key, ballName);
            });
            setBallNameMap(tempMap);
        }
    }, [video, processedPlayers, processedBallTracks]);
};

export default useInitializeTrackingData;