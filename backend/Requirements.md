# Requirements

## I. Identity and access
1. There should be a login mechanism
2. The user must be logged into his account in order to use the software. TODO : do we want a public access mode ?
3. There should be 3 access patterns : by game / video, by team, and by player.
4. The user becomes the owner of a resource when he uploads it.
5. The user can retrieve data through one of the access patterns described in I.3. either if he owns it, or if it was shared to him by the owner. TODO : Should the user be able to unshare ? What should be the granularity of the sharing mechanism ?
6. TODO How to manage known teams and players ? Do we want to have predefined teams the user can select ? How should he be able to add new ones ? How to prevent duplicates ?
7. TODO How to make sure that all players are correctly referenced when only 1 coach will upload the video ?

## II. Videos
1. The user should be able to upload grame videos through the frontend. TODO : Should he be able to upload several at a time ? Or should we queue them ?
2. The user should be able to track the progress of his video uploads.
3. TODO : Should we set a lower limit on the video upload resolution ?
4. TODO : How to organize video storage ? What naming conventions to use for the files ?
5. TODO : Can a game have several videos attached ? If yes should we merge them on the backend ?
6. The backend should setup a processing queue and process all the uploaded videos sequentially. TODO : I thought of this because the processing software is already paralellized, but is it actually relevant ?
7. The backend should append a video to the processing queue as soon as it has been uploaded.
8. TODO Add a mechanim to check if a video has already been uploaded ? By checking the file name or by comparing some frames for example ? 
9. The user should be able to download any video that contains data he has access to. Note : This could mean that he also has access to other teams or players' data if he feeds the video back to the backend. We could try and prevent that however by keeping track of which video was sent to which user and making sure they don't reupload them.
10. TODO : Should we be able to request a certain portion of a video rather than the whole file ?
11. The backend should create downsized copies of the uploaded videos to reduce transfer size when the user doesn't need the full size video. TODO Which sizes ? Maybe just 720p is enough ? Or 1080p ? Also is the frontend able to display tracking for lower resolution videos

## III. Annotations
1. Once the corresponding videos are processed, the user should be able to download any annotations for data he has access to, following access pattern in I.3.
2. TODO : How does the tracking software work ? Can the user supply the initial position of the players along with the video or does he have do re-dowload it once processed, and then indicate players for each path ?
3. The user should be able to edit a portion of the annotation corresponding to a video and send it back to the server for correction and path extraction improvement. TODO : How does this correction mechanism work ? Should we add it to the processing queue or is it just going to be data used when processing other videos ?
4. The user should be able to request any subset of the annotations he has access to, and computations on that data. TODO : What data analysis functions do we want to expose ? Or do we want to be able to send SQL queries directly (might be risky) ?
 
## IV. Interface
1. The user should be able to see everything he has access to at a glance. TODO How to organize the interface ?
3. The user should be able to track the progress of the processing queue. TODO : Realtime ? Periodic polling ?

