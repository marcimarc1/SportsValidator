import React, { useRef, useState, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({ log: true });

function FrameSlider() {
  const [ready, setReady] = useState(false);
  const [frames, setFrames] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const canvasRef = useRef(null);


  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  useEffect(() => {
    load();
  }, [])


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas)
      return;
    const context = canvas.getContext('2d');
    const frame = frames[currentImage];
    if (!frame)
      return;
    
    // console.log("Frames : ", frames)
    const filePath = `/${frames[currentImage]}`;
    // console.log("Reading filepath : " + filePath)
    const data = ffmpeg.FS('readFile', frames[currentImage]);
    // console.log("Data : " + data)

    const image = new Image();
    image.src = URL.createObjectURL(new Blob([data.buffer], { type: 'image/png' }));
    // image.src = URL.createObjectURL(data.buffer);
    
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(image.src);
    };
  }, [currentImage, frames]);

  const handleNext = () => {
    setCurrentImage((prevImage) => (prevImage + 1) % frames.length);
  };

  const handlePrev = () => {
    setCurrentImage((prevImage) => (prevImage - 1 + frames.length) % frames.length);
  };

  const handleSliderChange = (event) => {
    setCurrentImage(Number(event.target.value));
  };

  const loadFFmpeg = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  // async function extractFramesFromVideo(file) {
  //   ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
  //   await ffmpeg.run('-i', 'input.mp4', 'output_%d.png');

  //   const testInterval = setInterval( () => {

  //   }, 1000 )

  //   const files = ffmpeg.FS('readdir', '/');
  //   console.log(files)
  //   const frames = files
  //     .filter(file => file.name.startsWith('output_'))
  //     .map(file => file.name);
  //   return frames;
  // }

  function setVideo(video) {
    ffmpeg.FS('writeFile', 'input.mp4', video);
    // ffmpeg.run('-i', 'input.mp4', 'output_%d.png');
    ffmpeg.run('-i', 'input.mp4', 'output_%d.png', '-vframes', '500');
    // ffmpeg -i in.mp4 -vf select='eq(n\,100)+eq(n\,184)+eq(n\,213)' -vsync 0 frames%d.jpg
    // await ffmpeg.run("-i", "input.mp4", "-vf", "select='eq(n\,100)+eq(n\,184)+eq(n\,213)'", "-vsync", "0", "output_%d.png");
    var previousFramesCount = 0;
    // TODO Start it when frames count > 0 ?
    const testInterval = setInterval(() => {
      const filenames = ffmpeg.FS('readdir', '/');
      const frames = filenames.filter(filename => filename.startsWith('output_'));
      const newFramesCount = frames.length;
      if (newFramesCount == 0)
        return;
      if (newFramesCount == previousFramesCount) {
        clearInterval(testInterval);
        return;
      } else {
        previousFramesCount = newFramesCount;
      }
      // console.log(filenames);
      setFrames(frames);
    }, 1000);
  }


  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    console.log("Filename : ", file.name)

    if (file) {
      setVideo(await fetchFile(file))
    }
  };

  async function handleDownload() {
    const response = await fetch("http://localhost:3030/Vilebrequin.mp4");
    console.log(response)
    const data = await response.blob();
    setVideo(data);
  }

  return ready ? (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleDownload}>Download !</button>
      
      <div>
        <button onClick={handlePrev} disabled={currentImage === 0}>Previous</button>
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={currentImage}
          onChange={handleSliderChange}
        />
        <button onClick={handleNext} disabled={currentImage === frames.length - 1}>Next</button>
      </div>
      <p>Image {currentImage + 1} of {frames.length}</p>
      <canvas ref={canvasRef} width={1440} height={810} />
    </div>
    
  ) : (
    <div>
      <p>Loading ffmpeg</p>
    </div>
  )
};

export default FrameSlider;