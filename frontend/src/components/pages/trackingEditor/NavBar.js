import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faChevronLeft, faStepBackward, faTag, faUndo} from '@fortawesome/free-solid-svg-icons'
import Slider from "./Slider"
import "./NavBar.css"
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from "@material-ui/core/FormControl";

class NavBar extends Component {

    // Playing frames (what happens when pressing the Play button is currently working but not very smoothly.
    // Caching Frames should help but I believe this should be done together with the Backend
    // because in the end the frames will not be read from disk anyway.
    state = {
        playing: false  // to indicate whether play is active or no (in order to switch between play and pause button)
    }

    bigStepSize = 10;   // how many frames the doubleChevron buttons go forward or backward
    playMillisecondsPerFrame = 5000;

    componentDidUpdate(prevProps, prevState) {
        if(this.state.playing) {
            setTimeout(this.switchFrameRelative(1), this.playMillisecondsPerFrame);
        }
    }

    switchFrame = (i) => () => {
        if(i != this.props.getCurrentFrame() || i > 0 || i < this.props.maxFrame) {
            this.props.switchFrame(i);
        }
    }

    switchFrameRelative = (i) => {
        return this.switchFrame(this.props.getCurrentFrame() + i);
    }

    changeFrameViaSlider = (event, value) => {
        console.log("Changed Frame via slider to frame "+value);
        this.switchFrame(value);
    }

    transportButtonSize = "fa-2x";

    playPause = () => {
        // TODO
        this.setState({playing: !this.state.playing});
    }

    handleChangeVisibility = (event) => {
        this.props.setLabelVisibility(event.target.value);
    }

    render() {
        let visibilityOptions = ["always", "selected", "hover", "never"].map(v => <MenuItem value={v}>{v}</MenuItem>);
        return (
            <div  className="NavBar"> {/*style={{width: this.props.width}}*/}
                <div className="NavBarUndoRedo">
                    <FontAwesomeIcon icon={faUndo} onClick={this.props.undoRedo(true)} className={this.transportButtonSize + " NavBarUndoRedoIcon Pointer"}/>
                    <FontAwesomeIcon icon={faUndo} flip="horizontal" onClick={this.props.undoRedo(false)} className={this.transportButtonSize + " NavBarUndoRedoIcon Pointer"}/>
                </div>
                <div className="NavBarTransport">
                    <div className="NavBarTransportButtonContainer">
                        <FontAwesomeIcon icon={faStepBackward} onClick={this.switchFrame(0)} className={this.transportButtonSize + " NavBarTransportButton NavBarTransportButtonFirst Pointer"} />
                        <span onClick={this.switchFrameRelative(-this.bigStepSize)} className={this.transportButtonSize + " fa-layers fa-fw NavBarTransportButton  Pointer"}>      {/* making a double chevron because fontawesome does not have one (double angle is scaled down)*/}
                            <FontAwesomeIcon icon={faChevronLeft} />
                            <FontAwesomeIcon icon={faChevronLeft} transform="right-6" />
                        </span>
                        <FontAwesomeIcon icon={faChevronLeft} onClick={this.switchFrameRelative(-1)} className={this.transportButtonSize + " NavBarTransportButton Pointer"} />
                        <FontAwesomeIcon icon={faPlay} onClick={this.playPause} className={this.transportButtonSize + " NavBarTransportButton NavBarTransportButtonPlay Pointer" + (this.state.playing ? " remove": "")} />
                        <FontAwesomeIcon icon={faPause} onClick={this.playPause} className={this.transportButtonSize + " NavBarTransportButton NavBarTransportButtonPause Pointer" + (this.state.playing ? "": " remove")} />
                        <FontAwesomeIcon icon={faChevronLeft} flip="horizontal" onClick={this.switchFrameRelative(1)} className={this.transportButtonSize + " NavBarTransportButton Pointer"} />
                        <span onClick={this.switchFrameRelative(this.bigStepSize)} className={this.transportButtonSize + " fa-layers fa-fw NavBarTransportButton NavBarTransportButtonDoubleChevronRight Pointer"}>      {/* making a double chevron because fontawesome does not have one (double angle is scaled down)*/}
                            <FontAwesomeIcon icon={faChevronLeft} flip="horizontal"/>
                            <FontAwesomeIcon icon={faChevronLeft} flip="horizontal" transform="left-6" />
                        </span>
                        <FontAwesomeIcon icon={faStepBackward} flip="horizontal" className={this.transportButtonSize + " NavBarTransportButton NavBarTransportButtonLast Pointer"} />
                    </div>

                    <div className="NavBarSlider">
                        <Slider currentFrame={this.props.getCurrentFrame} maxFrame={this.props.maxFrame} changeFrame={this.changeFrameViaSlider}/>
                    </div>
                </div>

                <div className="NavBarLabelVisibilityDropdown">
                    <FontAwesomeIcon className="NavBarLabelVisibilityDropdownIcon" icon={faTag} transform="grow-10"/>
                    {/*  TODO dropdown for selection when to show labels (always, selected, ..)  */}
                    <FormControl>
                        <InputLabel id="labeling-select-label"></InputLabel>
                        <Select
                            labelId="labeling-select-label"
                            id="labeling-select"
                            value={this.props.labelVisibility}
                            onChange={this.handleChangeVisibility}
                        >
                            {visibilityOptions}
                        </Select>
                    </FormControl>
                </div>
            </div>
        );
    }
}

NavBar.propTypes = {
    undoRedo: PropTypes.func.isRequired,
    switchFrame: PropTypes.func.isRequired,
    getCurrentFrame: PropTypes.func.isRequired,
    labelVisibility: PropTypes.string.isRequired,
    setLabelVisibility: PropTypes.func.isRequired,
    maxFrame: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired
};

export default NavBar;