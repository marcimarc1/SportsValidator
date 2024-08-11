import * as math from 'mathjs';

/**
 * Calculate the new homography based on the updated field points.
 * @param {Array} originalFieldPoints - Original field points before transformation.
 * @param {Array} updatedFieldPoints - Updated field points after transformation.
 * @param {Array} templatePoints - Template points of the field.
 * @returns {Array} - The new homography matrix.
 */
export function calculateNewHomography(originalFieldPoints, updatedFieldPoints, templatePoints) {
    const srcPoints = [];
    const dstPoints = [];

    originalFieldPoints.forEach((originalPoint, index) => {
        console.log('Original Point:', originalPoint);
        const updatedPoint = updatedFieldPoints.find(p => p.id === originalPoint.id);
        console.log('Updated Point:', updatedPoint);
        if (updatedPoint) {
            srcPoints.push(templatePoints[index]);
            dstPoints.push([updatedPoint.x, updatedPoint.y]);
        }
    });

    console.log('Original Field Points:', originalFieldPoints);
    console.log('Updated Field Points:', updatedFieldPoints);
    console.log('Source Points for Homography:', srcPoints);
    console.log('Destination Points for Homography:', dstPoints);

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

    console.log('Source Matrix:', srcMat);
    console.log('Destination Matrix:', dstMat);
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