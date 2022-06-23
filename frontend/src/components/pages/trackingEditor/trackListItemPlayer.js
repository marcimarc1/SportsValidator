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
import NavBar from "./NavBar";
import {ReactComponent as Highlight} from "../../../icons/highlight.svg";
import {ReactComponent as Delete} from "../../../icons/delete.svg";


class TrackListItemPlayer extends Component {

    state = {
        color: undefined,
        deleted: false
    }

    // static getDerivedStateFromProps(props, state) {
    //     let color = props.bBox.my.selected ? 'FFF' : props.bBox.cornerColor
    //     return {color};
    // }

    handleChangeTeam = (event) => {
        this.props.setTeam(this.props.bBox, event.target.value);
    }

    handleChangeName = (obj) => {
        this.props.setName(this.props.bBox, obj.value);
    }

    delete = () => {
        this.setState({deleted: true});
        this.props.delete(this.props.bBox);
    }

    render() {
        let bBox = this.props.bBox;
        let currentTeam = this.props.bBox.my.team;
        let allTeams = this.props.getTeams();
        let categoryName = allTeams.find(item => item.id === currentTeam).name;
        let style = {borderColor: this.props.bBox.cornerColor};

        let teamMenuItems = allTeams.map(team => <MenuItem value={team.id}>{team.name}</MenuItem>)
        //console.log("rendering TrackListItemPlayer " + bBox.my.id);
        if(this.props.bBox.my.selected) {
            //console.log("This one is selected!");
            style = {color: 'FFF'};
        }
        let selectedStyle = {color: 'FFF'};

        let name = this.props.bBox.my.name ? this.props.bBox.my.name : this.props.bBox.my.id;

        // selects or deselects (if its already selected) the clicked item (e.g. player)
        let clickItem = () => {
            let deselect = this.props.bBox.my.selected;
            this.props.changeSelection("player", bBox.my.id, deselect);
        }

        if(this.state.deleted)
            return null;
        else
            return (
                <div className={"TrackListItem" + (bBox.my.selected ? " selected" : "")} style={style} onClick={clickItem}>
                    {/*<h1 className={"TrackListItemName" + (bBox.my.selected ? " selected" : "")}> {name} </h1>*/}
                    <EditText
                        className={"TrackListItemName" + (bBox.my.selected ? " selected" : "")}
                        defaultValue={name.toString()}
                        onSave={this.handleChangeName}
                    />
                    <IconButton size="small" className={"TrackListItemBlink"} onClick={this.props.blink.bind(this, bBox)} aria-label="blink item">
                        <Highlight/>
                    </IconButton>

                    <IconButton size="small" className={"TrackListItemDelete"} onClick={this.delete} aria-label="delete item">
                        <Delete/>
                    </IconButton>

                    {/*Material UI Dropdown Select*/}
                    <FormControl className={"TrackListItemTeamDropdown"}>
                        <InputLabel id="demo-simple-select-label">Team</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={currentTeam}
                            onChange={this.handleChangeTeam}
                        >
                            {teamMenuItems}
                        </Select>
                    </FormControl>
                </div>
            );
    }
}

NavBar.propTypes = {
    bBox: PropTypes.object.isRequired,
    changeSelection: PropTypes.func.isRequired,
    blink: PropTypes.func.isRequired,
    delete: PropTypes.func.isRequired,
    getTeams: PropTypes.func.isRequired,
    setTeam: PropTypes.func.isRequired,
    setName: PropTypes.func.isRequired
};

export default TrackListItemPlayer;