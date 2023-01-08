import React, {Component} from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';

import { EditText } from 'react-edit-text';
import 'react-edit-text/dist/index.css';

import './TrackingEditor.css';
import {ReactComponent as Delete} from "../../../icons/delete.svg";


class TrackListItemGroup extends Component {

    handleChangeName = (obj) => {
        let newName = obj.value;
        this.props.setName(this.props.id, newName);
    }

    delete = () => {
        if(window.confirm("Do you really want to delete the group " + (this.props.name ? this.props.name : this.props.id) + "?")) {
            this.props.delete(this.props.id);
        }
    }

    render() {
        let style = {borderColor: this.props.color};
        let selected = this.props.activeGroup === this.props.id;    // === so that no type conversion takes place and undefined != 0
        if(selected) {
            style['color'] = 'FFF';
        }
        let name = this.props.name ? this.props.name : this.props.id;

        // selects or deselects (if its already selected) the clicked item (e.g. player)
        let clickItem = () => {
            if(!selected)
                this.props.changeSelection("group", this.props.id, selected);
            // this.setState(prevState => ({
            //     selected: !prevState.selected
            // }));

        }

        return (
            <div className={"TrackListItem" + (selected ? " selected" : "")} style={style} onClick={clickItem}>
                {/*<h1 className={"TrackListItemName" + (bBox.my.selected ? " selected" : "")}> {name} </h1>*/}
                <EditText
                    className={"TrackListItemName" + (selected ? " selected" : "")}
                    defaultValue={name.toString()}
                    onSave={this.handleChangeName}
                    style={{marginLeft: '5px', width: '70px'}}
                />

                <IconButton size="small" className={"TrackListItemDelete"} onClick={this.delete} aria-label="delete item">
                    <Delete/>
                </IconButton>
            </div>
        );
    }
}

TrackListItemGroup.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    activeGroup: PropTypes.number,          // can be undefined if no group is active
    changeSelection: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    delete: PropTypes.func.isRequired,
    setName: PropTypes.func.isRequired
};

export default TrackListItemGroup;