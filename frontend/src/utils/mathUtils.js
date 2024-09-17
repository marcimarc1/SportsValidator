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
