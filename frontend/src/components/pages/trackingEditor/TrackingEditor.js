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
        canvasElements: [],
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
        playerColors: {},    //TODO
        labelVisibility: 'always'      //selected, always or none; TODO add button to change that (Toggle between labels visible when hovering over /having selected box, always, never
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





        // canvas.on('mouse:over', function(e) {
        //     e?.target?.my.idObject.set('visible', 'true');
        //     canvas.renderAll();
        // });






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
        let newCanvasElements = [];
        for(let i = 0; i < annotationsCurrentFrame.length; i++) {
            newCanvasElements.push(this.CreateNewBBox(annotationsCurrentFrame[i]));
        }
        // console.log(annotationsCurrentFrame);
        // console.log(newCanvasElements);

        // Add labels and bounding boxes to canvas; Start with labels so they are behind all bBoxes => bBoxes behind labels can be selected
        // let canvasCopy = this.canvas;
        // newCanvasElements.forEach(bBox => canvasCopy.add(bBox.idObject, bBox.teamObject, bBox.playerObject));
        // newCanvasElements.forEach(bBox => canvasCopy.add(bBox));

        this.setState(state => {canvasElements: state.canvasElements.concat(newCanvasElements)});        // concat does not mutate the original array
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

    CreateNewBBox = (args) => {
        // console.log("Adding new Bounding Box! Args:");
        // console.log(args);


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


        //get metadata for BBox
        let textHorizontalOffset = 5;
        let textLeft = left + width + textHorizontalOffset;
        let textVerticalDistance = 25;
        let fontSize = 20;
        let fontFamily = "Roboto";
        let visible = this.state.labelVisibility === "always" ? true : false;
        let id = new fabric.Text("ID: " + args.id.toString(), {     //Todo add dict that translates id to name? => to support renaming
            fontSize,
            fontFamily,
            visible,
            selectable: false,
            hoverCursor: 'normal',
            left: textLeft,
            top: top
        });
        let team = new fabric.Text("Team: " + args.category_id.toString(), {
            fontSize,
            fontFamily,
            visible,
            selectable: false,
            hoverCursor: 'normal',
            left: textLeft,
            top: top + textVerticalDistance
        });
        let player = new fabric.Text("Player: " + args.attributes.track_id.toString(), {
            fontSize,
            fontFamily,
            visible,
            selectable: false,
            hoverCursor: 'normal',
            left: textLeft,
            top: top + 2 * textVerticalDistance
        });

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
            lockRotation: true
        });

        // add Metadata and labels to bBox (using .my to not accidentally override attributes of the fabric Rect object
        bBox.my = {
            id: args.id,
            dirty: false,       // dirty flag to keep track of which bBoxes have been changed so that only dirty BBoxes have to be sent to/updated in the Backend
            idObject: id,
            teamObject: team,
            playerObject: player
        };





        // bBox.cornerSize = Math.min(bBox.width, bBox.height) / ... // Dynamically change corner size so they are more visible on bigger BBoxes? Probably do not do it


        let maybeHideLabels = () => {
            if(this.state.labelVisibility === "selected" && !(this.canvas.getActiveObject() === bBox)) {
                bBox.my.idObject.set('visible', false);
                bBox.my.teamObject.set('visible', false);
                bBox.my.playerObject.set('visible', false);
                this.canvas.requestRenderAll();     //otherwise it is just updated when clicking somewhere
            }
        }

        let maybeShowLabels = () => {
            if(this.state.labelVisibility === "selected") {
                bBox.my.idObject.set('visible', true);
                bBox.my.teamObject.set('visible', true);
                bBox.my.playerObject.set('visible', true);
                this.canvas.requestRenderAll();
            }
        }

        bBox.on({
            'selected': maybeShowLabels,
            'mouseover': maybeShowLabels
        });


        bBox.on({
            'deselected': maybeHideLabels,
            'mouseout': maybeHideLabels
        });

        let updateTextLocationAccordingToBBox = (options) => {
            // console.log("Box is moving");
            // console.log(options);



            let textLeft = bBox.left + bBox.width * bBox.scaleX + textHorizontalOffset;
            bBox.my.idObject.set('left', textLeft);
            bBox.my.teamObject.set('left', textLeft);
            bBox.my.playerObject.set('left', textLeft);

            bBox.my.idObject.set('top', bBox.top).setCoords();
            bBox.my.teamObject.set('top', (bBox.top + textVerticalDistance)).setCoords();
            bBox.my.playerObject.set('top', (bBox.top + 2 *textVerticalDistance)).setCoords();

        }


        bBox.on({
            'moving': updateTextLocationAccordingToBBox,
            'scaling': updateTextLocationAccordingToBBox
        });

        // using modified event for stuff that is only necessary after modification is finished
        bBox.on({'modified': function(e) {

                // Set new positions for labels and call setCoords so that canvas coordinates (aCoords) are updated to rendered coordinates (oCoords)
                // calling setCoords is not necessary because he labels cannot be selected anyways, it just keeps all their attributes consistent.
                bBox.my.idObject.setCoords();
                bBox.my.teamObject.setCoords();
                bBox.my.playerObject.setCoords();

                // Set dirty flag
                bBox.my.dirty = true;
            }
        });


        // this.setState({canvas: this.state.canvas.add(bBox, id, team, player)});
        // this.setState({canvas: this.state.canvas.add(group)});

        this.canvas.add(bBox, bBox.my.idObject, bBox.my.teamObject, bBox.my.playerObject);

        return bBox;
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