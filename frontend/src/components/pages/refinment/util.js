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
