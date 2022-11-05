import React, {Component} from 'react';
import PropTypes from "prop-types";
import MaterialUISlider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import "./NavBar.css"

class Slider extends Component {
    state = {currentFrame: 0};

        componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.currentFrame != this.props.currentFrame) {       // if Frame is changed somewhere else, i.e. in Transport Buttons
            this.setState({currentFrame: this.props.currentFrame});
        }
    }

    // calls functions in parent components once slider is released (mouseup) so that change takes effect
    onChangeCommitted = (event, value) => {
        this.props.changeFrame(value);
    }

    // handles change of local variable so that slider moves while it's being adjusted but change only takes effect in onChangeCommitted
    onChange = (event, value) => {
        this.setState({currentFrame: value});
        //this.forceUpdate();
    }

    handleInputChange = (event) => {
        console.log("**************");
        console.log(event);
        let newFrame = Number(event.target.value); // returns NaN, int or float
        if(Number.isInteger(newFrame))
            this.props.changeFrame(newFrame);
    }

    render() {
        return (
            <div className="Slider">
                <MaterialUISlider
                    className="SliderSlider"
                    width={500}
                    value={this.state.currentFrame}
                    min={0} //TODO change to 1 once frames are also changed
                    max={this.props.maxFrame}
                    onChange={this.onChange}
                    onChangeCommitted={this.onChangeCommitted}
                    aria-labelledby="input-slider"
                />

                <Input
                    className="SliderNumberInput"
                    value={this.state.currentFrame}
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
    currentFrame: PropTypes.number.isRequired,
    maxFrame: PropTypes.number.isRequired,
    changeFrame: PropTypes.func.isRequired
};

export default Slider;