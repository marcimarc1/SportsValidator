import config from "../config.json";

function createSoccerTemplate(LENGTH, WIDTH) {
  const GOAL_WIDTH = config.soccer.goal.width;
  const GOAL_AREA_LENGTH = config.soccer.goal.areaLength;
  const GOAL_AREA_DEPTH = config.soccer.goal.areaDepth;
  const PENALTY_AREA_LENGTH = config.soccer.penaltyArea.length;
  const PENALTY_AREA_DEPTH = config.soccer.penaltyArea.depth;
  const MID_CIRCLE_RADIUS = config.soccer.middleCircle.radius;

  const points = {
    outerArea: [
      { id: "outer-0", coords: [0, 0] }, // Top-left
      { id: "outer-1", coords: [LENGTH, 0] }, // Top-right
      { id: "outer-2", coords: [LENGTH, WIDTH] }, // Bottom-right
      { id: "outer-3", coords: [0, WIDTH] }, // Bottom-left
    ],
    penaltyAreaLeft: [
      {
        id: "penalty-left-0",
        coords: [0, WIDTH / 2 - PENALTY_AREA_LENGTH / 2],
      }, // Top-left
      {
        id: "penalty-left-1",
        coords: [PENALTY_AREA_DEPTH, WIDTH / 2 - PENALTY_AREA_LENGTH / 2],
      }, // Top-right
      {
        id: "penalty-left-2",
        coords: [PENALTY_AREA_DEPTH, WIDTH / 2 + PENALTY_AREA_LENGTH / 2],
      }, // Bottom-right
      {
        id: "penalty-left-3",
        coords: [0, WIDTH / 2 + PENALTY_AREA_LENGTH / 2],
      }, // Bottom-left
    ],
    penaltyAreaRight: [
      {
        id: "penalty-right-0",
        coords: [
          LENGTH - PENALTY_AREA_DEPTH,
          WIDTH / 2 - PENALTY_AREA_LENGTH / 2,
        ],
      }, // Top-left
      {
        id: "penalty-right-1",
        coords: [LENGTH, WIDTH / 2 - PENALTY_AREA_LENGTH / 2],
      }, // Top-right
      {
        id: "penalty-right-2",
        coords: [LENGTH, WIDTH / 2 + PENALTY_AREA_LENGTH / 2],
      }, // Bottom-right
      {
        id: "penalty-right-3",
        coords: [
          LENGTH - PENALTY_AREA_DEPTH,
          WIDTH / 2 + PENALTY_AREA_LENGTH / 2,
        ],
      }, // Bottom-left
    ],
    goalAreaLeft: [
      {
        id: "goal-left-0",
        coords: [0, WIDTH / 2 - (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      }, // Top-left
      {
        id: "goal-left-1",
        coords: [
          GOAL_AREA_LENGTH,
          WIDTH / 2 - (GOAL_AREA_DEPTH + GOAL_WIDTH / 2),
        ],
      }, // Top-right
      {
        id: "goal-left-2",
        coords: [
          GOAL_AREA_LENGTH,
          WIDTH / 2 + (GOAL_AREA_DEPTH + GOAL_WIDTH / 2),
        ],
      }, // Bottom-right
      {
        id: "goal-left-3",
        coords: [0, WIDTH / 2 + (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      }, // Bottom-left
    ],
    goalAreaRight: [
      {
        id: "goal-right-0",
        coords: [
          LENGTH - GOAL_AREA_LENGTH,
          WIDTH / 2 - (GOAL_AREA_DEPTH + GOAL_WIDTH / 2),
        ],
      }, // Top-left
      {
        id: "goal-right-1",
        coords: [LENGTH, WIDTH / 2 - (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      }, // Top-right
      {
        id: "goal-right-2",
        coords: [LENGTH, WIDTH / 2 + (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      }, // Bottom-right
      {
        id: "goal-right-3",
        coords: [
          LENGTH - GOAL_AREA_LENGTH,
          WIDTH / 2 + (GOAL_AREA_DEPTH + GOAL_WIDTH / 2),
        ],
      }, // Bottom-left
    ],
    middleLine: [
      { id: "midline-0", coords: [LENGTH / 2, 0] }, // Top
      { id: "midline-1", coords: [LENGTH / 2, WIDTH] }, // Bottom
    ],
    middleCircle: {
      center: [LENGTH / 2, WIDTH / 2],
      radius: MID_CIRCLE_RADIUS,
    },
    penaltySpot: [
      { id: "penalty-spot-0", coords: [11, WIDTH / 2] },
      { id: "penalty-spot-1", coords: [LENGTH - 11, WIDTH / 2] },
    ],
  };

  const lines = {
    leftOuterLine: [
      points.outerArea[0],
      points.penaltyAreaLeft[0],
      points.goalAreaLeft[0],
      points.goalAreaLeft[3],
      points.penaltyAreaLeft[3],
      points.outerArea[3],
    ],
    rightOuterLine: [
      points.outerArea[1],
      points.penaltyAreaRight[1],
      points.goalAreaRight[1],
      points.goalAreaRight[2],
      points.penaltyAreaRight[2],
      points.outerArea[2],
    ],
    topOuterLine: [
      points.outerArea[0],
      points.middleLine[0],
      points.outerArea[1],
    ],
    bottomOuterLine: [
      points.outerArea[3],
      points.middleLine[1],
      points.outerArea[2],
    ],
    rightPenaltyAreaLeftLine: [
      points.penaltyAreaRight[0],
      points.penaltyAreaRight[3],
    ],
    rightPenaltyAreaBottomLine: [
      points.penaltyAreaRight[3],
      points.penaltyAreaRight[2],
    ],
    rightPenaltyAreaTopLine: [
      points.penaltyAreaRight[0],
      points.penaltyAreaRight[1],
    ],
    rightGoalAreaLeftLine: [points.goalAreaRight[0], points.goalAreaRight[3]],
    rightGoalAreaBottomLine: [points.goalAreaRight[3], points.goalAreaRight[2]],
    rightGoalAreaTopLine: [points.goalAreaRight[0], points.goalAreaRight[1]],
    leftPenaltyAreaRightLine: [
      points.penaltyAreaLeft[1],
      points.penaltyAreaLeft[2],
    ],
    leftPenaltyAreaBottomLine: [
      points.penaltyAreaLeft[2],
      points.penaltyAreaLeft[3],
    ],
    leftPenaltyAreaTopLine: [
      points.penaltyAreaLeft[0],
      points.penaltyAreaLeft[1],
    ],
    leftGoalAreaRightLine: [points.goalAreaLeft[1], points.goalAreaLeft[2]],
    leftGoalAreaBottomLine: [points.goalAreaLeft[2], points.goalAreaLeft[3]],
    leftGoalAreaTopLine: [points.goalAreaLeft[0], points.goalAreaLeft[1]],
    middleLine: points.middleLine,
  };

  return { points, lines };
}

function createTennisTemplate() {
  const LENGTH = config.tennis.field.length;
  const WIDTH = config.tennis.field.width;
  // const SERVICE_LINE = 6.4;
  const SERVICE_LINE_WIDTH = config.tennis.field.serviceLineWidth;
  const BASELINE = config.tennis.field.baseline;
  const BASELINE_WIDTH = config.tennis.field.baselineWidth;

  const points = {
    outerArea: [
      { id: "outer-0", coords: [0, 0] }, // Top-left
      { id: "outer-1", coords: [LENGTH, 0] }, // Top-right
      { id: "outer-2", coords: [LENGTH, WIDTH] }, // Bottom-right
      { id: "outer-3", coords: [0, WIDTH] }, // Bottom-left
    ],
    baselineCenterline: [
      { id: "baseline-center-0", coords: [BASELINE, WIDTH / 2] },
      { id: "baseline-center-1", coords: [LENGTH - BASELINE, WIDTH / 2] },
    ],
    baselineSingle: [
      { id: "baseline-single-0", coords: [BASELINE, BASELINE_WIDTH] },
      { id: "baseline-single-1", coords: [LENGTH - BASELINE, BASELINE_WIDTH] },
      {
        id: "baseline-single-2",
        coords: [LENGTH - BASELINE, WIDTH - BASELINE_WIDTH],
      },
      { id: "baseline-single-3", coords: [BASELINE, WIDTH - BASELINE_WIDTH] },
    ],
    centerNet: [{ id: "center-net", coords: [LENGTH / 2, WIDTH / 2] }],
    singleNet: [
      { id: "single-net-0", coords: [LENGTH / 2, BASELINE_WIDTH] },
      { id: "single-net-1", coords: [LENGTH / 2, WIDTH - BASELINE_WIDTH] },
    ],
    sideNet: [
      { id: "side-net-0", coords: [LENGTH / 2, 0] },
      { id: "side-net-1", coords: [LENGTH / 2, WIDTH] },
    ],
    serviceSingle: [
      { id: "service-single-0", coords: [0, SERVICE_LINE_WIDTH] },
      { id: "service-single-1", coords: [LENGTH, SERVICE_LINE_WIDTH] },
      { id: "service-single-2", coords: [LENGTH, WIDTH - SERVICE_LINE_WIDTH] },
      { id: "service-single-3", coords: [0, WIDTH - SERVICE_LINE_WIDTH] },
    ],
  };

  const lines = {
    outerLine: [
      points.outerArea[0],
      points.sideNet[0],
      points.outerArea[1],
      points.serviceSingle[1],
      points.serviceSingle[2],
      points.outerArea[2],
      points.sideNet[1],
      points.outerArea[3],
      points.serviceSingle[3],
      points.serviceSingle[0],
      points.outerArea[0],
    ],
    baselineCenterline: [
      points.baselineCenterline[0],
      points.centerNet[0],
      points.baselineCenterline[1],
    ],
    baselineSingle: [
      points.baselineSingle[0],
      points.singleNet[0],
      points.baselineSingle[1],
      points.baselineCenterline[1],
      points.baselineSingle[2],
      points.singleNet[1],
      points.baselineSingle[3],
      points.baselineCenterline[0],
      points.baselineSingle[0],
    ],
    sideNet: [
      points.sideNet[0],
      points.singleNet[0],
      points.centerNet[0],
      points.singleNet[1],
      points.sideNet[1],
    ],
    serviceSingle: [
      points.serviceSingle[0],
      points.baselineSingle[0],
      points.singleNet[0],
      points.baselineSingle[1],
      points.serviceSingle[1],
      points.serviceSingle[2],
      points.baselineSingle[2],
      points.singleNet[1],
      points.baselineSingle[3],
      points.serviceSingle[3],
      points.serviceSingle[0],
    ],
  };

  return { points, lines };
}

function createUltimateTemplate() {
  const ULTIMATE_FIELD_LENGTH = config.ultimate.field.length;
  const ULTIMATE_FIELD_WIDTH = config.ultimate.field.width;
  const ENDZONE_LENGTH = config.ultimate.field.endzoneLength;

  const outerAreaUltimate = [
    [0, 0],
    [0, ULTIMATE_FIELD_WIDTH],
    [ULTIMATE_FIELD_LENGTH, ULTIMATE_FIELD_WIDTH],
    [ULTIMATE_FIELD_LENGTH, 0],
  ];

  const goalPointsUltimate = [
    [ENDZONE_LENGTH, 0],
    [ENDZONE_LENGTH, ULTIMATE_FIELD_WIDTH],
    [ULTIMATE_FIELD_LENGTH - ENDZONE_LENGTH, ULTIMATE_FIELD_WIDTH],
    [ULTIMATE_FIELD_LENGTH - ENDZONE_LENGTH, 0],
  ];

  return {
    UFCorners: outerAreaUltimate,
    Goalline: goalPointsUltimate,
  };
}

export const getTemplate = (key, length = 103, width = 68) => {
  switch (key) {
    case "Soccer":
      return createSoccerTemplate(length, width);
    case "Tennis":
      return createTennisTemplate();
    case "Ultimate":
      return createUltimateTemplate();
    default:
      throw new Error("Template not found");
  }
};

export const getPointsToTrack = (key) => {
  switch (key) {
    case "Tennis":
      return [
        "outer-0",
        "outer-1",
        "outer-2",
        "outer-3",
        "baseline-center-0",
        "baseline-center-2",
        "single-net-0",
        "single-net-1",
      ];
    case "Soccer":
      return [
        "outer-0",
        "outer-1",
        "outer-2",
        "outer-3",
        "penalty-left-0",
        "penalty-left-1",
        "penalty-left-2",
        "penalty-left-3",
        "goal-left-0",
        "goal-left-1",
        "goal-left-2",
        "goal-left-3",
        "penalty-right-0",
        "penalty-right-1",
        "penalty-right-2",
        "penalty-right-3",
        "goal-right-0",
        "goal-right-1",
        "goal-right-2",
        "goal-right-3",
        "midline-0",
        "midline-1",
        "middle-circle",
        "penalty-spot-0",
        "penalty-spot-1",
      ];

    default:
      throw new Error("Template not found");
  }
};
