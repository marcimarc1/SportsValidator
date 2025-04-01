import React, {useEffect, useState} from 'react'
import api from "../../../api/api";
import AddGameModal from "./Modals/AddGameModal";
import AddTeamModal from "./Modals/AddTeamModal";
import GameListItem from "./ListItem/GameListItem";
import {useParams} from "react-router";
import AddVideoModal from "./Modals/AddVideoModal";
import VideoListItem from "./ListItem/VideoListItem";


const VideoOverview =() => {
    const path = window.location.pathname;
    const gameId = path.substring(path.lastIndexOf("/") + 1);

    const[videos, setVideos] = useState([])

    useEffect(async () =>{
        await fetchVideos()
    },[]);

    const fetchVideos = async () => {
        try {
            console.log("Fetching videos for Game:", gameId,);
            const response = await api.get(`/video/list/`+gameId);
            setVideos(response.data.videos);
        } catch (error) {
            console.log("Error fetching videos", error);
        }finally{
            console.log(`Got ${videos.length} videos`);

        }
    }

    const handleSave = async() => {
        await fetchVideos();
    }

    return (
        <div className="FileOverview">
            <div className="FileOverviewList">
                <div className="FileOverviewHeadingContainer">
                    <h1 className={"FileOverviewHeading"}>Video Overview</h1>
                    <div className="file-upload-container">
                        <AddVideoModal modalTitle={"Add Video"} titles={videos.map(e => e.name)} onSave={handleSave}
                                       gameId={gameId}/>
                    </div>
                    <div>
                        {videos.map((video) => (
                            <VideoListItem key={video.id} video={{video}}/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoOverview