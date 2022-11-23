import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from "@material-ui/core/FormControl";
import {fabric} from "fabric";
import MaterialUISlider from "@material-ui/core/Slider";

import "./Analysis.css";


class Heatmap extends Component {

    state = {
        stepSize: 1,
        maxStepSize: 100,
        startFrame: 0,
        endFrame: 0,
        heatmapBubbleRadius: 7, //2
        opacity: 0.3 //0.1
    }

    positionDataIndexByPlayer = {}; // every key is a player id and has a list of all indices in this.props.positionData that have a position corresponding to this player

    canvas;
    nonHeatmapBubbleCanvasElements = [];

    spaceAboveLegend = 10;
    legendLineHeight = 40;
    legendTotalHeight;

    standardParams = {
        selectable: false,
        evented: false, // makes sure cursor stays normal when hovering over object
        objectCaching: false,
        padding: 0,  // to make sure the pixel coordinates are correct
        hasBorders: false,              // disables the control borders (the lines connecting the controls the show up when object is selected
        hasControls: false
    }

    constructor(props) {
        super(props);
        this.legendTotalHeight = this.props.teams.length * this.legendLineHeight + this.spaceAboveLegend;
        if(this.props.positionData) {
            this.state.endFrame = this.props.positionData[this.props.positionData.length-1].image_id;
        }
    }

    componentDidMount() {
        // Setup Canvas and Fabric
        this.canvas = new fabric.Canvas('heatmap-canvas', {renderOnAddRemove: false});
        let strokeWidth = 5;
        let lines = [
            // outline of canvas/playing field (not considering corners because they are optional in the tracking/not necessarily existing/correct
            [0, 0, 0, this.props.canvasHeight],
            [0, 0, this.props.canvasWidth, 0],
            [this.props.canvasWidth-strokeWidth, 0, this.props.canvasWidth-strokeWidth, this.props.canvasHeight],
            [0, this.props.canvasHeight-strokeWidth, this.props.canvasWidth, this.props.canvasHeight-strokeWidth]
        ];
        // middle line
        let middleLine = [this.props.canvasWidth/2, 0, this.props.canvasWidth/2, this.props.canvasHeight];

        // this.canvas.add(new fabric.Line(lines[0], {
        //     // left: 170,
        //     // top: 150,
        //     stroke: 'red'
        // }));

        // Draw Outline of canvas
        lines.forEach((l) => this.nonHeatmapBubbleCanvasElements.push(this.makeLine(l, {strokeWidth: strokeWidth})));

        this.nonHeatmapBubbleCanvasElements.push(this.makeLine(middleLine, {strokeWidth: strokeWidth, strokeDashArray: [5, 5]}));
        this.canvas.renderAll();

        if (this.props.positionData) {

            // sort position data by player so step size works
            for (let i = 0; i < this.props.positionData.length; i = i + 1) {
                let player = this.props.positionData[i].attributes.track_id;
                if(!this.positionDataIndexByPlayer.hasOwnProperty(player))
                    this.positionDataIndexByPlayer[player] = [];

                // writing index positionDate entry at index <frame_id> in list as opposed to just using push so that changing frames always works (maybe some players are not visible in all frames)
                this.positionDataIndexByPlayer[player][this.props.positionData[i].image_id] = i;
            }

            // Draw Legend

            // if there are too many teams, make legend smaller
            if(this.legendLineHeight * this.props.teams.length > this.legendTotalHeight) {
                this.legendLineHeight = this.legendTotalHeight / this.props.teams.length;
            }

            let x = 10;
            let y = this.props.canvasHeight + this.spaceAboveLegend;

            for(let i = 0; i < this.props.teams.length; i++) {
                let teamId = this.props.teams[i].id;
                this.nonHeatmapBubbleCanvasElements.push(this.makeLegendEntry(x, y, this.props.categoryColors[teamId], this.props.teams[i].name));
                y += this.legendLineHeight;
            }


            this.canvas.renderAll();    // Already calling renderAll() before heatmap is drawn so lines and legend already appear in case drawHeatmap() takes longer for some reason

            let somePlayerIndices = this.props.positionData[0].attributes.track_id;   // just randomly picking the first player id

            let stateModifier = {maxStepSize: this.positionDataIndexByPlayer[somePlayerIndices].length};
            if(this.props.stateVariables) {
                stateModifier = {...stateModifier, ...this.props.stateVariables};
            }

            // decreasing and increasing endframe of FrameSlider because that prevents an error from happening that otherwise occurs when moving start value before end value. Maybe a bug in the MUI slider?
            // this.setState(stateModifier);
            this.setState((prevState) => ({...stateModifier, endFrame: prevState.endFrame-1}), () => this.setState((prevState) => ({endFrame: prevState.endFrame+1}), () => {this.drawHeatmap(); this.canvas.renderAll();}));

        }
    }

