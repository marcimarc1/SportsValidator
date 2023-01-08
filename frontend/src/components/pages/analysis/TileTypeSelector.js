import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Select from '@material-ui/core/Select';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import ListSubheader from "@material-ui/core/ListSubheader";



import Button from '@material-ui/core/Button';
import {EditTextarea} from "react-edit-text";

class TileTypeSelector extends Component {

    state = {
        currentType: "",
        groupByTeams: false,
        currentTeams: [],
        currentPlayers: [],
        currentNotes: "",
        visibilities: {     // which selections should be shown depending on previous selections
            groupByTeams: false,
            teams: false,
            players: false,
            notes: false
        }
    };

    componentDidMount() {
    }

    selectTileType = () => {
        let changes =
            {
                type: this.state.currentType
            };
        switch (this.state.currentType) {
            case "distance-barchart":
            case "heatmap":
                changes.groupByTeams = this.state.groupByTeams;
                if(this.state.groupByTeams)
                    changes.teams = this.state.currentTeams.map((e) => parseInt(e));
                else
                    changes.players = this.state.currentPlayers.map((e) => parseInt(e));
                break;
            case "notes":
                changes.notes = this.state.currentNotes;
                break;
            default:
                // fall through
                break;
        }
        this.props.selectTileType(changes);
    }

    handleChangeType = (event) => {
        let type = event.target.value;
        let stateChanges = {currentType: type, groupByTeams: false};
        if(type === "distance-barchart" || type === "heatmap") {
            stateChanges.visibilities = {
                groupByTeams: true,
                players: true
            }
        }
        else
            if(type === "notes") {
                stateChanges.visibilities = {
                    notes: true
                };
            }
        this.setState(stateChanges);
    }

    handleChangeGroupByTeams = (event) => {
        let checked = event.target.checked;
        let stateChanges = {
            groupByTeams: checked,//!this.state.groupByTeams,
            visibilities: {
                ...this.state.visibilities,
                players: !checked,
                teams: checked}
        };
        this.setState(stateChanges);
    }

    handleChangeTeams = (event) => {
        let selection = event.target.value;
        let stateChanges = {
            currentTeams: selection
        };
        this.setState(stateChanges);
    }

    handleChangePlayers = (event) => {
        let selection = event.target.value;
        let stateChanges = {
            currentPlayers: selection
        };
        this.setState(stateChanges);
    }

    handleChangeNotes = (obj) => {
        let notes = obj.value;
        let stateChanges = {
            currentNotes: notes
        };
        this.setState(stateChanges);
    }

