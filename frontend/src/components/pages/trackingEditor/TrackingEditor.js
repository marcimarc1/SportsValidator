import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { fabric } from 'fabric';
import './TrackingEditor.css';

import pic from "../../../data/frame_000000.jpg";
import tracking from "../../../data/instances_default.json";


class TrackingEditor extends Component {

    cacheSize = 5;  //TODO experiment with this to check performance

    canvas = undefined;

    state = {
        // canvas: undefined,
        video: "no video assigned",
        scalingFactor: undefined,
        categories: [],
        currentFrame: undefined,
        frameCache: [],
        annotationCache: [],
        frameSource: "../data/frame_000000.jpg",
        colorByCategory: true,      //Toggle between coloring BBoxes by Category or Player
        colorCategoryNumber: 1,     //which category to color the BBoxes by if colorByCategory is true
        category_1_Colors: {
            1: 'rgb(100, 0, 0)',
            2: 'rgb(0, 0, 200)',
            3: 'rgb(0, 250, 0)',
            4: 'rgb(100, 0, 100)'
        },
        playerColors: {}    //TODO
    }

    static getDerivedStateFromProps(props, state) {
        // delete fabric's rotation control from Controls object so it is disabled for all elements
        // alternatively use fabric.Object.setControlsVisibility for per-object control
        delete fabric.Object.prototype.controls.mtr;

        // disable object caching during scaling => borders of BBoxes stay the same thickness during resizing of them.
        // this probably requires more computation but should be completely fine.
        fabric.Object.prototype.noScaleCache = false;

        return {video: props.video, currentFrame: props.currentFrame};
    }

    componentDidMount() {

        let frameSource = "../data/";
        let currentFrameNumber = this.props.currentFrame;
        let loadedFrames = [];

        //compute how many frames before and after the current frame should be cached
        let cacheSizeBefore = Math.floor((this.cacheSize - 1) / 2);
        let cacheSizeBehind = Math.ceil((this.cacheSize - 1) / 2);

        //adjust cache size in case there do not exist enough prior frames
        while(currentFrameNumber < cacheSizeBefore + 1) {       // +1 to adapt for frames starting at 1, not 0
            cacheSizeBefore -= 1;
            cacheSizeBehind += 1;
        }

        // load video frames to cache (TODO not working right now, probably because of require, just sticking to 1 frame for now)
        for(let i=currentFrameNumber-cacheSizeBefore; i<=currentFrameNumber+cacheSizeBehind; i++) {
            // TODO if this code is reused, check if frame is already cached before loading it
            let framePath = frameSource + "frame_" + i.toString().padStart(6, "0") + ".jpg";
            // let currentFrame = require(framePath);     //probably/maybe bad to use import here, but will be changed once API is there anyways
            // loadedFrames.push({index: i, data: currentFrame});
        }

        console.log(tracking);

        //load categories and annotations
        let categories = tracking.categories;
        console.log(categories);

        //load annotations
        let annotations = tracking.annotations;
        console.log("annotations: ");
        console.log(annotations);
        console.log("currentFrameNumber: " + currentFrameNumber);
        console.log("cacheSizeBefore: " + cacheSizeBefore);
        let firstCachedFrame = currentFrameNumber - cacheSizeBefore;
        let lastCachedFrame = currentFrameNumber + cacheSizeBehind;
        let cachedAnnotations = this.getAnnotationsForFrames(annotations, firstCachedFrame, lastCachedFrame);
        console.log(`Frames from ${firstCachedFrame} to ${lastCachedFrame}: `);
        console.log(cachedAnnotations);




        console.log("finished filtering and caching annotations!");


        // Setup Canvas and Fabric
        let canvas = new fabric.Canvas('tracking-editor-canvas');
        let scalingFactor = 0;

        //THIS SHOULD BE DONE WHENEVER NEW VIDEO IS USED (then just keep scaling factor or handle it in backend to make sure all images are same size?)
        //compute scaling factor for image to fit into fixed size canvas (only using width to keep picture ratio)

        let img = new Image();
        img.src = pic;
        scalingFactor = canvas.getWidth() / img.width;
        img.onload = () => {
            this.setState({scalingFactor: scalingFactor});
            canvas.setBackgroundImage(pic, canvas.renderAll.bind(canvas), {scaleX: scalingFactor, scaleY: scalingFactor});
            // canvas.setHeight(img.height * scalingFactor);
        }

        //configure Event Handlers for canvas

        // TODO maybe attach modified listener directly to each Rect?
        canvas.on('object:modified', function(options) {
            if(options.target) {
                console.log("e: ");
                console.log(options.e);
                console.log("coordinates of modified: ");
                console.log(options.target.aCoords);

            }
        })

        this.canvas = canvas;
        this.setState({scalingFactor: scalingFactor, categories: categories, annotationCache: cachedAnnotations, frameCache: loadedFrames},
            () => this.plotBBoxes());


    }

    // assumes that annotations array is ordered by increasing frame number (image_id)
    // lastFrame is included
    getAnnotationsForFrames = (annotations, firstFrame, lastFrame) => {
        let firstAnnotation = annotations.findIndex(element => element.image_id == firstFrame);
        console.log("first Annotation: " + firstAnnotation);
        let lastAnnotation = annotations.findIndex(element => element.image_id == lastFrame + 1);
        console.log("last Annotation: " + lastAnnotation);

        let cachedAnnotations = annotations.slice(firstAnnotation, lastAnnotation);
        console.log(cachedAnnotations);
        return cachedAnnotations;
    }

