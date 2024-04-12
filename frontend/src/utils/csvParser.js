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
      const value = currentline[headerIndexMap[header]].trim();
      obj[header] =
        header === "FrameNo" || header === "PlayerKey"
          ? parseInt(value, 10)
          : parseFloat(value);
    });
    result.push(obj);
  }

  result.sort((a, b) =>
    a.FrameNo === b.FrameNo ? a.PlayerKey - b.PlayerKey : a.FrameNo - b.FrameNo,
  );

  return result;
};

  export const parseProcessedBalls = (csvContent) => {
    const lines = csvContent.trim().split("\n");
    const result = [];
  
    const expectedOrder = [
      "FrameNo",
      "trackNo",
      "x",
      "x1",
      "x2",
      "x_trans",
      "detection",
      "y",
      "y1",
      "y2",
      "y_trans",
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
        const value = currentline[headerIndexMap[header]].trim();
        obj[header] = header === "FrameNo" || header === "trackNo" ? parseInt(value, 10) : parseFloat(value);
      });
      result.push(obj);
    }
  
    result.sort((a, b) => a.FrameNo === b.FrameNo ? a.trackNo - b.trackNo : a.FrameNo - b.FrameNo);
    return result;
  };