    render() {
        let createButtonDisabled = this.state.currentType === "";
        let hiddenClass = "hidden";
        let i = 0;
        let typeMenuItems = [
            <MenuItem key={i++} value={"distance-barchart"}>Distance Barchart</MenuItem>,
            <MenuItem key={i++} value={"heatmap"}>Heatmap</MenuItem>,
            <MenuItem key={i++} value={"notes"}>Note</MenuItem>
        ];
        let teamsMenuItems = undefined;
        let playersMenuItems = [];
        let playerNameLookup = {};

        if(this.props.data) {
            teamsMenuItems = Object.entries(this.props.data?.teams).map(([key, value]) => {
                return <MenuItem key={key} value={key} >
                    <Checkbox checked={this.state.currentTeams.indexOf(key) > -1} />
                    <ListItemText primary={value.name} />
                </MenuItem>
            });

            // populate playersMenuItems
            let moreThanOneTeam = Object.entries(this.props.data?.teams).length > 1;
            for(const [key, value] of Object.entries(this.props.data?.teams)) {
                if(moreThanOneTeam)
                    playersMenuItems.push(<ListSubheader key={key+1000}>{value.name}</ListSubheader>)   // couldn't figure out a better key for ListSubheader (without there is a warning), but this is relatively safe and could only cause issues if number of players exceeds 1000
                let newPlayerMenuItems = Object.entries(value.players).map(([key, value]) => {
                    playerNameLookup[key] = value.name;
                    return <MenuItem key={key} value={key} >
                        <Checkbox checked={this.state.currentPlayers.indexOf(key) > -1} />
                        <ListItemText primary={value.name} />
                    </MenuItem>})
                playersMenuItems = playersMenuItems.concat(newPlayerMenuItems);
            }
        }
        return (
            <div className="TileTypeSelector">
                <div className="TileTypeSelectorFormContainer">
                    <div className={"TileTypeSelectorForm"}>
                        <FormControl fullWidth={true}>
                            <InputLabel id="demo-simple-select-label">Tile Type</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={this.state.currentType}
                                onChange={this.handleChangeType}
                            >
                                {typeMenuItems}
                            </Select>
                        </FormControl>
                    </div>

                    <div className={"TileTypeSelectorForm" + (this.state.visibilities.groupByTeams?"":" " + hiddenClass)}>
                        <FormControl fullWidth={true}>
                            <FormControlLabel control={<Switch checked={this.state.groupByTeams} onChange={this.handleChangeGroupByTeams}/>} label="Group by Teams" labelPlacement="end"/>
                        </FormControl>
                    </div>

                    <div className={"TileTypeSelectorForm" + (this.state.visibilities.teams?"":" " + hiddenClass)}>
                        <FormControl fullWidth={true}>
                            <InputLabel id="team-selection-multiple-checkbox-label">Teams</InputLabel>
                            <Select
                                labelId="team-selection-multiple-checkbox-label"
                                id="team-selection-multiple-checkbox"
                                multiple
                                value={this.state.currentTeams}
                                onChange={this.handleChangeTeams}
                                input={<OutlinedInput label="chip" />}

                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }} >
                                        {selected.map((value) => (
                                            <Chip key={value} label={this.props.data.teams[value].name} />
                                        ))}
                                    </Box>
                                )}

                                // Alternative way to show selected values in a simple list without chips:
                                // // in the following line it would be better to use the ListItemText text from each menu entry but there seems to be no good way to access it in renderValue
                                // renderValue={(selected) => selected.map((t) => this.props.data.teams[t].name).join(', ')}

                                // MenuProps={MenuProps}
                            >
                                {teamsMenuItems}
                            </Select>
                        </FormControl>
                    </div>

                    <div className={"TileTypeSelectorForm" + (this.state.visibilities.players?"":" " + hiddenClass)}>
                        <FormControl fullWidth={true}>
                            <InputLabel id="player-selection-multiple-checkbox-label">Players</InputLabel>
                            <Select
                                labelId="player-selection-multiple-checkbox-label"
                                id="player-selection-multiple-checkbox"
                                multiple
                                value={this.state.currentPlayers}
                                onChange={this.handleChangePlayers}
                                input={<OutlinedInput label="chip" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={playerNameLookup[value]} />
                                        ))}
                                    </Box>
                                )}
                                // MenuProps={MenuProps}
                            >
                                {playersMenuItems}
                            </Select>
                        </FormControl>
                    </div>

                    {/* notes */}
                    <div className={"TileTypeSelectorForm" + (this.state.visibilities.notes?"":" " + hiddenClass)}>
                        <EditTextarea
                            className="NotesEditTextarea"
                            rows={10}
                            style={{ paddingTop: 0, width: "535px", height: "300px", margin: "15px"}}
                            defaultValue={this.state.currentNotes}
                            placeholder='Enter your notes here'
                            onSave={this.handleChangeNotes}
                        />
                    </div>
                </div>



                <Button
                    className={"TileTypeSelectorCreateButton" + (createButtonDisabled?" disabled":"")}
                    variant="outlined" disabled={createButtonDisabled}
                    onClick={this.selectTileType}
                >
                    Create Tile
                </Button>
                
            </div>
        );
    }
}

TileTypeSelector.propTypes = {
    data: PropTypes.object,
    selectTileType: PropTypes.func.isRequired
};

export default TileTypeSelector;
