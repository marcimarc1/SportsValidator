import Thumbnail1 from "../../../../data/thumbnail_1.jpg";
import {EditText, EditTextarea} from "react-edit-text";
import IconButton from "@material-ui/core/IconButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash, faBars} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useHistory } from 'react-router-dom';
import toast from "react-hot-toast"
import api from "../../../../api/api";
import AddGameModal from "../Modals/AddGameModal";
import AddTeamModal from "../Modals/AddTeamModal";


const GameListItem = ({game, handleDelete, triggerReload}) => {
    const history = useHistory();
    const date= new Date(game.game.date_played).toLocaleDateString();

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


    const handleClickOpenVideo = () => {
        history.push(`videos/${game.game.id}`);
    }
    const handleEditGame = () => {


    }
    const handleDeleteGame = async () => {
        handleDelete(game.game.id);
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
                        defaultValue={game.game.name}
                        readonly={true}
                    />
                    <EditText
                        className="FileOverviewListItemMetadataDuration AlignWithMetaDataName"
                        defaultValue={date}
                        readonly={true}
                    />
                    <EditText
                        className="FileOverviewListItemMetadataDuration AlignWithMetaDataName"
                        defaultValue={game.game.team1_name + " - " + game.game.team2_name}
                        readonly={true}
                    />
                </div>
            </div>
            <div className="FileOverviewListItemButtonContainer">
                <IconButton
                        size="medium"
                        variant="contained"
                        className={"FileOverviewListItemButton"}
                        aria-label="edit annotations"
                        onClick={handleClickOpenVideo}
                    ><FontAwesomeIcon icon={faBars}/>
                </IconButton>
                <AddGameModal modalTitle={"Edit Game"} onSave={triggerReload} game={game.game}/>
                <IconButton
                    size="medium"
                    variant="contained"
                    className={"FileOverviewListItemButton"}
                    onClick={handleDeleteGame}
                    aria-label="delete videofile"
                >
                    <FontAwesomeIcon icon={faTrash}/>
                </IconButton>
            </div>
        </div>
    );
}

export default GameListItem;