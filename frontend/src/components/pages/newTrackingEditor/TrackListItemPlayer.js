import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import IconButton from '@material-ui/core/IconButton';

import { EditText } from 'react-edit-text';
import 'react-edit-text/dist/index.css';

import './NewTrackingEditor.css';
import {ReactComponent as Highlight} from "../../../icons/highlight.svg";
import {ReactComponent as Delete} from "../../../icons/delete.svg";
import {ReactComponent as Swap} from "../../../icons/swap.svg";

// using fontawesome version of these icons because they are already used in FileOverview (and look imho a little bit better when using the solid variant)
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faCheck, faSpinner} from "@fortawesome/free-solid-svg-icons";


class TrackListItemPlayer extends Component {

    state = {
        swapExpanded: false,
        firstTime: true,     // used to not trigger any animations when component is mounted
        swapSelectionVisible: false,
        swapPartner: "",
        swapPartnerDropdownOpen: false,
        processingSwap: false
    }

    prevPlayerId = -1;

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     // saving the previous playerId is necessary for detecting a swap of 2 players;
    //     // since the playerBox are not deep-copied, prevProps.playerBox and this.props.playerBox will point to the same object
    //     if(this.prevPlayerId >= 0) {
    //         if(this.prevPlayerId !== this.props.playerBox.my.player) {
    //             this.setState({processingSwap: false, swapPartner: ""}, () => this.closeSwap());
    //         }
    //     }
    //     this.prevPlayerId = this.props.playerBox.my.player;
    // }

    // handleChangeTeam = (event) => {
    //     this.props.setTeam(this.props.playerBox, event.target.value);
    // }

    handleChangeName = (obj) => {
        this.props.setName(this.props.playerBox, obj.value);
    }

    delete = () => {
        if(window.confirm("Do you really want to delete this player ?")) {
            this.props.delete(this.props.playerBox);
        }
    }

    // openSwap = () => {
    //     this.setState((prevState) => ({swapExpanded: !prevState.swapExpanded, firstTime: false, swapSelectionVisible: false}),
    //         () => setTimeout(() => {
    //             if(this.state.swapExpanded)
    //                 this.setState({swapSelectionVisible: true});
    //         }, 400));
    // }

    // closeSwap = () => {
    //     this.setState({swapExpanded: false},
    //         () => setTimeout(() => {
    //                 this.setState({swapSelectionVisible: false});
    //         }, 400));
    // }

    // handleChangeSwapPartner = (event) => {
    //     this.setState({swapPartner: event.target.value});
    // }

    // handleSwapPartnerDropdownOpen = () => {
    //     this.setState({swapPartnerDropdownOpen: true});
    // }

    // handleSwapPartnerDropdownClose = () => {
    //     this.setState({swapPartnerDropdownOpen: false});
    // }

    // cancelSwap = () => {
    //     this.closeSwap();
    // }

    // confirmSwap = () => {
    //     // open dropdown menu if no swapPartner is chosen yet
    //     if(!this.state.swapPartner) {
    //         this.handleSwapPartnerDropdownOpen();
    //     }

    //     else {
    //         // setting this component to a waiting/loading state until it will be rerendered with swapped players once backend call in parent is finished and updated player data from backend is passed
    //         this.setState({processingSwap: true});
    //         this.props.swap(this.props.playerBox.my.player, this.state.swapPartner);
    //     }
    // }

