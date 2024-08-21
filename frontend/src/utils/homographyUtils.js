import * as math from 'mathjs';


/**
 * Transform a point using a homography matrix.
 * @param {Object} point - The point to transform.
 * @param {Array} invHomography - The inverse of the homography matrix.
 * @param {Number} horizontalScalingFactor - The horizontal scaling factor.
 * @param {Number} verticalScalingFactor - The vertical scaling factor.
 * @returns {Object} - The transformed point.
 * @returns {Number} x - The x-coordinate of the transformed point.
 * @returns {Number} y - The y-coordinate of the transformed point.
 * @returns {Array} originalCoords - The original coordinates of the point.
 * @returns {String} id - The ID of the point.
*/
const transformPoint = (point, invHomography, horizontalScalingFactor, verticalScalingFactor) => {
    let transformedPoint = applyHomography(invHomography, point.coords);
    return {
      id: point.id,
      x: transformedPoint.x * horizontalScalingFactor,
      y: transformedPoint.y * verticalScalingFactor,
      originalCoords: point.coords,
    };
  };

/**
 * Apply a homography transformation to a point.
 * @param {Array} homography - The homography matrix.
 * @param {Array} point - The point to transform.
 * @returns {Object} - The transformed point.
 * @returns {Number} x - The x-coordinate of the transformed point.
 * @returns {Number} y - The y-coordinate of the transformed point.
 * @returns {Number} w - The homogeneous coordinate of the transformed point.
*/  
function applyHomography(homography, point) {
    let [x, y] = point;
    let w = homography[2][0] * x + homography[2][1] * y + homography[2][2];
    let transformedX =
      (homography[0][0] * x + homography[0][1] * y + homography[0][2]) / w;
    let transformedY =
      (homography[1][0] * x + homography[1][1] * y + homography[1][2]) / w;
  
    return { x: transformedX, y: transformedY };
  }
  

/**
 * Calculate the new homography based on the updated field points.
 * @param {Array} originalFieldPoints - Original field points before transformation.
 * @param {Array} updatedFieldPoints - Updated field points after transformation.
 * @param {Array} templatePoints - Template points of the field.
 * @returns {Array} - The new homography matrix.
 */
function calculateNewHomography(originalFieldPoints, updatedFieldPoints, templatePoints) {
    const srcPoints = [];
    const dstPoints = [];

    originalFieldPoints.forEach((originalPoint, index) => {
        const updatedPoint = updatedFieldPoints.find(p => p.id === originalPoint.id);
        if (updatedPoint) {
            srcPoints.push(templatePoints[index]);
            dstPoints.push([updatedPoint.x, updatedPoint.y]);
        }
    });

    if (srcPoints.length < 4 || dstPoints.length < 4) {
        console.error('Insufficient point correspondences:', { srcPoints, dstPoints });
        throw new Error('At least four point correspondences are required to compute homography.');
    }

    if (typeof window.cv === 'undefined') {
        console.error('OpenCV.js is not loaded.');
        return null;
    }

    const srcMat = window.cv.matFromArray(srcPoints.length, 2, window.cv.CV_32F, [].concat(...srcPoints));
    const dstMat = window.cv.matFromArray(dstPoints.length, 2, window.cv.CV_32F, [].concat(...dstPoints));

    let h = window.cv.findHomography(srcMat, dstMat);

    // Clean up OpenCV matrices
    srcMat.delete();
    dstMat.delete();

    var newHomography = [
        [h.data64F[0], h.data64F[1], h.data64F[2]],
        [h.data64F[3], h.data64F[4], h.data64F[5]],
        [h.data64F[6], h.data64F[7], h.data64F[8]],
    ]

    return math.inv(newHomography);
}

export { applyHomography, calculateNewHomography, transformPoint };