    saveState = () => {
        let stateCopy = {...this.state};
        delete stateCopy.maxStepSize;   // not necessary, is computed here anyways
        this.props.saveState(stateCopy);
    }

    // does not rerender canvas, so this.canvas.renderAll() has to be called after this function!
    makeLine = (coords, params) => {
        let line = new fabric.Line(coords, {
            stroke: '#707070',
            ...this.standardParams,
            ...params
        });
        this.canvas.add(line);
        return line;
    }

    // does not rerender canvas, so this.canvas.renderAll() has to be called after this function!
    makeHeatmapBubble = (x, y, color) => {
        let heatmapBubble = new fabric.Circle({
            radius: this.state.heatmapBubbleRadius,
            originX: 'center',
            originY: 'center',
            fill: color,
            opacity: this.state.opacity,
            left: x,
            top: y,
            cornerSize: 4,
            cornerStyle: 'circle',
            ...this.standardParams
        });
        this.canvas.add(heatmapBubble);
        return heatmapBubble;
    }

    // does not rerender canvas, so this.canvas.renderAll() has to be called after this function!
    makeLegendEntry = (x, y, color, text) => {
        let legendCircle = new fabric.Circle({
            radius: (this.legendLineHeight / 2) * 0.6,
            originX: 'center',
            originY: 'center',
            fill: color,
            left: x + this.legendLineHeight/2,
            top: y + this.legendLineHeight/2,
            cornerSize: 4,
            cornerStyle: 'circle',
            ...this.standardParams
        });
        this.canvas.add(legendCircle);

        let fontSize = this.legendLineHeight * 0.5;
        let fontFamily = "Roboto";
        let legendText = new fabric.Text(text, {
            fontSize,
            fontFamily,
            originY: 'center',
            left: x + this.legendLineHeight,
            top: y + this.legendLineHeight * 0.5,
            ...this.standardParams
        });
        this.canvas.add(legendText);

        return new fabric.Group([legendCircle, legendText]);
    }


    drawHeatmap = () => {
        if (this.props.positionData) {
            for(let [_, indexListCurrentPlayer] of Object.entries(this.positionDataIndexByPlayer)) {
                for (let i = this.state.startFrame; i < this.state.endFrame; i = i + this.state.stepSize) {

                    // for (let i = this.state.startFrame; i < this.state.endFrame; i = i + this.state.stepSize) {
                    if(indexListCurrentPlayer[i]) {
                        let annotation = this.props.positionData[indexListCurrentPlayer[i]];
                        let x = (annotation.bbox[0] + annotation.bbox[2] * 0.5) / this.props.scalingFactor;
                        let y = (annotation.bbox[1] + annotation.bbox[3] * 0.5) / this.props.scalingFactor;
                        let color = this.props.categoryColors[annotation.category_id];
                        this.makeHeatmapBubble(x, y, color);
                    }
                }
            }
        }
    }

    clearHeatmap = () => {
        this.canvas.clear();
        this.nonHeatmapBubbleCanvasElements.forEach((element) => this.canvas.add(element));
    }

