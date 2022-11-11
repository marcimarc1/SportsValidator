import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

import { EditText, EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';

import './TrackingEditor.css';
import {ReactComponent as Delete} from "../../../icons/delete.svg";


class TrackListItemCorner extends Component {

    delete = () => {
        if(window.confirm("Do you really want to delete this corner?")) {
            this.props.delete(this.props.id);
        }
    }

    render() {
        let style = {borderColor: 'black'};
        let selected = this.props.activeCorner === this.props.id;    // === so that no type conversion takes place and undefined != 0
        if(selected) {
            style['color'] = 'FFF';
        }

        let name = this.props.id;

        // selects or deselects (if its already selected) the clicked item (e.g. player)
        let clickItem = () => {
            this.props.changeSelection("corner", this.props.id, selected);
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
                    readonly={true}
                    style={{marginLeft: '5px', width: '50px'}}
                />

                <IconButton size="small" className={"TrackListItemDelete"} onClick={this.delete} aria-label="delete item">
                    <Delete/>
                </IconButton>
            </div>
        );
    }
}

TrackListItemCorner.propTypes = {
    id: PropTypes.number.isRequired,
    activeCorner: PropTypes.number,          // can be undefined if no corner is active
    changeSelection: PropTypes.func.isRequired,
    delete: PropTypes.func.isRequired
};

export default TrackListItemCorner;