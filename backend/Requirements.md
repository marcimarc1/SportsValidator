# Requirements

### From Marc: I mark my comments in _italic_

## I. Identity and access

1. There should be a login mechanism
2. The user must be logged into his account in order to use the software. TODO : do we want a public access mode ? _I don't really understand the question, I reckon the MVP will be just on a local machine. I believed we talked about it and said it might be easily extendable_
3. There should be 3 access patterns : by game / video, by team, and by player.
4. The user becomes the owner of a resource when he uploads it.
5. The user can retrieve data through one of the access patterns described in I.3. either if he owns it, or if it was shared to him by the owner. TODO : Should the user be able to unshare ? What should be the granularity of the sharing mechanism ?
   _As we discussed, if a user makes another user an owner, he cannot unshare it. With labeler rights and accessor rights, unshareing can be done by the owner_
6. TODO How to manage known teams and players ? Do we want to have predefined teams the user can select ? How should he be able to add new ones ? How to prevent duplicates ?
   _1. I think known teams and players can be managed on a seperate site, or when creating teams, a labeler or owner can create new players on the fly (and later complete a profile). 2. Yes, users can create teams and select them in the labeling process. 3. see 1., 4. duplicates can be prevented by filtering and also by smart search mechanisms (normaly database search can cope with small typos, yet you never can get rid of it completely)_
7. TODO How to make sure that all players are correctly referenced when only 1 coach will upload the video ? _I reckon this is not our problem. This is the responsibility of the respective coaches/labelers._

## II. Videos

1. The user should be able to upload grame videos through the frontend. TODO : Should he be able to upload several at a time ? Or should we queue them ?
   _The users should be able to upload a folder of videos. If we do this sequentially or in parallel depends on whats faster_
2. The user should be able to track the progress of his video uploads.
3. TODO : Should we set a lower limit on the video upload resolution ?
   _No, the videos just wont work then, which is fine for me. We might notify them, that low quality videos might lead to bad performance in the software_
4. TODO : How to organize video storage ? What naming conventions to use for the files ?
   _Can you discuss this with Arnesh? I have no idea how to do this efficently and need to google it. One idea about naming convention could be to either just have increasing numbers or give the file a hash and save it in the database for access_
5. TODO : Can a game have several videos attached ? If yes should we merge them on the backend ?
   _As the videos might be huge, merging might not be the best option_
6. The backend should setup a processing queue and process all the uploaded videos sequentially. TODO : I thought of this because the processing software is already paralellized, but is it actually relevant ?
   _I reckon this depends on the available compute. We could run all videos in parallel if enough compute is available, otherwise, we would need to run the videos sequentially_
7. The backend should append a video to the processing queue as soon as it has been uploaded.
8. TODO Add a mechanim to check if a video has already been uploaded ? By checking the file name or by comparing some frames for example ?
   _This would be hard to do, as all the videos look quite similar. We could compare the filenames, yet the naming might be the same but the video might be different_
9. The user should be able to download any video that contains data he has access to. Note : This could mean that he also has access to other teams or players' data if he feeds the video back to the backend. We could try and prevent that however by keeping track of which video was sent to which user and making sure they don't reupload them.
10. TODO : Should we be able to request a certain portion of a video rather than the whole file ?
    _this is a good idea, if not the whole video is needed._
11. The backend should create downsized copies of the uploaded videos to reduce transfer size when the user doesn't need the full size video. TODO Which sizes ? Maybe just 720p is enough ? Or 1080p ? Also is the frontend able to display tracking for lower resolution videos.
    _Displaying will not be a problem, as we can resize the detections too. I would recommend to create a downsized copy, if the user requests it_

## III. Annotations

1. Once the corresponding videos are processed, the user should be able to download any annotations for data he has access to, following access pattern in I.3.
2. TODO : How does the tracking software work ? Can the user supply the initial position of the players along with the video or does he have do re-dowload it once processed, and then indicate players for each path ?

- The software will automatically detect players and give them a random ID. Checkout the csv files I shared with you\*

3. The user should be able to edit a portion of the annotation corresponding to a video and send it back to the server for correction and path extraction improvement. TODO : How does this correction mechanism work ? Should we add it to the processing queue or is it just going to be data used when processing other videos ?
   _The correction mechanism is described in the frontend. Play with the sample files here_
4. The user should be able to request any subset of the annotations he has access to, and computations on that data. TODO : What data analysis functions do we want to expose ? Or do we want to be able to send SQL queries directly (might be risky) ?
   _I believe this is extendable and will be extended in the future. So it is hard to answer. We should have some extendable class probably. Injecting sql queries might be dangerous, but it can be an option here and we can seal it later_

## IV. Interface

1. The user should be able to see everything he has access to at a glance. TODO How to organize the interface ?
   _Good question. We might discuss this with the initial user in a meeting._
2. The user should be able to track the progress of the processing queue. TODO : Realtime ? Periodic polling ?
   _I think an initial estimate is fine and when reloading the page, the value can be updated_