    redoHeatmap = () => {
        this.clearHeatmap()
        this.drawHeatmap();
        this.canvas.renderAll();
    }

    sliding = (stateVariable) => (event, value) => {
        this.setState({[stateVariable]: value});
    }

    committed = (stateVariable) => (event, value) => {
        // this.props.stateVariables is duplicated in this components state which could maybe be done better. But saveState seems to not cause a rerender and state of this component is directly saved in state of Analysis via saveState, so this is not really a problem
        // it's not possible to only use the state of the parent components because I want to decide here when heatmap gets redrawn (only on committed changes to sliders and not on other slider changes which are also handled via the state of this component)
        this.setState({[stateVariable]: value}, () => {
            this.redoHeatmap();
            this.saveState();
        });
    }

    slidingFrames = (event, value) => {
        this.setState({startFrame: value[0], endFrame: value[1]});
    }

    committedFrames = (event, value) => {
        this.setState({startFrame: value[0], endFrame: value[1]}, () => {this.redoHeatmap(); this.saveState();});
    }

    render() {
        let width = 3840;
        return (
            <div>
                <canvas id="heatmap-canvas" width={this.props.canvasWidth} height={this.props.canvasHeight+this.legendTotalHeight} ></canvas>

                <div className="HeatmapSliderContainer">
                    <div className="HeatmapSlider">
                        <div className="HeatmapSliderLabel">
                            Step Size
                        </div>
                        <MaterialUISlider
                            className="StepSizeSlider"
                            width={300}
                            value={this.state.stepSize}
                            min={1}
                            max={this.state.maxStepSize}
                            onChange={this.sliding("stepSize")}
                            onChangeCommitted={this.committed("stepSize")}
                            valueLabelDisplay="auto"
                            aria-label="step-size-slider"
                        />
                    </div>
                    <div className="HeatmapSlider">
                        <div className="HeatmapSliderLabel">
                            Opacity
                        </div>
                        <MaterialUISlider
                            className="OpacitySlider"
                            width={300}
                            value={this.state.opacity}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={this.sliding("opacity")}
                            onChangeCommitted={this.committed("opacity")}
                            valueLabelDisplay="auto"
                            aria-label="opacity-slider"
                        />
                    </div>
                    <div className="HeatmapSlider">
                        <div className="HeatmapSliderLabel">
                            Size
                        </div>
                        <MaterialUISlider
                            className="SizeSlider"
                            width={300}
                            value={this.state.heatmapBubbleRadius}
                            min={1}
                            max={30}
                            step={1}
                            onChange={this.sliding("heatmapBubbleRadius")}
                            onChangeCommitted={this.committed("heatmapBubbleRadius")}
                            valueLabelDisplay="auto"
                            aria-label="size-slider"
                        />
                    </div>
                    <div className="HeatmapSlider">
                        <div className="HeatmapSliderLabel">
                            Frames
                        </div>
                        <MaterialUISlider
                            className="FrameSlider"
                            width={300}
                            value={[this.state.startFrame, this.state.endFrame]}
                            min={this.props.positionData[0].image_id}
                            max={this.props.positionData[this.props.positionData.length-1].image_id}
                            step={1}
                            onChange={this.slidingFrames}
                            onChangeCommitted={this.committedFrames}
                            valueLabelDisplay="auto"
                            getAriaLabel={() => "opacity-slider"}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

Heatmap.propTypes = {
    positionData: PropTypes.array.isRequired,
    teams: PropTypes.array.isRequired,
    categoryColors: PropTypes.object.isRequired,
    canvasWidth: PropTypes.number.isRequired,
    canvasHeight: PropTypes.number.isRequired,      // actual canvas height is a bit taller to accommodate legend, this prop is height of playing field in canvas
    scalingFactor: PropTypes.number.isRequired,
    stateVariables: PropTypes.object,
    saveState: PropTypes.func
};

export default Heatmap;
