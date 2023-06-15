# Video transfer analysis


## Upload


## Download

Video used :
- Length : 4'48''
- Framerate : 24 fps
- Total number of frames : 6912
- Resolution : 3840x2160
- Initial size : 3760 Mb
- Compressed size with x265 codec : 120 Mb (~x30 compression factor)
- Average extracted frame size : 13.5 Mb

Transfer speeds :
- Git push max upload speed : 13 Mb/s
- Gitlab average video download speed : 25 Mb/s
- Download speed is 10 Mb

### Setup 1
- Video resolution : 3840x2160
- Video size : 120 Mb
- Average frame size : 13.5 Mb

Option 1 results :
- Video download time : 5 s. However there is a way to start decoding frames as soon as first video chunk arrives
- Frames extraction speed : 5.5 fps

Option 2 results :
- Frames download rate : 2 fps


### Setup 2
- Video resolution : 1920x1080
- Video size : 50 Mb
- Average frame size : 3.8 Mb


Option 1 results :
- Video download time : 2 s.
- Frames extraction speed : 23 fps

Option 2 results :
- Frames download rate : 7 fps

### Setup 2

Option 1 :
- Video download time : 12 s. Possibility to use already downloaded frames at each second
- Frames extraction speed : ~5.5 fps on my M1 macbook air

- For FullHD x265 video : ~23 fps


Option 2 :
Calculated :
- Image download rate : ~2 fps
Advantages :
- Image download rate grows linearly with transfer speed


Case scenario 2 :
- Extracted image size : ~3.8 Mb -> 7 fps on download theoretically


Conversion speed :
`ffmpeg -i 10.MP4 -vcodec libx264 -crf 20 -preset ultrafast outputx264_4k.mp4` : ~50 fps, ~138 sec for 4'48''
