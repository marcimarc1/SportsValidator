# Documentation draft, to be reorganized later

## Video upload

1. Progress display : it is actually all handled by the browser. Javascript splits this very large http requests and we can get the information of how many chunks have been sent at a given moment. More information on event frequency : https://stackoverflow.com/questions/5495625/xmlhttprequest-onprogress-interval





## Technical

- When defining route, we need to use handlers. These handlers need an extractorm which as the name suggest helps extract part of the information of the request. cf https://docs.rs/axum/latest/axum/extract/index.html

Useful links :
- Range requests : https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
- React streaming app : https://www.linode.com/docs/guides/build-react-video-streaming-app/
- Cf chatGPT conversation
- Explanation on Json(payload) : https://www.reddit.com/r/rust/comments/xgvlxm/function_argument_name_wrapped_with_struct_or/
- Keywork impl : https://doc.rust-lang.org/std/keyword.impl.html
- Object orientation : https://stevedonovan.github.io/rust-gentle-intro/object-orientation.html
- sqlx cli : https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md
- csv crate tutorial : https://docs.rs/csv/latest/csv/tutorial/index.html


Video
- Fireship ffmpeg in react : https://www.youtube.com/watch?v=-OTc0Ki7Sv0
- Extract frames with ffmpeg executable : https://superuser.com/questions/1779006/how-to-extract-all-the-frames-from-video-file-instead-only-one-frame
- FFmpeg not working at all : https://juejin.cn/post/7135709942274605087
- Github repo : https://github.com/ffmpegwasm/react-app/blob/master/src/App.js
- Selecting specific frames : https://superuser.com/questions/1707609/ffmpeg-extract-several-individual-frames-from-a-video-given-a-list-of-timestamp
- https://stackoverflow.com/questions/60490058/fetch-video-parts-like-the-browser
- Compression : https://unix.stackexchange.com/questions/28803/how-can-i-reduce-a-videos-size-with-ffmpeg
- Faster compression ? : https://stackoverflow.com/questions/31624787/ffmpeg-very-slow-conversion


Issue we have with video encoding : x265 is not recognized by Firefox at least. Also it is very slow to decode


Tracking : 
1 - Question : how to access the file system to store extracted images ? Memfs provides in memory file system in javascript
2 - Question : How wasm works, FFmpeg.wasm library
2 - Issue : Unable to have ffmpeg libs working at all, issue with versions
4 - Issue : `ReferenceError: SharedArrayBuffer is not defined`. Has to do with CORS. Detail how CORS work and why it leads to SharedArrayBuffer being disabled.
https://stackoverflow.com/questions/72006669/ffmpeg-ffmpeg-uncaught-in-promise-referenceerror-sharedarraybuffer-is-not-d
https://stackoverflow.com/questions/64650119/react-error-sharedarraybuffer-is-not-defined-in-firefox