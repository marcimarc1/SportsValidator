import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { fabric } from 'fabric';
import './TrackingEditor.css';

import pic from "../../../data/frame_000000.jpg";
import tracking from "../../../data/instances_default.json";
import NavBar from "./NavBar";
import TrackList from "./trackList";
import TrackListItem from "./trackListItem";


class TrackingEditor extends Component {

    cacheSize = 5;  //TODO experiment with this to check performance

    canvas = undefined;

    state = {

        dummy: true,
        // canvas: undefined,
        video: "no video assigned",
        canvasElements: [],
        trackListElements: [],
        scalingFactor: undefined,
        categories: [],             // read in from annotations file
        currentFrame: undefined,    //BACKEND
        frameCache: [],
        annotationCache: [],
        frameSource: "../data/frame_000000.jpg",
        colorByCategory: true,      //Toggle between coloring BBoxes by Category or Player
        colorCategoryNumber: 1,     // not used so far, for enabling multiple categories; which category to color the BBoxes by if colorByCategory is true;
        category_1_Colors: {        //BACKEND
            1: 'rgb(100, 0, 0)',
            2: 'rgb(0, 0, 200)',
            3: 'rgb(0, 250, 0)',
            4: 'rgb(100, 0, 100)'
        },
        playerColors: {},    //BACKEND TODO; id: color (maybe also add corners)
        idToName: {         //BACKEND
            1: "Peter",
            2: "Max",
            20: "Florian"
        },
        labelVisibility: 'selected'      //selected, hover, always or never;
    }