    render() {
        let classNameExpansionPostfix = (this.state.swapExpanded?" expanded":(this.state.firstTime?"":" unexpanded"));
        // let classNameSwapMenuVisibility = (this.state.swapSelectionVisible?"":" hide");

        // let playersMenuEntries;
        // if(this.state.swapSelectionVisible) {
        //     playersMenuEntries = this.props.getSwapMenuEntries().map((player) => <MenuItem key={player.id} value={player.id}>{player.name?player.name:("Player " + player.id)}</MenuItem>);
        // }
        let playerBox = this.props.playerBox;
        // let currentTeam = this.props.playerBox.my.team;
        // let allTeams = this.props.getTeams();
        let style = {borderColor: this.props.playerBox.cornerColor};

        // let teamMenuItems = allTeams.map(team => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)
        if(this.props.playerBox.my.selected) {
            style['color'] = 'FFF';
        }

        let name = this.props.name ? this.props.name : "test1";

        // selects or deselects (if its already selected) the clicked item (e.g. player)
        let clickItem = () => {
            let deselect = this.props.playerBox.my.selected;
            this.props.changeSelection(playerBox.my.key, deselect);
        }

        return (
            <div className={"TrackListItem" + (playerBox.my.selected ? " selected" : "") + classNameExpansionPostfix} style={style} onClick={clickItem}>

                {/* <div className={"TrackListItemSwapOverlay" + classNameExpansionPostfix}>
                    <div className={"TrackListItemSwapOverlayContent" + classNameSwapMenuVisibility}>
                        <div className={"TrackListItemSwapOverlayContentText"}>Swap {playerBox.my.name?playerBox.my.name:("Player " + playerBox.my.player)} with </div>

                        <FormControl className={"TrackListItemSwapOverlayContentDropdown"}>

                                <Select
                                    // labelId="swap-dropdown-label"
                                    disabled={this.state.processingSwap}
                                    id="demo-simple-select"
                                    value={this.state.swapPartner}
                                    onChange={this.handleChangeSwapPartner}
                                    open={this.state.swapPartnerDropdownOpen}
                                    onClose={this.handleSwapPartnerDropdownClose}
                                    onOpen={this.handleSwapPartnerDropdownOpen}
                                >
                                    {playersMenuEntries}
                                </Select>
                        </FormControl>

                        <IconButton size="small" disabled={this.state.processingSwap} className={"TrackListItemSwapOverlayContentButton"} onClick={this.cancelSwap} aria-label="cancel swap">
                            <FontAwesomeIcon icon={faPlus} transform="rotate-45"/>
                        </IconButton>

                        <IconButton size="small" disabled={this.state.processingSwap} className={"TrackListItemSwapOverlayContentButton"} onClick={this.confirmSwap} aria-label="confirm swap">
                            {this.state.processingSwap?
                                <FontAwesomeIcon icon={faSpinner} className="fa-spin" />:
                                <FontAwesomeIcon icon={faCheck} />

                            }
                        </IconButton>
                    </div>
                </div> */}

                {/*<h1 className={"TrackListItemName" + (playerBox.my.selected ? " selected" : "")}> {name} </h1>*/}
                <IconButton size="small" className={"TrackListItemBlink"} onClick={this.props.blink.bind(this, playerBox)} aria-label="blink item">
                    <Highlight/>
                </IconButton>

                <IconButton size="small" className={"TrackListItemDelete"} onClick={this.delete} aria-label="delete item">
                    <Delete/>
                </IconButton>
                
                <div className='staticText'>Player name: </div>
                <EditText
                    className={"TrackListItemName" + (playerBox.my.selected ? " selected" : "")}
                    defaultValue={name.toString()}
                    onSave={this.handleChangeName}
                    style={{marginLeft: '5px', width: '100px'}}
                />


                {/* <IconButton size="small" className={"TrackListItemSwap"} onClick={this.openSwap} aria-label="swap item">
                    <Swap/>
                </IconButton> */}

                {/*Material UI Dropdown Select*/}
                {/* <FormControl className={"TrackListItemTeamDropdown"}>
                    <InputLabel id="demo-simple-select-label">Team</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={currentTeam}
                        onChange={this.handleChangeTeam}
                    >
                        {teamMenuItems}
                    </Select>
                </FormControl> */}
            </div>
        );
    }
}

TrackListItemPlayer.propTypes = {
    playerBox: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    changeSelection: PropTypes.func.isRequired,
    blink: PropTypes.func.isRequired,
    delete: PropTypes.func.isRequired,
    // getTeams: PropTypes.func.isRequired,
    // setTeam: PropTypes.func.isRequired,
    setName: PropTypes.func.isRequired,
    // getSwapMenuEntries: PropTypes.func.isRequired,
    // swap: PropTypes.func.isRequired,
};

export default TrackListItemPlayer;