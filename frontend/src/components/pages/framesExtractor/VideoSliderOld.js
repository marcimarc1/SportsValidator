import React, { useRef, useState, useEffect } from 'react';
import tracking from "../../../data/tracking_data.json";


function VideoSliderOld() {
    const [src, setSrc] = useState("");
    const [seekTime, setSeekTime] = useState(0);
    const [seekFrame, setSeekFrame] = useState(0);
    var timestampIndex = 0;
    const videoRef = useRef(null);
    // const framerate = 23.98;
    const frameDuration = 1001 / 24000;

    const timestamps = [
        0,
        0.0417083,
        0.0834167,
        0.125125,
        0.166833,
        0.208542,
        0.25025,
        0.291958,
        0.333667,
        0.375375,
        0.417083,
        0.458792,
        0.5005,
        0.542208,
        0.583917,
        0.625625,
        0.667333,
        0.709042,
        0.75075,
        0.792458,
        0.834167,
        0.875875,
        0.917583,
        0.959292,
        1.001,
        1.04271,
        1.08442,
        1.12613,
        1.16783,
        1.20954,
        1.25125,
        1.29296,
        1.33467,
        1.37637,
        1.41808,
        1.45979,
        1.5015,
        1.54321,
        1.58492,
        1.62662,
        1.66833,
        1.71004,
        1.75175,
        1.79346,
        1.83517,
        1.87687,
        1.91858,
        1.96029,
        2.002,
        2.04371,
        2.08542,
        2.12712,
        2.16883,
        2.21054,
        2.25225,
        2.29396,
        2.33567,
        2.37737,
        2.41908,
        2.46079,
        2.5025,
        2.54421,
        2.58592,
        2.62763,
        2.66933,
        2.71104,
        2.75275,
        2.79446,
        2.83617,
        2.87787,
        2.91958,
        2.96129,
        3.003,
        3.04471,
        3.08642,
        3.12812,
        3.16983,
        3.21154,
        3.25325,
        3.29496,
        3.33667,
        3.37837,
        3.42008,
        3.46179,
        3.5035,
        3.54521,
        3.58692,
        3.62862,
        3.67033,
        3.71204,
        3.75375,
        3.79546,
        3.83717,
        3.87887,
        3.92058,
        3.96229,
        4.004,
        4.04571,
        4.08742,
        4.12913,
        4.17083,
        4.21254,
        4.25425,
        4.29596,
        4.33767,
        4.37937,
        4.42108,
        4.46279,
        4.5045,
        4.54621,
        4.58792,
        4.62962,
        4.67133,
        4.71304,
        4.75475,
        4.79646,
        4.83817,
        4.87988,
        4.92158,
        4.96329,
        5.005,
        5.04671,
        5.08842,
        5.13012,
        5.17183,
        5.21354,
        5.25525,
        5.29696,
        5.33867,
        5.38037,
        5.42208,
        5.46379,
        5.5055,
        5.54721,
        5.58892,
        5.63063,
        5.67233,
        5.71404,
        5.75575,
        5.79746,
        5.83917,
        5.88087,
    ]


    // timestamps = timestamps.map((value) => value + frameDuration / 3);

    const findFrameStartTimestamp = (timestamp) => {
        var start = timestamp / frameDuration;
    }

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

    useEffect(() => {
        if (videoRef) {
            console.log("Video framerate : ", videoRef.current.frameRate);
        }
    }, [videoRef]);

    const getCurrentTimestampFrame = () => {
        return Math.floor(videoRef.current.currentTime / frameDuration);
    }

    const getReferenceTimestampForFrame = (n) => {
        return n * frameDuration + frameDuration / 3;
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

    const handleVideoPause = () => {
        if (videoRef.current) {
            console.log("Frame duration : ", frameDuration);
            const frame = getCurrentTimestampFrame()
            const referenceTimestamp = getReferenceTimestampForFrame(frame)
            console.log("Pause timestamp : ", videoRef.current.currentTime, ", computed frame : ", frame);
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
    const update = () => {
        
        console.log("Frame : " + parseInt(videoRef.current.currentTime / frameDuration))
        requestAnimationFrame(update); // wait for the browser to be ready to present another animation fram.       
    }

    return (
        <div>
            <input type="file" onChange={handleChange} />
            <div>
                <button onClick={handlePreviousFrame}>Previous Frame</button>
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
            <video ref={videoRef} src={src} controls width="80%" onPause={handleVideoPause} onProgress={handlePlay} onLoadedData={update}>
                Sorry, your browser doesn't support embedded videos.
            </video>
        </div>
    );
};

export default VideoSlider;