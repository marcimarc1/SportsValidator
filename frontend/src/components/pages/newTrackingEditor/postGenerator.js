// posterGenerator.js

import { fabric } from 'fabric'; // Ensure you import fabric if not already in your project

export const generatePoster = (videoElement, frameDuration) => {
    // If video cannot be played, simply return
    if (videoElement.readyState === 0) return;

    // Get video content of the first frame
    videoElement.currentTime = frameDuration;

    const poster = new fabric.Image(videoElement, {
        left: 0,
        top: 0,
        width: videoElement.width,
        height: videoElement.height,
        selectable: true,
    });

    videoElement.currentTime = 0;
    return poster;
};
