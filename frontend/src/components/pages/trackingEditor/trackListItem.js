import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import './TrackingEditor.css';
import NavBar from "./NavBar";
import {ReactComponent as Highlight} from "../../../icons/highlight.svg";


class TrackListItem extends Component {

    state = {
        color: undefined
    }

    // static getDerivedStateFromProps(props, state) {
    //     let color = props.bBox.my.selected ? 'FFF' : props.bBox.cornerColor
    //     return {color};
    // }

    handleChangeTeam = (event) => {
        this.props.setTeam(this.props.bBox, event.target.value);
    }

    render() {
        let bBox = this.props.bBox;
        let currentTeam = this.props.bBox.my.team;
        let allTeams = this.props.getTeams();
        let categoryName = allTeams.find(item => item.id === currentTeam).name;
        let style = {borderColor: this.props.bBox.cornerColor};

        let teamMenuItems = allTeams.map(team => <MenuItem value={team.id}>{team.name}</MenuItem>)
        //console.log("rendering TrackListItem " + bBox.my.id);
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

        // style = {color: this.state.color};
        return (
            <div className={"TrackListItem" + (bBox.my.selected ? " selected" : "")} style={style} onClick={clickItem}>
                <h1 className={"TrackListItemName" + (bBox.my.selected ? " selected" : "")}> {name} </h1>
                <button className={"TrackListItemBlink"} onClick={this.props.blink.bind(this, bBox)}>
                    <Highlight/>
                </button>

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
    getTeams: PropTypes.func.isRequired,
    setTeam: PropTypes.func.isRequired
};

export default TrackListItem;