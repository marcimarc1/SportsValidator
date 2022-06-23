import React, {Component} from 'react';
import PropTypes from "prop-types";
import MaterialUISlider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import "./NavBar.css"

class Slider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentFrame: props.currentFrame
        };
    }

    handleSliderChange = (event, value) => {
        this.props.changeFrame(event, value);
    }

    handleInputChange = (event, value) => {
        this.props.changeFrame(event, value);
    }

    render() {
        return (
            <div className="Slider">
                <MaterialUISlider
                    className="SliderSlider"
                    width={500}
                    value={this.state.currentFrame}
                    onChange={this.handleSliderChange}
                    aria-labelledby="input-slider"
                />

                <Input
                    className="SliderNumberInput"
                    value={this.props.currentFrame}
                    margin="dense"
                    onChange={this.handleInputChange}
                    // onBlur={handleBlur}
                    inputProps={{
                        step: 1,
                        min: 0,
                        max: this.props.maxFrame,
                        type: 'number',
                        'aria-labelledby': 'input-slider',
                    }}
                />
            </div>
        );
    }
}

Slider.propTypes = {
    getCurrentFrame: PropTypes.func.isRequired,
    maxFrame: PropTypes.number.isRequired,
    changeFrame: PropTypes.func.isRequired
};

export default Slider;