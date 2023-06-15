# Documentation draft, to be reorganized later

## Video upload

1. Progress display : it is actually all handled by the browser. Javascript splits this very large http requests and we can get the information of how many chunks have been sent at a given moment. More information on event frequency : https://stackoverflow.com/questions/5495625/xmlhttprequest-onprogress-interval





## Technical

- When defining route, we need to use handlers. These handlers need an extractorm which as the name suggest helps extract part of the information of the request. cf https://docs.rs/axum/latest/axum/extract/index.html

Useful link :
- Range requests : https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
- React streaming app : https://www.linode.com/docs/guides/build-react-video-streaming-app/
- Cf chatGPT conversation
- Explanation on Json(payload) : https://www.reddit.com/r/rust/comments/xgvlxm/function_argument_name_wrapped_with_struct_or/
- Keywork impl : https://doc.rust-lang.org/std/keyword.impl.html
- Object orientation : https://stevedonovan.github.io/rust-gentle-intro/object-orientation.html


Video
- Fireship ffmpeg in react : https://www.youtube.com/watch?v=-OTc0Ki7Sv0
- Extract frames with ffmpeg executable : https://superuser.com/questions/1779006/how-to-extract-all-the-frames-from-video-file-instead-only-one-frame
- FFmpeg not working at all : https://juejin.cn/post/7135709942274605087
- Github repo : https://github.com/ffmpegwasm/react-app/blob/master/src/App.js
- Selecting specific frames : https://superuser.com/questions/1707609/ffmpeg-extract-several-individual-frames-from-a-video-given-a-list-of-timestamp
- https://stackoverflow.com/questions/60490058/fetch-video-parts-like-the-browser
- Compression : https://unix.stackexchange.com/questions/28803/how-can-i-reduce-a-videos-size-with-ffmpeg
- Faster compression ? : https://stackoverflow.com/questions/31624787/ffmpeg-very-slow-conversion




Tracking : 
1 - Question : how to access the file system to store extracted images ? Memfs provides in memory file system in javascript
2 - Question : How wasm works, FFmpeg.wasm library
2 - Issue : Unable to have ffmpeg libs working at all, issue with versions
4 - Issue : `ReferenceError: SharedArrayBuffer is not defined`. Has to do with CORS. Detail how CORS work and why it leads to SharedArrayBuffer being disabled.
https://stackoverflow.com/questions/72006669/ffmpeg-ffmpeg-uncaught-in-promise-referenceerror-sharedarraybuffer-is-not-d
https://stackoverflow.com/questions/64650119/react-error-sharedarraybuffer-is-not-defined-in-firefox




FFmpeg commands :
ffmpeg -i input.mp4 output_%d.png
ffmpeg -i outputx264_fhd_24.mp4 frames/frame_%d.png

3840x2160
ffmpeg -i output.mp4 -vf scale=1920:-1 output-fhd.mp4


ffmpeg -i 10.MP4 -vf scale=1920:-1 -vcodec libx265 -crf 24 -preset ultrafast outputx265fhd.mp4
ffmpeg -i outputx265fhd.mp4 output_%d.png

ffmpeg -i 10.MP4 -vcodec libx265 -crf 24 -preset ultrafast outputx265_4k.mp4
ffmpeg -i 10.MP4 -vcodec libx264 -crf 24 -preset ultrafast outputx264_4k.mp4 : 52 fps, 

ffmpeg -i 10.MP4 -b:v 25000k outputx264_25Mbs.mp4

ffmpeg -i outputx264_4k.mp4 -vf scale=1920:-1 -vcodec libx264 -crf 24 -preset ultrafast outputx264_fhd_24.mp4
ffmpeg -i outputx264_fhd_24.mp4 output_%d.png

ffmpeg -i outputx265_4k.mp4 -vf "select='gt(scene,0.4)',showinfo" -f null -

Whether video has variable framerate : ffmpeg -i outputx265_4k.mp4 -vf vfrdet -an -f null -

ffmpeg -i outputx264_fhd_24.mp4 -f image2 -vsync 0 -frame_pts 1 frame-%05d.png
ffmpeg -i outputx264_fhd_24.mp4 -f image2 -vf showinfo -vsync 0 frame-%05d.png 2> log.txt

ffprobe -f lavfi -i "movie=outputx264_fhd_24.mp4,fps=fps=25[out0]" -show_frames -show_entries frame=pkt_pts_time -of csv=p=0

ffmpeg -i outputx264_fhd_24.mp4 -vf scale=1:-1 -vsync 0 -frame_pts true output_%d.png

ffprobe outputx264_fhd_24.mp4 -select_streams v -show_entries frame=coded_picture_number,pkt_pts_time -of csv=p=0:nk=1 -v 0
ffmpeg -i outputx264_fhd_24.mp4 -vf scale=1:-1 -vsync 0 -copyts -enc_time_base -1 -frame_pts 1 test%03d.jpg


ffmpeg -i outputx264_fhd_24.mp4 -f image2 -vf scale=1:-1,showinfo -vsync 0 frame-%05d.png 2> log.txt
grep showinfo log.txt | grep pts_time:'[0-9.]*' -o | grep '[0-9]*\.[0-9]*' -o > timestamps
