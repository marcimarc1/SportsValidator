import Thumbnail1 from "../../../../data/thumbnail_1.jpg";
import {EditText, EditTextarea} from "react-edit-text";
import IconButton from "@material-ui/core/IconButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash, faVideo} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useHistory } from 'react-router-dom';
import api from "../../../../api/api";


const VideoListItem = ({video, deleteVideo}) => {
    const history = useHistory();

    const thumbnailImageWidth = 500;
    const thumbnailImageHeight = 281;
    const thumbnailRescale = 0.5;

    const thumbnailWidth = Math.floor(
        thumbnailImageWidth * thumbnailRescale,
    );
    const thumbnailHeight = Math.floor(
        thumbnailImageHeight * thumbnailRescale,
    );
    const borderStyle = {
        borderRadius: `5px ${thumbnailHeight / 2}px ${thumbnailHeight / 2}px 5px`,
    };


    const handleClickOpenEditor = () => {
        history.push(`/newTrackingEditor/${video.id}`)
    }
    const handleEditGame = () => {
        //TODO
    }
    const handleDeleteVideo = async () => {
        deleteVideo(video.id);
    }

    return (
        <div
            className="FileOverviewListItem"
            style={{...borderStyle, height: thumbnailHeight}}
        >
            <div className="FileOverviewListItemContainerLeft">
                <img
                    className="FileOverviewListItemThumbnail"
                    //TODO: update src attribute with this.props.poster
                    src={Thumbnail1}
                    alt="Thumbnail"
                    width={thumbnailWidth}
                    height={thumbnailHeight}
                    style={borderStyle}
                />
                <div className="FileOverviewListItemMetadata">
                    <EditText
                        className="FileOverviewListItemMetadataName"
                        defaultValue={video.name}
                        disabled={true}
                    />
                    <EditText
                        className="FileOverviewListItemMetadataDuration AlignWithMetaDataName"
                        defaultValue={"TODO: Add info"}
                        disabled={true}
                    />
                </div>
            </div>
            <div className="FileOverviewListItemButtonContainer">
                <IconButton
                    size="medium"
                    variant="contained"
                    className={"FileOverviewListItemButton"}
                    aria-label="edit annotations"
                    onClick={handleClickOpenEditor}
                ><FontAwesomeIcon icon={faVideo}/>
                </IconButton>
                <IconButton
                    size="medium"
                    variant="contained"
                    className={"FileOverviewListItemButton"}
                    aria-label="show analysis"
                    onClick={handleEditGame}  >
                    <FontAwesomeIcon icon={faEdit}/>
                </IconButton>
                <IconButton
                    size="medium"
                    variant="contained"
                    className={"FileOverviewListItemButton"}
                    onClick={handleDeleteVideo}
                    aria-label="delete videofile"
                >
                    <FontAwesomeIcon icon={faTrash}/>
                </IconButton>
            </div>
        </div>
    );
}

export default VideoListItem;