export const parseProcessedPlayers = (csvContent) => {
  const lines = csvContent.trim().split("\n");
  const result = [];

  const expectedOrder = [
    "FrameNo",
    "PlayerKey",
    "h",
    "w",
    "x",
    "x1",
    "x2",
    "x_trans",
    "y",
    "y1",
    "y2",
    "y_trans",
    "in_field",
  ];
  const headers = lines[0].split(",");

  let headerIndexMap = {};
  headers.forEach((header, index) => {
    headerIndexMap[header.trim()] = index;
  });

  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i].split(",");
    if (currentline.length === 1 && currentline[0].trim() === "") continue;

    let obj = {};
    expectedOrder.forEach((header) => {
      if (header in headerIndexMap) {
        const value = currentline[headerIndexMap[header]].trim();
        if (header === "in_field") {
          obj[header] = value === "True" || value === "true" || value === "1";
        } else {
          obj[header] =
            header === "FrameNo" || header === "PlayerKey"
              ? parseInt(value, 10)
              : parseFloat(value);
        }
      } else {
        obj[header] = header === "in_field" ? null : undefined;
      }
    });
    result.push(obj);
  }

  result.sort((a, b) =>
    a.FrameNo === b.FrameNo ? a.PlayerKey - b.PlayerKey : a.FrameNo - b.FrameNo,
  );

  return result;
};

export const parseProcessedBallTracks = (csvContent) => {
  const lines = csvContent.trim().split("\n");
  const result = [];

  const expectedOrder = [
    "FrameNo",
    "x1",
    "y1",
    "x2",
    "y2",
    "trackNo",
    "detection",
    "x",
    "y",
  ];
  const headers = lines[0].split(",");

  let headerIndexMap = {};
  headers.forEach((header, index) => {
    headerIndexMap[header.trim()] = index;
  });

  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i].split(",");
    if (currentline.length === 1 && currentline[0].trim() === "") continue;

    let obj = {};
    expectedOrder.forEach((header) => {
      if (header in headerIndexMap) {
        const value = currentline[headerIndexMap[header]].trim();
        obj[header] =
          header === "FrameNo" || header === "trackNo"
            ? parseInt(value, 10)
            : parseFloat(value);
      } else {
        obj[header] = header === "in_field" ? null : undefined;
      }
    });
    result.push(obj);
  }
  result.sort((a, b) =>
    a.FrameNo === b.FrameNo ? a.trackNo - b.trackNo : a.FrameNo - b.FrameNo,
  );
  return result;
};
