import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ReactComponent as Plus} from "../../../icons/plus.svg";
import IconButton from "@material-ui/core/IconButton";

class TrackListItemAdd extends Component {
    render() {
        let style = {borderColor: "black"};
        return (
            <div className={"TrackListItem TrackListItemAdd"} style={style} >
                <IconButton size="small" className={"TrackListItemAddButton"} onClick={this.props.add} aria-label="add new item">
                    <Plus/>
                </IconButton>
                Add new Item
            </div>
        );
    }
}

TrackListItemAdd.propTypes = {
    add: PropTypes.func
};

export default TrackListItemAdd;
