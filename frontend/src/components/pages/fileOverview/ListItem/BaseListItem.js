import {EditText, EditTextarea} from "react-edit-text";
import {Link} from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartBar, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Thumbnail1 from "../../../../data/thumbnail_1.jpg";
const BaseListItem = ({info, actions}) => {

    const thumbnailImageWidth = 500;
    const thumbnailImageHeight = 281;
    const thumbnailRescale = 0.5;
    let thumbnailWidth = Math.floor(
      thumbnailImageWidth * thumbnailRescale,
    );
    let thumbnailHeight = Math.floor(
      thumbnailImageHeight * thumbnailRescale,
    );

    return (
        <div className="BaseListItem"
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
                    <div>
                        {info}
                    </div>
                </div>
            </div>
            <div className="FileOverviewListItemButtonContainer">
                <div>
                    {actions}
                </div>
            </div>
        </div>
    )
}

export default BaseListItem;