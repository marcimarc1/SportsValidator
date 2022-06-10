import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faChevronLeft, faStepBackward, faTag} from '@fortawesome/free-solid-svg-icons'
import Slider from "./Slider"
import "./NavBar.css"
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from "@material-ui/core/FormControl";

class NavBar extends Component {

    changeFrameViaSlider = () => {
        console.log("Changed Frame via slider")
    }

    transportButtonSize = "fa-2x";


    handleChangeVisibility = (event) => {
        this.props.setLabelVisibility(event.target.value);
    }

    render() {
        let visibilityOptions = ["always", "selected", "never"].map(v => <MenuItem value={v}>{v}</MenuItem>);
        return (
            <div  className="NavBar"> {/*style={{width: this.props.width}}*/}
                <div className="NavBarTransport">
                    <div className="NavBarTransportButtonContainer">
                        <FontAwesomeIcon icon={faStepBackward} className={this.transportButtonSize + " NavBarTransportButton NavBarTransportButtonFirst"} />
                        <span className={this.transportButtonSize + " fa-layers fa-fw NavBarTransportButton"}>      {/* making a double chevron because fontawesome does not have one (double angle is scaled down)*/}
                            <FontAwesomeIcon icon={faChevronLeft} />
                            <FontAwesomeIcon icon={faChevronLeft} transform="right-6" />
                        </span>
                        <FontAwesomeIcon icon={faChevronLeft} className={this.transportButtonSize + " NavBarTransportButton"} />
                        <FontAwesomeIcon icon={faPlay} className={this.transportButtonSize + " NavBarTransportButton NavBarTransportButtonPlay"} />
                        <FontAwesomeIcon icon={faChevronLeft} flip="horizontal" className={this.transportButtonSize + " NavBarTransportButton"} />
                        <span className={this.transportButtonSize + " fa-layers fa-fw NavBarTransportButton NavBarTransportButtonDoubleChevronRight"}>      {/* making a double chevron because fontawesome does not have one (double angle is scaled down)*/}
                            <FontAwesomeIcon icon={faChevronLeft} flip="horizontal"/>
                            <FontAwesomeIcon icon={faChevronLeft} flip="horizontal" transform="left-6" />
                        </span>
                        <FontAwesomeIcon icon={faStepBackward} flip="horizontal" className={this.transportButtonSize + " NavBarTransportButton NavBarTransportButtonLast"} />
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
    getCurrentFrame: PropTypes.func.isRequired,
    labelVisibility: PropTypes.string.isRequired,
    setLabelVisibility: PropTypes.func.isRequired,
    maxFrame: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired
};

export default NavBar;