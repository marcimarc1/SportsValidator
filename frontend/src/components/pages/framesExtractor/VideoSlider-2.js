import React, { useRef, useState, useEffect } from 'react';
import tracking from "../../../data/tracking_data.json";


function VideoSlider2() {
    const [src, setSrc] = useState("");
    const [seekTime, setSeekTime] = useState(0);
    const [seekFrame, setSeekFrame] = useState(0);
    // const [previousFrameIndex, setPreviousFrameIndex] = useState(0);
    var timestampIndex = 0;
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    // const framerate = 23.98;
    const frameDuration = 1001 / 24000;

    // Not using state here because 1) doesn't update properly with requestAnimationFrame, and 2) we don't want to re-render the view
    let previousFrameIndex = 0;
    let lastBoxIndex = 0;


    // timestamps = timestamps.map((value) => value + frameDuration / 3);

    const findFrameStartTimestamp = (timestamp) => {
        var start = timestamp / frameDuration;
    }


    // For changing video source file
    const handleChange = (event) => {
        try {
            // Get the uploaded file
            const file = event.target.files[0];

            // Transform file into blob URL
            setSrc(URL.createObjectURL(file));
        } catch (error) {
            console.error(error);
        }
    };




    // useEffect(() => {
    //     if (videoRef) {
    //         console.log("Video framerate : ", videoRef.current.frameRate);
    //     }
    // }, [videoRef]);




    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        const context = canvasElement.getContext('2d');
        const horizontalScalingFactor = canvasElement.width / 3840;
        const verticalScalingFactor = canvasElement.height / 2160;
        const boxIndexesCount = tracking.annotations.length;

        // Load video
        // videoElement.src = videoUrl;

        const drawBoundingBoxes = (frameIndex) => {
            // TODO Handle the case where the user seeks
            let boxIndex = lastBoxIndex;

            if (boxIndex >= boxIndexesCount)
                return;

            while (boxIndex < boxIndexesCount && tracking.annotations[boxIndex].image_id < frameIndex)
                boxIndex++;

            // Clear canvas
            context.clearRect(0, 0, canvasElement.width, canvasElement.height);

            // Drawing video
            context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

            while (boxIndex < boxIndexesCount && tracking.annotations[boxIndex].image_id == frameIndex) {
                const [x, y, width, height] = tracking.annotations[boxIndex].bbox
                const scaledX = x * horizontalScalingFactor;
                const scaledY = y * verticalScalingFactor;
                const scaledWidth = width * horizontalScalingFactor;
                const scaledHeight = height * verticalScalingFactor;
                // console.log("Drawing for box : ", boxIndex, ", frame : ", tracking.annotations[boxIndex].image_id,
                //     ", scaledX : ", scaledX, ", scaledY : ", scaledY);

                context.strokeStyle = 'red';
                context.lineWidth = 2;
                context.beginPath();
                context.rect(scaledX, scaledY, scaledWidth, scaledHeight);
                context.stroke();
                boxIndex++;
            }

            lastBoxIndex = boxIndex;
        };

        // const handleFrameUpdate = (currentFrameIndex) => {
        //     // const currentFrameIndex = Math.floor(videoElement.currentTime * 30); // Assuming 30 FPS
        //     drawBoundingBoxes(currentFrameIndex);
        // };

        videoElement.addEventListener('play', () => {
            requestAnimationFrame(updateCanvas);
        });

        const updateCanvas = () => {
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended)
                return;
            // TODO Return if video not loaded or not playing
            const currentFrameIndex = getCurrentTimestampFrame();
            if (currentFrameIndex > previousFrameIndex) {
                // console.log("New frame : " + currentFrameIndex);
                drawBoundingBoxes(currentFrameIndex);
                previousFrameIndex = currentFrameIndex;
            }
            requestAnimationFrame(updateCanvas);
        };

        return () => {
            videoElement.removeEventListener('play', () => {
                requestAnimationFrame(updateCanvas);
            });
        };
    }, [videoRef]);





    const getCurrentTimestampFrame = () => {
        // + 1 because 1st frame is at currentTime = 0
        return Math.floor(videoRef.current.currentTime / frameDuration) + 1;
    }

    const getReferenceTimestampForFrame = (n) => {
        return (n - 1) * frameDuration + frameDuration / 3;
    }

    // const handleNextFrame = () => {
    //     if (videoRef.current) {
    //         timestampIndex += 1
    //         const adjustedTimestamp = timestamps[timestampIndex] + frameDuration / 4;
    //         console.log("Frame number : " + (timestampIndex + 1) + ", timestamp : " + timestamps[timestampIndex] + ", adjusted timestamp : " + adjustedTimestamp);
    //         videoRef.current.currentTime = adjustedTimestamp;
    //         console.log("Timestamp : ", videoRef.current.currentTime);
    //     }
    // };

    // const handlePreviousFrame = () => {
    //     if (videoRef.current && timestampIndex > 0) {
    //         timestampIndex -= 1
    //         const adjustedTimestamp = timestamps[timestampIndex] + frameDuration / 4;
    //         console.log("Frame number : " + (timestampIndex + 1) + ", timestamp : " + timestamps[timestampIndex] + ", adjusted timestamp : " + adjustedTimestamp);
    //         videoRef.current.currentTime = adjustedTimestamp;
    //         console.log("Timestamp : ", videoRef.current.currentTime);
    //     }
    // };

    const handleNextFrame = () => {
        if (videoRef.current) {
            const nextFrame = seekFrame + 1;
            videoRef.current.currentTime = getReferenceTimestampForFrame(nextFrame);
            console.log("Next frame : ", nextFrame, ", Reference timestamp : ", videoRef.current.currentTime);
            setSeekFrame(nextFrame);
        }
    };

    const handlePreviousFrame = () => {
        if (videoRef.current && seekFrame > 0) {
            const previousFrame = seekFrame - 1;
            videoRef.current.currentTime = getReferenceTimestampForFrame(previousFrame)
            console.log("Previous frame : ", previousFrame, ", Reference timestamp : ", videoRef.current.currentTime);
            setSeekFrame(previousFrame);
        }
    };

    const setComputedFrame = () => {
        if (videoRef.current) {
            console.log("Current : ", videoRef.current.currentFrameTime);
            return;

            const previousFrame = seekFrame - 1;
            videoRef.current.currentTime = getReferenceTimestampForFrame(previousFrame)
            console.log("Previous frame : ", previousFrame, ", Reference timestamp : ", videoRef.current.currentTime);
            setSeekFrame(previousFrame);
        }
    }

    const handleVideoPause = () => {
        if (videoRef.current) {
            console.log("Current timestamp : ", videoRef.current.currentTime, ", frame duration : ", frameDuration);
            const frame = getCurrentTimestampFrame();
            const referenceTimestamp = getReferenceTimestampForFrame(frame);
            console.log("Computed frame : ", frame, ", reference timestamp : ", referenceTimestamp);

            const sStart = (frame - 1) * frameDuration;
            const sNext = frame * frameDuration;
            console.log("Supposed frame start timestamp : ", ((frame - 1) * frameDuration), ", next : ", sNext);
            return;

            videoRef.current.currentTime = referenceTimestamp
            console.log("Set reference timestamp : ", videoRef.current.currentTime);
            setSeekFrame(frame)
            setSeekTime(referenceTimestamp)
            // = Math.floor(videoRef.current.currentTime / frameDuration) * frameDuration;
            // console.log("Frame reference timestamp : ", frameStartTimestamp);
        }
    };

    const handleTimeInputChange = (event) => {
        try {
            const time = parseFloat(event.target.value);
            setSeekTime(time);
        } catch (error) {
            // Handle the error if parsing fails
            console.error('Invalid timestamp:', error);
        }
    };

    const handleFrameInputChange = (event) => {
        try {
            const frame = parseInt(event.target.value);
            setSeekFrame(frame);
        } catch (error) {
            // Handle the error if parsing fails
            console.error('Invalid frame:', error);
        }
    };

    const handleSeek = (event) => {
        if (videoRef.current) {
            videoRef.current.currentTime = seekTime;
            console.log("Timestamp : ", videoRef.current.currentTime);
            const frame = getCurrentTimestampFrame()
            console.log("Seek computed frame : ", frame);
            setSeekFrame(frame)
        }
    };

    const handleSeekFrame = (event) => {
        if (videoRef.current) {
            videoRef.current.currentTime = getReferenceTimestampForFrame(seekFrame);
            console.log("Set reference timestamp : ", videoRef.current.currentTime, " for frame : ", seekFrame);
        }
    };




    const handlePlay = () => {
        console.log(videoRef.current.currentTime);
    }

    // https://stackoverflow.com/questions/33834724/draw-video-on-canvas-html5
    // TODO Add to doc : this works on the whole page, basically requests the next frame from the whole browser window
    // const update = () => {
    //     const ctx = canvasRef.current.getContext('2d');
    //     ctx.drawImage(videoRef.current, 0, 0, 1280, 720);   
    //     console.log("Frame : " + parseInt(videoRef.current.currentTime / frameDuration))
    //     requestAnimationFrame(update); // wait for the browser to be ready to present another animation fram.       
    // }

    const videoLoadedData = () => {

    }

    return (
        <div>
            <input type="file" onChange={handleChange} />
            <div>
                <button onClick={handlePreviousFrame}>Previous Frame</button>
                <button onClick={setComputedFrame}>Current Frame</button>
                <button onClick={handleNextFrame}>Next Frame</button>
            </div>
            <div>
                <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={seekTime}
                    onChange={handleTimeInputChange}
                />
                <button onClick={handleSeek}>Seek</button>
            </div>
            <div>
                <input
                    type="number"
                    min="0"
                    step="1"
                    value={seekFrame}
                    onChange={handleFrameInputChange}
                />
                <button onClick={handleSeekFrame}>Seek Frame</button>
            </div>
            <video ref={videoRef} src={src} controls width={1280} height={720} onLoadedData={videoLoadedData} onPause={handleVideoPause}>
                Sorry, your browser doesn't support embedded videos.
            </video>
            <canvas ref={canvasRef} width={1920} height={1080} style={{width: "1280px", height: "720px"}}></canvas>
        </div>
    );
};

export default VideoSlider;