    plotBBoxes = () => {
        // TODO maybe add support for iscrowd (right now it is ignored), see/ask if it is used in backend
        let annotationsCurrentFrame = this.getAnnotationsForFrames(this.state.annotationCache, this.state.currentFrame, this.state.currentFrame);
        for(let i = 0; i < annotationsCurrentFrame.length; i++) {
            this.addNewBBox(annotationsCurrentFrame[i]);
        }
        console.log(annotationsCurrentFrame);
    }

    getFrame = (i) => {
        let ret = this.state.frameCache.find(element => element.index = i);
        if(ret === undefined) {
            console.log("tried to get Frame " + i + ", but that frame is not yet loaded into TrackingEditor.state.frameCache");
        }
        return ret;
    }

    render() {
        return (
            <div className="TrackingEditor">
                <canvas id="tracking-editor-canvas" width="1440" height="810" ></canvas>
                <button type="button" onClick={this.addNewRect}> Draw! </button>
            </div>
        );
    }

    addNewBBox = (args) => {
        console.log("Adding new Bounding Box! Args:");
        console.log(args);


        console.log("************************");
        console.log(this.state);


        //get values for BBox position and color
        let left = args.bbox[0] * this.state.scalingFactor;
        let top = args.bbox[1] * this.state.scalingFactor;
        let width = args.bbox[2] * this.state.scalingFactor;
        let height = args.bbox[3] * this.state.scalingFactor;
        let color;
        if(this.state.colorByCategory) {
            let categoryColorDict = `category_${this.state.colorCategoryNumber}_Colors`;
            color = this.state[categoryColorDict][args.category_id];
        }
        else {
            color = this.state.playerColors[args.attributes.track_id];
        }

        // generate fill color which is regular color but more transparent
        let fill = new fabric.Color(color).setAlpha(0.4).toRgba();

        let bBox = new fabric.Rect({
            left,
            top,
            fill,
            cornerColor: color,
            cornerSize: 4,
            stroke: color,
            hasBorders: false,              // disables the control borders (the lines connecting the controls the show up when object is selected
            strokeWidth: 1,
            strokeUniform: true,            // to keep the bounding box a consisten thickness, independent of its size
            width,
            height,
            padding: 0,  // to make sure the pixel coordinates are correct
            cornerStyle: 'circle',
            lockRotation: true,
            // noScaleCache: false
        });

        //get metadata for BBox
        let textLeft = left + width + 5;
        let verticalDistance = 25;
        let fontSize = 20;
        let fontFamily = "Roboto";
        let id = new fabric.Text("ID: " + args.id.toString(), {     //Todo add dict that translates id to name? => to support renaming
            fontSize,
            fontFamily,
            selectable: false,
            hoverCursor: 'normal',
            left: textLeft,
            top: top
        });
        let team = new fabric.Text("Team: " + args.category_id.toString(), {
            fontSize,
            fontFamily,
            selectable: false,
            hoverCursor: 'normal',
            left: textLeft,
            top: top + verticalDistance
        });
        let player = new fabric.Text("Player: " + args.attributes.track_id.toString(), {
            fontSize,
            fontFamily,
            selectable: false,
            hoverCursor: 'normal',
            left: textLeft,
            top: top + 2 * verticalDistance
        });

        // bBox.cornerSize = Math.min(bBox.width, bBox.height) /

        // let group = new fabric.Group([bBox, id, team, player]);
        bBox.on({'moving': function(e) {
            console.log(e);
            // TODO get text corresponding to moved bbox(e.target);
                // either set text to visible or add text to canvas (then use
                // if setting text to visible move text with bBox in this function
        }
        });
        // this.setState({canvas: this.state.canvas.add(bBox, id, team, player)});
        // this.setState({canvas: this.state.canvas.add(group)});
        this.canvas.add(bBox, id, team, player);
    }


    addNewRect = () => {

        let dirty = true;
        let addNewRect2 = (state, props) => {
            let rect = new fabric.Rect({
                left: 100,
                top: 100,
                fill: 'rgba(0, 0, 0, 0)',
                stroke: 'green',
                strokeWidth: 5,
                width: 20,
                height: 20,
                padding: 0,  // to make sure the pixel coordinates are correct
                cornerStyle: 'circle',
                lockRotation: true
            });

            rect.hasBorders = false;    // disables the control borders (the lines connecting the controls the show up when object is selected
            rect.strokeUniform = true;  // to keep the bounding box a consisten thickness, independent of its size

            //Rect has properties aCoords (with coordinates for all 4 corners), width, heigth

            let canvas = state.canvas;


            return {canvas: canvas.add(rect)};
        };

        this.setState(addNewRect2);
    }
}

TrackingEditor.propTypes = {
    video: PropTypes.string, //make required
    currentFrame: PropTypes.number
};

TrackingEditor.defaultProps = {
    video: "Demo",
    currentFrame: 1
};

export default TrackingEditor;