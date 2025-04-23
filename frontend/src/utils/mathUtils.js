export function inverse(matrix) {
  let mat = new window.cv.Mat(3, 3, window.cv.CV_64F);
  mat.data64F.set(matrix.flat());
  let invMat = new window.cv.Mat();
  window.cv.invert(mat, invMat, window.cv.DECOMP_LU);
  let inv = [
    [invMat.data64F[0], invMat.data64F[1], invMat.data64F[2]],
    [invMat.data64F[3], invMat.data64F[4], invMat.data64F[5]],
    [invMat.data64F[6], invMat.data64F[7], invMat.data64F[8]],
  ];
  return inv;
}

export function invertNoCV(matrix) {
  const n = matrix.length;
  const identity = matrix.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)));

  // Augment the original matrix with the identity matrix
  let augmented = matrix.map((row, i) => [...row, ...identity[i]]);

  // Perform Gaussian elimination
  for (let i = 0; i < n; i++) {
    // Find the pivot
    let pivotRow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(augmented[j][i]) > Math.abs(augmented[pivotRow][i])) {
        pivotRow = j;
      }
    }

    // Swap rows if necessary
    if (pivotRow !== i) {
      [augmented[i], augmented[pivotRow]] = [augmented[pivotRow], augmented[i]];
    }

    // Check if the matrix is singular
    if (augmented[i][i] === 0) {
      throw new Error("Matrix is singular and cannot be inverted.");
    }

    // Normalize the pivot row
    let pivot = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }

    // Eliminate the other rows
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        let factor = augmented[j][i];
        for (let k = 0; k < 2 * n; k++) {
          augmented[j][k] -= factor * augmented[i][k];
        }
      }
    }
  }

  // Extract the inverted matrix
  return augmented.map((row) => row.slice(n));
}
