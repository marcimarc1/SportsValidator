import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faTrash, faEdit, faChartBar} from '@fortawesome/free-solid-svg-icons'
import IconButton from '@material-ui/core/IconButton';
import { EditText, EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';

import Thumbnail1 from "../../../data/thumbnail_1.jpg";//"../../../data/Thumbnail_1.jpg"
import "./FileOverview.css"

class FileListItem extends Component {

    // image dimensions of original image, need to be changed when changing resolution of thumbnail!
    // TODO BACKEND Thumbnail should always be the same size/resolution. If not, this needs to be adapted (for example return thumbnail size together with thumbnail and pass size as props to this component).
    thumbnailImageWidth = 500;
    thumbnailImageHeight = 281;

    thumbnailRescale = 0.5;

    handleChangeName = (obj) => {
        this.props.changeName(this.props.id, obj.value);
    }

    handleChangeNotes = (obj) => {
        this.props.changeNotes(this.props.id, obj.value);
    }

    delete = () => {
        if(window.confirm("Do you really want to delete the file " + this.props.name + "?"))
            this.props.delete(this.props.id);
    }

    render() {
        let thumbnailWidth = Math.floor(this.thumbnailImageWidth * this.thumbnailRescale);
        let thumbnailHeight = Math.floor(this.thumbnailImageHeight * this.thumbnailRescale);
        let duration = this.props.duration;
        if(duration < 60)
            duration = duration.toString() + "min";
        else
            duration = `${Math.floor(duration / 60)}h ${duration % 60}min`;
        let borderStyle = {borderRadius: `5px ${thumbnailHeight/2}px ${thumbnailHeight/2}px 5px`};
        // console.log("CSV Data on filelistitem is:", this.props.csvData); // Debugging log

        // // Playing around with custom button styles, not used.
        // const CustomButton = withStyles({
        //     root: {
        //         background: "#2c3a17",
        //         secondary: "#F00",
        //         borderRadius: 3,
        //         border: 0,
        //         color: "#BBB",
        //         height: 48,
        //         padding: "0 30px",
        //         // boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)"
        //     },
        //     label: {
        //         textTransform: "capitalize"
        //     }
        // })(props => <Button {...props} />);

        return (
            <div className="FileOverviewListItem" style={{...borderStyle, height: thumbnailHeight}}>
                <div className="FileOverviewListItemContainerLeft">
                    <img className="FileOverviewListItemThumbnail" src={Thumbnail1} alt="Thumbnail" width={thumbnailWidth} height={thumbnailHeight} style={borderStyle}/>
                    <div className="FileOverviewListItemMetadata">
                        <EditText
                            className="FileOverviewListItemMetadataName"
                            defaultValue={this.props.name}
                            onSave={this.handleChangeName}
                        />
                        <div className="FileOverviewListItemMetadataDuration AlignWithMetaDataName">
                            {'  '}Duration: <span className="spacer1"></span>{duration}
                        </div>
                        <div className="FileOverviewListItemMetadataNotes AlignWithMetaDataName">
                            <label style={{ paddingTop: '3px' }}>Notes:</label> {/*padding to align label with EditTextarea*/}
                            <span className="spacer2"></span>
                            <EditTextarea
                                className="NotesEditTextarea"
                                name='Notes:'
                                rows={2}
                                style={{ paddingTop: 0}}
                                defaultValue={this.props?.notes}
                                placeholder='Enter your notes here'
                                onSave={this.handleChangeNotes}
                            />
                        </div>
                    </div>
                </div>
                <div className="FileOverviewListItemButtonContainer">
                    <Link to={{ 
                    pathname: `newTrackingEditor/${this.props.videoName}`,
                    state: { csvData: this.props.csvData }
                    }}>
                        <IconButton size="large" variant="contained" className={"FileOverviewListItemButton"} aria-label="edit annotations">
                            <FontAwesomeIcon icon={faEdit} />
                        </IconButton>
                    </Link>
                    <Link to={`analysis/${this.props.id}`} >
                        <IconButton size="large" variant="contained" className={"FileOverviewListItemButton"} aria-label="show analysis">
                            <FontAwesomeIcon icon={faChartBar} />
                        </IconButton>
                    </Link>
                    <IconButton size="large" variant="contained" className={"FileOverviewListItemButton"} onClick={this.delete} aria-label="delete videofile">
                        <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                </div>

            </div>
        );
    }
}

FileListItem.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    videoName: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,      //video duration in minutes
    notes: PropTypes.string,
    changeName: PropTypes.func.isRequired,
    changeNotes: PropTypes.func.isRequired,
    delete: PropTypes.func.isRequired
}

export default FileListItem;