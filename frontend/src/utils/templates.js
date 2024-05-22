function createSoccerTemplate(LENGTH = 100, WIDTH = 50) {
  const GOAL_WIDTH = 7.32;
  const GOAL_AREA_LENGTH = 5.5;
  const GOAL_AREA_DEPTH = 5.5;
  const PENALTY_AREA_LENGTH = 40.3; 
  const PENALTY_AREA_DEPTH = 16.5;
  const MID_CIRCLE_RADIUS = 9.15;

  const outerArea = [
    [0, 0],
    [0, WIDTH],
    [LENGTH, WIDTH],
    [LENGTH, 0],
  ];

  let penaltyAreaRight = [
    [
      [
        LENGTH - PENALTY_AREA_DEPTH,
        WIDTH / 2 - PENALTY_AREA_LENGTH / 2,
      ],
      [
        LENGTH - PENALTY_AREA_DEPTH,
        WIDTH / 2 + PENALTY_AREA_LENGTH / 2,
      ],
      [
        LENGTH,
        WIDTH / 2 + PENALTY_AREA_LENGTH / 2,
      ],
      [
        LENGTH,
        WIDTH / 2 - PENALTY_AREA_LENGTH / 2,
      ]
    ]
  ];
  
  let penaltyAreaLeft = [
    [
      [
        PENALTY_AREA_DEPTH,
        WIDTH / 2 - PENALTY_AREA_LENGTH / 2,
      ],
      [
        PENALTY_AREA_DEPTH,
        WIDTH / 2 + PENALTY_AREA_LENGTH / 2,
      ],
      [0, WIDTH / 2 + PENALTY_AREA_LENGTH / 2],
      [0, WIDTH / 2 - PENALTY_AREA_LENGTH / 2],
    ]
  ];  

  const penaltyArea = penaltyAreaLeft.concat(penaltyAreaRight);

  let goalAreaRight = [
    [
      [LENGTH - GOAL_AREA_LENGTH, WIDTH / 2 - (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      [LENGTH - GOAL_AREA_LENGTH, WIDTH / 2 + (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      [LENGTH, WIDTH / 2 + (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      [LENGTH, WIDTH / 2 - (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
    ]
  ];

  let goalAreaLeft = [
    [
      [GOAL_AREA_LENGTH, WIDTH / 2 - (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      [GOAL_AREA_LENGTH, WIDTH / 2 + (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      [0, WIDTH / 2 + (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
      [0, WIDTH / 2 - (GOAL_AREA_DEPTH + GOAL_WIDTH / 2)],
    ]
  ];

  const goalArea = goalAreaLeft.concat(goalAreaRight);

  const middleLine = [
    [LENGTH / 2, 0],
    [LENGTH / 2, WIDTH]
  ];

  const middleCircle = { 
    center: [LENGTH / 2, WIDTH / 2], 
    radius: MID_CIRCLE_RADIUS 
  };

  const penaltySpot = [
    [[11, WIDTH / 2]],
    [[LENGTH - 11, WIDTH / 2]]
  ];

  return {
    Corners: outerArea,
    '16m': penaltyArea,
    '5m': goalArea,
    Midline: middleLine,
    Midcircle: middleCircle,
    PenaltySpots: penaltySpot
  };
}

function createTennisTemplate() {
  const LENGTH = 23.77;
  const WIDTH = 8.23 + 2 * 1.37;
  const SERVICE_LINE = 6.4;
  const SERVICE_LINE_WIDTH = 1.37;
  const BASELINE = 5.49;
  const BASELINE_WIDTH = 1.37;

  const outerAreaTennis = [
    [0, 0],
    [0, WIDTH],
    [LENGTH, WIDTH],
    [LENGTH, 0],
  ];

  const baselineCenterline = [
    [BASELINE, WIDTH / 2],
    [LENGTH - BASELINE, WIDTH / 2],
  ];

  const baselineSingle = [
    [BASELINE, BASELINE_WIDTH],
    [LENGTH - BASELINE, BASELINE_WIDTH],
    [LENGTH - BASELINE, WIDTH - BASELINE_WIDTH],
    [BASELINE, WIDTH - BASELINE_WIDTH],
  ];

  const centerNet = [[LENGTH / 2, WIDTH / 2]];

  const singleNet = [
    [LENGTH / 2, WIDTH - BASELINE_WIDTH],
    [LENGTH / 2, BASELINE_WIDTH],
  ];

  const sideNet = [
    [LENGTH / 2, WIDTH],
    [LENGTH / 2, 0],
  ];

  const serviceSingle = [
    [0, WIDTH - SERVICE_LINE_WIDTH],
    [LENGTH, WIDTH - SERVICE_LINE_WIDTH],
    [LENGTH, SERVICE_LINE_WIDTH],
    [0, SERVICE_LINE_WIDTH],
  ];

  return {
    Corners: outerAreaTennis,
    BaseLineXcenterline: baselineCenterline,
    BaselineXsingle: baselineSingle,
    CenterLineXnet: centerNet,
    NetXsingle: singleNet,
    NetXsideLine: sideNet,
    ServiceXsingle: serviceSingle,
  };
}

function createUltimateTemplate() {
  const ULTIMATE_FIELD_LENGTH = 100;
  const ULTIMATE_FIELD_WIDTH = 37;
  const ENDZONE_LENGTH = 18.5;

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

export const getTemplate = (key = "Soccer", length = 100, width = 50) => {
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