    componentDidMount() {

        // delete fabric's rotation control from Controls object so it is disabled for all elements
        // alternatively use fabric.Object.setControlsVisibility for per-object control
        delete fabric.Object.prototype.controls.mtr;

        // disable object caching during scaling => borders of BBoxes stay the same thickness during resizing of them.
        // this probably requires more computation but should be completely fine.
        fabric.Object.prototype.noScaleCache = false;

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

        this.canvas = canvas;
        this.setState({video: this.props.video, currentFrame: this.props.currentFrame, scalingFactor: scalingFactor, categories: categories, annotationCache: cachedAnnotations, frameCache: loadedFrames},
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
        // console.log("ANNOTATIONS");
        // console.log(annotationsCurrentFrame);
        let newCanvasElements = [];
        for(let i = 0; i < annotationsCurrentFrame.length; i++) {
            newCanvasElements.push(this.CreateNewBBox(annotationsCurrentFrame[i]));
        }
        // console.log(annotationsCurrentFrame);
        // console.log(newCanvasElements);

        // Add labels and bounding boxes to canvas; Start with labels so they are behind all bBoxes => bBoxes behind labels can be selected
        // let canvasCopy = this.canvas;
        // newCanvasElements.forEach(bBox => canvasCopy.add(bBox.idOrNameObject, bBox.teamObject, bBox.playerObject));
        // newCanvasElements.forEach(bBox => canvasCopy.add(bBox));

        // let newTrackListItems = [];

        // Using concat() because for push() (which would be more appropriate) because the HTML Tag syntax did only work in a list
        // newCanvasElements.forEach(bBox => newTrackListItems = newTrackListItems.concat([<TrackListItem bBox={bBox} blink={this.blink} />]));


        this.setState({
            canvasElements: this.state.canvasElements.concat(newCanvasElements)      // concat does not mutate the original array
            // , trackListElements: this.state.trackListElements.concat(newTrackListItems)
        });//, () => this.render);
    }

    getFrame = (i) => {
        let ret = this.state.frameCache.find(element => element.index = i);
        if(ret === undefined) {
            console.log("tried to get Frame " + i + ", but that frame is not yet loaded into TrackingEditor.state.frameCache");
        }
        return ret;
    }

    getColor = (categoryId, trackId) => {
        let color;
        if(this.state.colorByCategory) {
            let categoryColorDict = `category_${this.state.colorCategoryNumber}_Colors`;
            color = this.state[categoryColorDict][categoryId];
        }
        else {
            color = this.state.playerColors[trackId];
        }
        return color;
    }

    // function to be passed to NavBar, currentFrame is only used for initialization and then NavBar manages the frame number
    // Using a function this way instead of passing a prop directly should make NavBar not remount every time the Frame changes
    getCurrentFrame = () => {
        return this.state.currentFrame
    }

    getTeams = () => {
        return this.state.categories
    }

    setTeam = (bBox, teamID) => {
        bBox.my.team = teamID;
        // TODO call backend
        this.setState({dummy: !this.state.dummy});
    }

    setLabelVisibility = (visibility) => {

        let hideOrShowLabels = () => {
            this.state.canvasElements.forEach((bBox) => {
                let vis = (visibility==="always" ? true : false);
                if(visibility==="selected" && bBox.my.selected) {
                    vis = true;
                }
                bBox.my.idOrNameObject.set('visible', vis);
                bBox.my.teamObject.set('visible', vis);
                bBox.my.playerObject.set('visible', vis);
                this.canvas.requestRenderAll();     //otherwise it is just updated when clicking somewhere
            })
        };

        if(!["always", "selected", "hover", "never"].includes(visibility)) {
            console.log("ERROR: incorrect visibility parameter!");
        }
        else
            this.setState({labelVisibility: visibility}, hideOrShowLabels);
    }

    render = () => {
        let propsTracklist = {
            players: [],
            corners: [],
            groups: []
        };
        console.log("Tracking Editor rendered!");
        let canvasWidth = this.canvas?.getWidth()   // ?. is conditional chaining, returns undefined if this.canvas is undefined
        //let trackListElementsTest = [];
        this.state.canvasElements.forEach((bBox) => propsTracklist.players = propsTracklist.players.concat([<TrackListItem bBox={bBox} changeSelection={(type, id, deselect) => this.changeSelection(type, id, deselect)} blink={this.blink} getTeams={this.getTeams} setTeam={this.setTeam}/>]));



        return (
            <div className="TrackingEditor">
                <NavBar getCurrentFrame={this.getCurrentFrame} labelVisibility={this.state.labelVisibility} setLabelVisibility={this.setLabelVisibility} maxFrame={10} width={canvasWidth}/>   {/*Todo: pass correct maxFrame*/}
                <canvas id="tracking-editor-canvas" width="1440" height="810" ></canvas>
                <TrackList>
                    {/*<h1>Test 1</h1>*/}
                    {/*<h2>Test 2</h2>*/}
                    {/*{this.state.trackListElements}*/}
                    {propsTracklist}
                </TrackList>
                {/*<button type="button" onClick={this.addNewRect}> Draw! </button>*/}
            </div>
        );
    };

    hideLabels = (bBox) => {
        bBox.my.setLabelVisibility(false);
        this.canvas.requestRenderAll();     //otherwise it is just updated when clicking somewhere

    }

    maybeHideLabels = (bBox) => {
        if((this.state.labelVisibility === "selected" && !(this.canvas.getActiveObject() === bBox)) || this.state.labelVisibility === "hover")
            this.hideLabels(bBox);
    }

    showLabels = (bBox) => {
        bBox.my.setLabelVisibility(true);
        this.canvas.requestRenderAll();
    }

    maybeShowLabels = (bBox) => {
        if(this.state.labelVisibility === "selected") {
            this.showLabels(bBox);

        }
    }

    selectBBox = (id) => {

        this.state.canvasElements.forEach(bBox => {
            if (bBox.my.id == id) {
                let bBoxDeepCopy = bBox;    //TODO the cleaner/correct version would be to do a deep clone as indicated (but not done) here. JS does not really have a deep clone functionality.
                bBoxDeepCopy.my.selected = true;
                console.log("Setting bBox " + bBox.my.id + " to selected!");
                console.log(bBoxDeepCopy);
                this.maybeShowLabels(bBoxDeepCopy);
                return bBoxDeepCopy;
            } else {
                if(bBox.my.selected) {  //old selection => deselect (not necessary when selecting next box in canvas and in that case this if clause will not be active since the box is already not selected anymore, but necessary when selecting next box in tracklist
                    console.log("deselecting old bBox");
                    bBox.my.selected = false;
                    this.maybeHideLabels(bBox);
                }
                return bBox;
            }
        });

        this.setState({dummy: !this.state.dummy});       // TODO shouldn't be necessary with Deep Clone!

        // this.forceUpdate();      //Alternative to setting dummy state like above
    };

    deselectBBox = (id) => {
        this.state.canvasElements.forEach(bBox => {
            if (bBox.my.id == id) {
                //TODO comments from selectBBox about deep clone also apply here!
                bBox.my.selected = false;
                this.setState({dummy: !this.state.dummy});
                this.maybeHideLabels(bBox);
            }
        });
    };

    changeSelection = (type, id, deselect) => {
        switch (type) {
            case "player":
                if(deselect)
                    this.selectBBox(id);
                else
                    this.deselectBBox(id);
                break;
            case "corner":
                //TODO
                break;
            case "team":
                //TODO (do nothing?)
        };
    }
    CreateNewBBox = (args) => {
        // console.log("Adding new Bounding Box! Args:");
        // console.log(args);


        //get values for BBox position and color
        let left = args.bbox[0] * this.state.scalingFactor;
        let top = args.bbox[1] * this.state.scalingFactor;
        let width = args.bbox[2] * this.state.scalingFactor;
        let height = args.bbox[3] * this.state.scalingFactor;
        let color = this.getColor(args.category_id, args.attributes.track_id);


        // generate fill color which is regular color but more transparent
        let fill = new fabric.Color(color).setAlpha(0.4).toRgba();


        //get metadata for BBox
        let textHorizontalOffset = 5;
        let textLeft = left + width + textHorizontalOffset;
        let textVerticalDistance = 25;
        let fontSize = 20;
        let fontFamily = "Roboto";
        let visible = this.state.labelVisibility === "always" ? true : false;
        let id = args.id;
        let team = args.category_id;
        let player = args.attributes.track_id
        let name = args.id in this.state.idToName ? this.state.idToName[args.id] : undefined;
        let idText = name ? "Name: " + this.state.idToName[args.id] : "ID: " + args.id.toString();
        let idOrNameObject = new fabric.Text(idText, {     //Todo add dict that translates id to name? => to support renaming
            fontSize,
            fontFamily,
            visible,
            selectable: false,
            hoverCursor: 'normal',
            left: textLeft,
            top: top
        });
        let teamObject = new fabric.Text("Team: " + team.toString(), {
            fontSize,
            fontFamily,
            visible,
            selectable: false,
            hoverCursor: 'normal',
            left: textLeft,
            top: top + textVerticalDistance
        });
        let playerObject = new fabric.Text("Player: " + player.toString(), {
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
            id,
            name,
            team,
            player,
            dirty: false,       // dirty flag to keep track of which bBoxes have been changed so that only dirty BBoxes have to be sent to/updated in the Backend
            selected: false,
            idOrNameObject,
            teamObject,
            playerObject,
            setLabelVisibility: (vis) => {  //vis is boolean value
                bBox.my.idOrNameObject.set('visible', vis);
                bBox.my.teamObject.set('visible', vis);
                bBox.my.playerObject.set('visible', vis);}
        };





        // bBox.cornerSize = Math.min(bBox.width, bBox.height) / ... // Dynamically change corner size so they are more visible on bigger BBoxes? Probably do not do it


        bBox.on({
            'selected': () => {
                this.selectBBox(bBox.my.id);
            },
            'mouseover': () => {
                console.log("MOUSEOVER");
                if(["selected", "hover"].includes(this.state.labelVisibility)) {
                    this.showLabels(bBox);
                }
            }
        });


        bBox.on({
            'deselected': () => {
                this.deselectBBox(id);
            },
            'mouseout': this.maybeHideLabels.bind(this, bBox)
        });

        let updateTextLocationAccordingToBBox = (options) => {
            // console.log("Box is moving");
            // console.log(options);



            let textLeft = bBox.left + bBox.width * bBox.scaleX + textHorizontalOffset;
            bBox.my.idOrNameObject.set('left', textLeft);
            bBox.my.teamObject.set('left', textLeft);
            bBox.my.playerObject.set('left', textLeft);

            bBox.my.idOrNameObject.set('top', bBox.top).setCoords();
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
                bBox.my.idOrNameObject.setCoords();
                bBox.my.teamObject.setCoords();
                bBox.my.playerObject.setCoords();

                // Set dirty flag
                bBox.my.dirty = true;
            }
        });


        // this.setState({canvas: this.state.canvas.add(bBox, id, team, player)});
        // this.setState({canvas: this.state.canvas.add(group)});

        this.canvas.add(bBox, bBox.my.idOrNameObject, bBox.my.teamObject, bBox.my.playerObject);

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

    blink = (bBox) => {
        // TODO maybe make more visible? Add bigger version of bBox and let it shrink to real bBox?
        let originalColor = bBox.fill;
        let repeats = 3;
        let time = 0;
        let interval = 400;
        let blinkColor = 'rgb(255, 255, 255)';
        for(let i = repeats; i > 0; i--) {
            setTimeout(() => {
                bBox.set({
                    fill: blinkColor,
                    cornerColor: blinkColor,
                    stroke: blinkColor
                });
                this.canvas.renderAll();
            }, time);

            time += interval;
            setTimeout(() => {
                bBox.set({
                    fill: originalColor,
                    cornerColor: originalColor,
                    stroke: originalColor
                });
                this.canvas.renderAll();
            }, time);
            time += interval;
        }
    }
}




TrackingEditor.propTypes = {
    video: PropTypes.string.isRequired, //make required
    currentFrame: PropTypes.number
};

TrackingEditor.defaultProps = {
    video: "Demo",
    currentFrame: 1
};

export default TrackingEditor;