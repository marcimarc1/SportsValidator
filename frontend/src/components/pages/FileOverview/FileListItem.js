import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faTrash, faPenToSquare, faChartColumn} from '@fortawesome/free-solid-svg-icons'
import {Card} from "@material-ui/core";
import { EditText, EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';

import Thumbnail1 from "../../../data/thumbnail_1.jpg";//"../../../data/Thumbnail_1.jpg"
import "./FileOverview.css"

class FileListItem extends Component {

    // image dimensions of original image, need to be changed when changing resolution of thumbnail!
    thumbnailImageWidth = 500;
    thumbnailImageHeight = 281;

    thumbnailRescale = 0.5;

    handleChangeName = (obj) => {
        this.props.changeName(this.props.id, obj.value);
    }

    render() {
        let thumbnailWidth = Math.floor(this.thumbnailImageWidth * this.thumbnailRescale);
        let thumbnailHeight = Math.floor(this.thumbnailImageHeight * this.thumbnailRescale);
        let duration = this.props.duration;
        if(duration < 60)
            duration = duration.toString() + "min";
        else
            duration = `${Math.floor(duration / 60)}h ${duration % 60}min`;
        return (
            <div className="FileOverviewListItem" style={{height: thumbnailHeight}}>
                <img className="FileOverviewListItemThumbnail" src={Thumbnail1} alt="Thumbnail" width={thumbnailWidth} height={thumbnailHeight}/>
                <div className="FileOverviewListItemMetadata">
                    <EditText
                        className="FileOverviewListItemMetadataName"
                        defaultValue={this.props.name}
                        onSave={this.handleChangeName}
                    />
                    <div className="Duration">
                        <p>{'  '}Duration: {duration}</p>
                    </div>
                </div>
                <div className="FileOverviewListItemButtons">
                    <FontAwesomeIcon icon={faPenToSquare} />
                    <FontAwesomeIcon icon={faTrash} />
                    <FontAwesomeIcon icon={faChartColumn} />

                </div>

            </div>
        );
    }
}

FileListItem.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,      //video duration in minutes
    changeName: PropTypes.func.isRequired
}

export default FileListItem;