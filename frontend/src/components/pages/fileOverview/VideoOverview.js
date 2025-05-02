import React, {useEffect, useState} from 'react'
import api from "../../../api/api";
import AddGameModal from "./Modals/AddGameModal";
import AddTeamModal from "./Modals/AddTeamModal";
import GameListItem from "./ListItem/GameListItem";
import {useParams} from "react-router";
import AddVideoModal from "./Modals/AddVideoModal";
import VideoListItem from "./ListItem/VideoListItem";
import LoadingOverlay from "react-loading-overlay-ts";
import toast, {Toaster} from "react-hot-toast";
import axios from "axios";


/***TODO:
 * - Game List Add Info
 * - Add Delete Functionality
 * - Add Edit Functionality
 * - Message/Loading in Dialog
***/

const VideoOverview = () => {


    const path = window.location.pathname;
    const gameId = path.substring(path.lastIndexOf("/") + 1);

    const[loading, setLoading] = useState(false);
    const[loaderText, setLoaderText] = useState("Loading...");
    const [videos, setVideos] = useState([])
    const[searchRequest, setSearchRequest] = useState({
        skip: 0,
        take: 10,
        desc: false,
        game_id:gameId
    })

    useEffect(async () => {
        await fetchVideos()
    }, []);

    const fetchVideos = async () => {
        try {
            setLoaderText("Loading Videos...");
            setLoading(true);
            console.log("Fetching videos for Game:", gameId,);
            const response = await axios.post("http://localhost:8000/video/list",
                searchRequest,
                {headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true})
            setVideos(response.data.videos);
            toast.success("Videos loaded successfully.");
        } catch (error) {
            console.log("Error fetching videos", error);
            toast.error("Error fetching videos.");
        } finally {
            console.log(`Got ${videos.length} videos`);
            setLoading(false);

        }
    }

    const deleteVideo = async(id) => {
        try{
            setLoaderText("Deleting Video...");
            setLoading(true);
            const response = await api.get(`/video/delete/${id}`);
            setLoading(false);
            const message = response.data.message;
            if(message === "success"){
                toast.success("Successfully deleted!");
                await triggerReload();
            }
            else{
                toast.error(message);
            }
        }
        catch(error){
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    }

    const triggerReload = async () => {
        await fetchVideos();
    }

    return (
        <LoadingOverlay
            className="FileOverview"
            active={loading}
            spinner text={loaderText}
            styles={{
                overlay: (base) => ({
                    ...base,
                    zIndex: 9999, // make sure it's high enough
                }),
            }}
        >
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
            <div className="FileOverview">
                <div className="FileOverviewList">
                    <div className="FileOverviewHeadingContainer">
                        <h1 className={"FileOverviewHeading"}>Video Overview</h1>
                        <div className="file-upload-container">
                            <AddVideoModal modalTitle={"Add Video"} titles={videos.map(e => e.name)}
                                           onSave={triggerReload}
                                           gameId={gameId}
                                           setLoading={setLoading}
                                           setLoaderText={setLoaderText}
                            />
                        </div>
                        <div>
                            {videos.map((video) => (
                                <VideoListItem key={video.id} video={video} deleteVideo={deleteVideo}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </LoadingOverlay>
    );
}

export default VideoOverview