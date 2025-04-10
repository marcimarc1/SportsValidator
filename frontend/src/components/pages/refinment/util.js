import { getTemplate } from "../../../utils/templates";
import { invertNoCV } from "../../../utils/mathUtils";
import { transformPoint } from "../../../utils/homographyUtils";

export function convertFieldPointsFormat(fieldPoints) {
  return {
    outerArea: [
      getObjectWithId("outer-0", fieldPoints),
      getObjectWithId("outer-1", fieldPoints),
      getObjectWithId("outer-2", fieldPoints),
      getObjectWithId("outer-3", fieldPoints),
    ],
    penaltyAreaLeft: [
      getObjectWithId("penalty-left-0", fieldPoints),
      getObjectWithId("penalty-left-1", fieldPoints),
      getObjectWithId("penalty-left-2", fieldPoints),
      getObjectWithId("penalty-left-3", fieldPoints),
    ],
    penaltyAreaRight: [
      getObjectWithId("penalty-right-0", fieldPoints),
      getObjectWithId("penalty-right-1", fieldPoints),
      getObjectWithId("penalty-right-2", fieldPoints),
      getObjectWithId("penalty-right-3", fieldPoints),
    ],
    goalAreaLeft: [
      getObjectWithId("goal-left-0", fieldPoints),
      getObjectWithId("goal-left-1", fieldPoints),
      getObjectWithId("goal-left-2", fieldPoints),
      getObjectWithId("goal-left-3", fieldPoints),
    ],
    goalAreaRight: [
      getObjectWithId("goal-right-0", fieldPoints),
      getObjectWithId("goal-right-1", fieldPoints),
      getObjectWithId("goal-right-2", fieldPoints),
      getObjectWithId("goal-right-3", fieldPoints),
    ],
    middleLine: [
      getObjectWithId("midline-0", fieldPoints),
      getObjectWithId("midline-1", fieldPoints),
    ],
    penaltySpot: [
      getObjectWithId("penalty-spot-0", fieldPoints),
      getObjectWithId("penalty-spot-1", fieldPoints),
    ],
  };
}

function getObjectWithId(id, array) {
  return array.find((obj) => obj.id === id);
}

export function saveHomographyAsJsonFile(
  homography,
  watchedFrames,
  logFile,
  canvas,
  fieldSize,
  filename = "refined_homography.json",
) {
  const dict = homographyToFieldData(homography, logFile, canvas, fieldSize);
  const filteredDict = {};

  Object.entries(dict).forEach(([key, value]) => {
    const index = Number(key); // convert string key to number if needed
    if (watchedFrames.some((sublist) => sublist[0] === index)) {
      filteredDict[index] = value;
    }
  });

  const jsonString = JSON.stringify(filteredDict, null, 2); // pretty-printed

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url); // Clean up
}

export function homographyToFieldData(
  homographies,
  logFile,
  canvas,
  fieldSize,
) {
  const { points, lines } = getTemplate(
    logFile.Sport,
    fieldSize?.length ?? 103,
    fieldSize?.height ?? 68,
  );

  const res = {};

  for (let i = 0; i < Object.entries(homographies).length; i++) {
    // Fill out the entire refinement object for this frame
    let homography = homographies[i];
    // Using normal invert causes issue window.cv.Mat is not a constructor, this is a workaround
    let invHomography = invertNoCV(homography);

    const innerRes = {};

    for (const [key, value] of Object.entries(points)) {
      if (Array.isArray(value) && key !== "middleCircle") {
        innerRes[key] = [];
        // invert
        value.forEach((elem) => {
          innerRes[key].push(
            transformPoint(
              elem,
              invHomography,
              canvas.height / 3840,
              canvas.width / 2460,
            ),
          );
        });
      }
    }
    innerRes["frame"] = i;
    // Enable once filterBoxes data is correct
    // innerRes["filterBoxes"] = filterBoxes[i]
    res[i] = innerRes;
  }
  return res;
}
