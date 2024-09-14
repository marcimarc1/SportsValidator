export function inverse(matrix) {
  const n = matrix.length;

  if (n === 2) {
    const determinant =
      matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (determinant === 0) {
      throw new Error("Matrix is singular and cannot be inverted.");
    }

    const invDet = 1 / determinant;

    return [
      [matrix[1][1] * invDet, -matrix[0][1] * invDet],
      [-matrix[1][0] * invDet, matrix[0][0] * invDet],
    ];
  } else if (n === 3) {
    const a = matrix[0][0],
      b = matrix[0][1],
      c = matrix[0][2];
    const d = matrix[1][0],
      e = matrix[1][1],
      f = matrix[1][2];
    const g = matrix[2][0],
      h = matrix[2][1],
      i = matrix[2][2];

    const determinant =
      a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

    if (determinant === 0) {
      throw new Error("Matrix is singular and cannot be inverted.");
    }

    const invDet = 1 / determinant;

    return [
      [
        (e * i - f * h) * invDet,
        (c * h - b * i) * invDet,
        (b * f - c * e) * invDet,
      ],
      [
        (f * g - d * i) * invDet,
        (a * i - c * g) * invDet,
        (c * d - a * f) * invDet,
      ],
      [
        (d * h - e * g) * invDet,
        (b * g - a * h) * invDet,
        (a * e - b * d) * invDet,
      ],
    ];
  } else {
    throw new Error("This function only supports 2x2 and 3x3 matrices.");
  }
}
