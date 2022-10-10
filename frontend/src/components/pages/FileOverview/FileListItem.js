import React, {Component} from 'react';
import {Card} from "@material-ui/core";
import Thumbnail1 from "../../../data/thumbnail_1.jpg";//"../../../data/Thumbnail_1.jpg"
import "./FileOverview.css"

class FileListItem extends Component {
    render() {
        return (
            <div className="FileOverviewFileListItem">
                <img className="FileOverviewFileListItemThumbnail" src={Thumbnail1} alt="Thumbnail">

                </img>
            </div>
        );
    }
}

export default FileListItem;