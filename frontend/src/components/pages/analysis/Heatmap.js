import React, {Component} from 'react';
import PropTypes from 'prop-types';
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from "@material-ui/core/FormControl";
import {fabric} from "fabric";


class Heatmap extends Component {

    state = {
        stepSize: 1,
        startFrame: 0,
        endFrame: 0,
        heatmapBubbleRadius: 2,
        opacity: 0.1
    }

    canvas;

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
        console.log("Set canvas height to "+this.legendTotalHeight);
    }

    // does not rerender canvas, so this.canvas.renderAll() has to be called after this function!
    makeLine = (coords, params) => {
        console.log("Traing to make line:" + coords);
        let line = new fabric.Line(coords, {
            stroke: '#707070',
            ...this.standardParams,
            ...params
        });
        this.canvas.add(line);
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
    }

    // does not rerender canvas, so this.canvas.renderAll() has to be called after this function!
    makeLegendEntry = (x, y, color, text) => {
        console.log("Trying to draw legendLine "+ [x, y, color, text]);
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
        lines.forEach((l) => this.makeLine(l, {strokeWidth: strokeWidth}));
        this.makeLine(middleLine, {strokeWidth: strokeWidth, strokeDashArray: [5, 5]});
        this.canvas.renderAll();

        // Draw actual Heatmap
        if(this.props.positionData) {
            for (let annotation of this.props.positionData) {
                let x = (annotation.bbox[0] + annotation.bbox[2] * 0.5) / this.props.scalingFactor;
                let y = (annotation.bbox[1] + annotation.bbox[3] * 0.5) / this.props.scalingFactor;
                let color = this.props.categoryColors[annotation.category_id];
                this.makeHeatmapBubble(x, y, color);
            }

        // Draw Legend
            let legendEntries = [];

            // if there are too many teams, make legend smaller
            if(this.legendLineHeight * this.props.teams.length > this.legendTotalHeight) {
                this.legendLineHeight = this.legendTotalHeight / this.props.teams.length;
            }

            let x = 10;
            let y = this.props.canvasHeight + this.spaceAboveLegend;

            console.log(this.props.teams);
            for(let i = 0; i < this.props.teams.length; i++) {
                let teamId = this.props.teams[i].id;
                this.makeLegendEntry(x, y, this.props.categoryColors[teamId], this.props.teams[i].name);
                y += this.legendLineHeight;
            }


            this.canvas.renderAll();
        }



    }

    render() {
        console.log(this.props.data);
        let width = 3840
        return (
            <div>
                <canvas id="heatmap-canvas" width={this.props.canvasWidth} height={this.props.canvasHeight+this.legendTotalHeight} ></canvas>
            </div>
        );
    }
}

Heatmap.propTypes = {
    positionData: PropTypes.array.isRequired,
    teams: PropTypes.array.isRequired,
    categoryColors: PropTypes.object.isRequired,
    canvasWidth: PropTypes.number.isRequired,
    canvasHeight: PropTypes.number.isRequired,      // actual canvas height is a bit to accommodate legend, this prop is height of playing field in canvas
    scalingFactor: PropTypes.number.isRequired
};

export default Heatmap;
