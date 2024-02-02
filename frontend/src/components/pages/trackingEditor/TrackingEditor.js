import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { fabric } from "fabric";
import "./TrackingEditor.css";

// import pic from "../../../data/frame_000000.jpg";
import tracking from "../../../data/tracking_data.json";
import cornerfile from "../../../data/corners.json";
import NavBar from "./NavBar";
import TrackList from "./TrackList";
import TrackListItemAdd from "./TrackListItemAdd";
import TrackListItemPlayer from "./TrackListItemPlayer";
import TrackListItemGroup from "./TrackListItemGroup";
import TrackListItemCorner from "./TrackListItemCorner";

require("require-context/register");

class TrackingEditor extends Component {
  cacheSize = 5; // TODO BACKEND experiment with this to check performance and set to best size
  demoFrameSource = "../../../data/";
  framesCache = [];
  annotationsCache = [];
  cornersCache = [];
  canvasElementsPlayers = [];
  canvasElementsCorners = [];

  canvas = undefined;
  demoImages = require.context("../../../data/", false, /.*/); // /.*/ is a regex that matches everything
  id = -1;
  pic = {};

  state = {
    dummy: true, // dummy property that is used to trigger rerenders after state change whenever desired
    // canvas: undefined,
    demo: undefined, // whether to use the demo frames or a real, user uploaded video if a user is logged in
    // trackListElements: [],
    scalingFactor: undefined, // scaling factor for the video frames in order to match them to canvas size
    categories: [], // read in from annotations file now => BACKEND
    currentFrame: undefined, //BACKEND
    colorByCategory: true, //Toggle between coloring BBoxes by Category or Player => Maybe BACKEND if this is supposed to be persistent after reloading of the app (not really necessary in my opinion but might be nice for users)
    colorCategoryNumber: 1, // for enabling multiple categories; which category to color the BBoxes by if colorByCategory is true;
    category_1_Colors: {
      //BACKEND
      1: "rgb(100, 0, 0)",
      2: "rgb(0, 0, 200)",
      3: "rgb(0, 250, 0)",
      4: "rgb(100, 0, 100)",
    },
    cornerColor: "green",
    playerColors: {}, //BACKEND; should contain entries in the form: id: color (maybe also add corners); so far the player colors are generated randomly
    idToName: {
      //BACKEND
      0: "Peter",
      1: "Max",
      20: "Florian",
    },
    labelVisibility: "selected", //selected, hover, always or never;   => BACKEND in case this should be persistent on reload of page
    activeGroup: undefined, //for TrackList -> Group Tab: Which trackListItemGroup is currently selected
    activeCorner: undefined, //for TrackList -> Corner Tab
  };

  constructor(props) {
    super(props);
    this.id = this.props.match.params.id;

    // if(!this.state.demo) {
    // TODO BACKEND load images and save in pic[framenumber], or implement some kind of cache depending on how fast/slow loading would be
    // maybe just save image name and load each image?
    //}
    // else {
    for (let i = 0; i < 11; i++) {
      let filename = "./" + this.getDemoFrameFilename(i);
      this.pic[i] = this.demoImages(filename).default; //require("../../../data/frame_000000.jpg");
    }
    //}
  }

  componentDidMount() {
    // delete fabric's rotation control from Controls object so it is disabled for all elements
    // alternatively use fabric.Object.setControlsVisibility for per-object control
    delete fabric.Object.prototype.controls.mtr;

    // disable object caching during scaling => borders of BBoxes stay the same thickness during resizing of them.
    // this probably requires more computation but should be completely fine.
    fabric.Object.prototype.noScaleCache = false;

    let currentFrameNumber = this.props.startFrame;

    //compute how many frames before and after the current frame should be cached
    let cacheSizeBefore = Math.floor((this.cacheSize - 1) / 2);
    let cacheSizeBehind = Math.ceil((this.cacheSize - 1) / 2);

    //adjust cache size in case there do not exist enough prior frames
    while (currentFrameNumber < cacheSizeBefore + 1) {
      // +1 to adapt for frames starting at 1, not 0
      cacheSizeBefore -= 1;
      cacheSizeBehind += 1;
    }

    // load video frames to cache (not working right now, probably because of require, just sticking to 1 frame for now)
    for (
      let i = currentFrameNumber - cacheSizeBefore;
      i <= currentFrameNumber + cacheSizeBehind;
      i++
    ) {
      // // if this code is reused, check if frame is already cached before loading it
      // let framePath = this.getDemoFramePath(i);
      // let currentFrame = require(framePath);     //probably/maybe bad to use import here, but will be changed once API is there anyways
      // this.framesCache.push({index: i, data: currentFrame});
    }

    // console.log(tracking);

    // TODO BACKEND wrap all data fetching in if(this.state.demo) block and keep existing code for demo if Demo should stay in the website

    //load categories and annotations

    // TODO BACKEND categories = loadCategories(this.id);
    let categories = tracking.categories;

    //load annotations TODO BACKEND annotations = loadAnnotations(this.id);
    let annotations = tracking.annotations;
    // console.log("annotations: ");
    // console.log(annotations);
    console.log("currentFrameNumber: " + currentFrameNumber);
    console.log("cacheSizeBefore: " + cacheSizeBefore);
    let firstCachedFrame = currentFrameNumber - cacheSizeBefore;
    let lastCachedFrame = currentFrameNumber + cacheSizeBehind;
    this.annotationsCache = this.getAnnotationsForFrames(
      annotations,
      firstCachedFrame,
      lastCachedFrame,
    );

    // randomly generate player colors (they will just come from the backend in the future
    let playerColors = {};
    for (let i = 0; i < 50; i++) {
      // randomly using 50 as a big number
      let r = Math.floor(Math.random() * 255);
      let g = Math.floor(Math.random() * 255);
      let b = Math.floor(Math.random() * 255);
      playerColors[i] = `rgb(${r}, ${g}, ${b})`;
    }

    //load corners
    // TODO BACKEND corners = BACKEND.loadCorners(this.id);
    let corners = cornerfile.corners;
    this.cornersCache = this.getAnnotationsForFrames(
      corners,
      firstCachedFrame,
      lastCachedFrame,
    );

    // console.log("finished filtering and caching annotations!");

    // Setup Canvas and Fabric
    let canvas = new fabric.Canvas("tracking-editor-canvas");
    let scalingFactor = 0;

    //THIS SHOULD BE DONE WHENEVER NEW VIDEO IS USED (then just keep scaling factor or handle it in backend to make sure all images are same size?)
    //compute scaling factor for image to fit into fixed size canvas (only using width to keep picture ratio)

    let img = new Image();
    img.src = this.pic[currentFrameNumber];
    // let img = new fabric.Image.fromURL(framePath, image => {
    //     scalingFactor = image.width;
    //     this.setState({scalingFactor: scalingFactor});
    //     // canvas.setBackgroundImage(pic, canvas.renderAll.bind(canvas), {scaleX: scalingFactor, scaleY: scalingFactor});
    //     image.scale(0.3);
    //     canvas.add(image);
    //     canvas.renderAll();
    // });

    // scalingFactor = canvas.getWidth() / img.width;    //img.width is 0 before refreshing the page.
    img.onload = () => {
      scalingFactor = canvas.getWidth() / img.width;
      canvas.setBackgroundImage(
        this.pic[currentFrameNumber],
        canvas.renderAll.bind(canvas),
        { scaleX: scalingFactor, scaleY: scalingFactor },
      );
      // canvas.setHeight(img.height * scalingFactor);
      this.canvas = canvas;
      this.setState(
        {
          demo: this.props.demo,
          currentFrame: currentFrameNumber,
          scalingFactor: scalingFactor,
          categories: categories,
          playerColors,
        },
        () => {
          this.plotBBoxes();
          this.plotCorners();
          this.setState({ dummy: !this.state.dummy });
        },
      );
    };

    // this.canvas = canvas;
    // this.setState({demo: this.props.demo, currentFrame: currentFrameNumber, scalingFactor: scalingFactor, categories: categories, playerColors},
    //     () => {this.plotBBoxes(); this.plotCorners(); this.setState({dummy: !this.state.dummy})});
    // calling setState twice is necessary here because the plotBBoxes function relies on some info about the state
    // the same is done in ComponentDidUpdate, causing rerenders; maybe plotBBoxes could be rewritten but then it would be easier to introduce bugs that violate data consistency with state?
    // The problem could be circumvented by following the functional paradigm of react better and making the canvas a separate component but I believe this does not work that well with fabric and leads to other problems/strange app design
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentFrame != this.state.currentFrame) {
      // if using cache: take prevState.currentFrame - this.state.currentFrame and adjust Cache accordingly
    }
  }

  getDemoFramePath(i) {
    return this.demoFrameSource + this.getDemoFrameFilename(i);
  }

  getDemoFrameFilename(i) {
    return "frame_" + i.toString().padStart(6, "0") + ".jpg";
  }

  // assumes that annotations array is ordered by increasing frame number (image_id)
  // lastFrame is included
  getAnnotationsForFrames = (annotations, firstFrame, lastFrame) => {
    // TODO BACKEND
    // return BACKEND.getAnnotations(gameId, firstFrame, lastFrame);

    console.log("getAnnotationsForFrames() annotations : ", annotations);

    let firstAnnotation = annotations.findIndex(
      (element) => element.image_id == firstFrame,
    );
    let lastAnnotation = annotations.findIndex(
      (element) => element.image_id == lastFrame + 1,
    );

    if (firstAnnotation === -1) {
      console.warn(
        "Annotation (either player positions or corners) for frame " +
          firstFrame +
          " not found!",
      );
      return [];
    }
    let cachedAnnotations =
      lastAnnotation === -1
        ? annotations.slice(firstAnnotation)
        : annotations.slice(firstAnnotation, lastAnnotation); // using just annotations.slice(firstAnnotation, lastAnnotation)  would mean last element of annotation is not included for lastAnnotation === -1 which is not intended because it means all elements after firstAnnotation need to be returned.
    return cachedAnnotations;
  };

  plotBBoxes = () => {
    let annotationsCurrentFrame = this.getAnnotationsForFrames(
      tracking.annotations,
      this.state.currentFrame,
      this.state.currentFrame,
    );
    console.log(
      "plotBBoxes() received annotations : ",
      annotationsCurrentFrame,
    );
    console.log(tracking.annotations);
    console.log(annotationsCurrentFrame);
    let newCanvasElements = [];
    for (let i = 0; i < annotationsCurrentFrame.length; i++) {
      newCanvasElements.push(this.createNewBBox(annotationsCurrentFrame[i]));
    }

    this.canvasElementsPlayers =
      this.canvasElementsPlayers.concat(newCanvasElements); // concat does not mutate the original array
    // instead of the following in order to not trigger endless rerender!
    // this.setState({
    //     canvasElementsPlayers: this.state.canvasElementsPlayers.concat(newCanvasElements)      // concat does not mutate the original array
    //     // , trackListElements: this.state.trackListElements.concat(newTrackListItems)
    // });//, () => this.render);
  };

  plotCorners = () => {
    let cornersCurrentFrame = this.getAnnotationsForFrames(
      cornerfile.corners,
      this.state.currentFrame,
      this.state.currentFrame,
    );
    let newCornerElements = [];
    for (let i = 0; i < cornersCurrentFrame.length; i++) {
      newCornerElements.push(this.createNewCorner(cornersCurrentFrame[i]));
    }
    this.canvasElementsCorners =
      this.canvasElementsCorners.concat(newCornerElements);
  };

  // parameter (undo) to distinguish between undo (true) and redo (false); Currying so that function for onClick is returned after passing parameter
  undoRedo = (undo) => () => {
    if (undo) {
      console.log("Undo");
      // TODO Backend
      // probably the backend should keep track of operations and return exactly what to undo/redo?
    } else {
      console.log("Redo");
      // TODO Backend
    }
  };

  // // Function to be passed to NavBar, currentFrame is only used for initialization and then NavBar manages the frame number
  // // Using a function this way instead of passing a prop directly should make NavBar not remount every time the Frame changes
  // getFrame = (i) => {
  //     let ret = this.framesCache.find(element => element.index = i);
  //     if(ret === undefined) {
  //         console.warn("tried to get Frame " + i + ", but that frame is not yet loaded into TrackingEditor.framesCache");
  //     }
  //     return ret;
  // }

  // parameter check is already done in NavBar so this function expects a valid value for i
  switchFrame = (i) => {
    //TODO BACKEND call backend and delete the following hardcoded numbers in if clause (they are because there are only so many sample images here)
    if (i < 0 || i > 10) {
      console.warn("frame number invalid: " + i);
      return;
    }

    // clear canvas and save changes to Backend

    // this should work according to https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing but does not
    // there seems to be no function to just clear the canvas...
    // const context = this.canvas.getContext('2d');
    // context.clearRect(0, 0, this.canvas.width, this.canvas.height); //Might have to be adapted when/if using zoom, see https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
    // context.beginPath();

    // this works but is a bit brute-force...
    this.canvasElementsPlayers.forEach((e) => {
      if (e?.my?.dirty) {
        // TODO BACKEND post changes to backend (only for position and size, the rest should be done directly in the respective functions, e.g. changing names, teams, etc.)
      }
      this.canvas.remove(e);
      if (e?.my) {
        this.canvas.remove(e.my.bBoxIdObject);
        this.canvas.remove(e.my.teamObject);
        this.canvas.remove(e.my.playerIdOrNameObject);
      }
    });

    this.canvasElementsCorners.forEach((e) => {
      this.canvas.remove(e);
      if (e?.my?.dirty) {
        // TODO BACKEND post changes to backend
      }
    });

    this.canvasElementsPlayers = [];
    this.canvasElementsCorners = [];

    // add new content to canvas
    let img = new Image();
    img.src = this.pic[this.state.currentFrame];
    let scalingFactor = this.canvas.getWidth() / img.width;
    // in order to trigger update after bBoxes are created setState is called another time as callback; see comment in ComponentDidMount
    this.setState({ currentFrame: i }, () => {
      this.plotBBoxes();
      this.plotCorners();
      this.setState({ dummy: !this.state.dummy });
    });
    img.onload = () => {
      this.canvas.setBackgroundImage(
        this.pic[this.state.currentFrame],
        this.canvas.renderAll.bind(this.canvas),
        { scaleX: scalingFactor, scaleY: scalingFactor },
      );
      this.canvas.renderAll();
    };
  };

  generateBBoxFillColor = (color) =>
    new fabric.Color(color).setAlpha(0.4).toRgba();

  getColor = (categoryId, trackId, colorByCategory) => {
    let color;
    if (colorByCategory) {
      color = this.getCategoryColor(categoryId);
    } else {
      color = this.state.playerColors[trackId];
    }
    return color;
  };

  // TODO BACKEND NOTE: With this implementation, backend should make sure that there is always a color defined. If it is undefined, it could just return e.g. white
  getCategoryColor = (categoryId) => {
    let categoryColorDict = `category_${this.state.colorCategoryNumber}_Colors`;
    return this.state[categoryColorDict][categoryId];
  };

  handleSwitchColorByCategory = (colorByCategory) => {
    this.canvasElementsPlayers.forEach((bBox) => {
      let color = this.getColor(bBox.my.team, bBox.my.player, colorByCategory);
      bBox.my.color = color;
      bBox.set("cornerColor", color);
      bBox.set("stroke", color);
      bBox.set("fill", this.generateBBoxFillColor(color));
    });
    this.canvas.renderAll();
    this.setState({ colorByCategory: colorByCategory });
  };

  getTeams = () => {
    return this.state.categories;
  };

  getTeamName = (teamID) => {
    let teams = this.getTeams();
    let currentTeam = teams.find((t) => t.id == teamID);
    if (currentTeam && currentTeam.name) return currentTeam.name;
    else {
      // This might be normal behaviour depending on the design of the backend. The code can handle teams without names.
      console.warn("Team " + teamID + "does not have a name assigned!");
      return undefined;
    }
  };

  setTeam = (bBox, teamID) => {
    bBox.my.team = teamID;
    // TODO BACKEND call backend (something like BACKEND.teamChange(bBox.my.player, teamID)
    this.setState({ dummy: !this.state.dummy });
  };

  // set Name of player
  setName = (bBox, name) => {
    fabric.Object.prototype.objectCaching = false;
    // console.log("setting name of " + bBox.my.player + " to " + name);
    bBox.my.name = name;
    bBox.my.playerIdOrNameObject.set("text", "Name: " + name);
    this.canvas.requestRenderAll();
    //bBox.my.playerIdOrNameObject.visible = false;
    // TODO BACKEND call backend to update name
    // let updatedIdToName = {...this.state.idToName};
    this.setState(
      (
        state, // ({idToName: ({...state.idToName}[bBox.my.player] = name)}) //did not work like this, instead set idToName to name (not sure why)
      ) => {
        let updatedIdToName = { ...state.idToName };
        updatedIdToName[bBox.my.player] = name;
        return { idToName: updatedIdToName };
      },
    );
  };

  setTeamName = (teamId, name) => {
    // TODO BACKEND call backend to update team name
    this.setState((state) => ({
      categories: state.categories.map((category) =>
        category.id == teamId ? { ...category, name: name } : category,
      ),
    }));
  };

  // returns a list with elements {id: id, name: name or undefined} for each player; playerName is undefined if player was not given a name
  getPlayers = () => {
    let players = this.canvasElementsPlayers.map((bBox) => ({
      id: bBox.my.player,
      name: bBox.my.name,
    }));
    return players;
  };

  swap = (player1Id, player2Id) => {
    // TODO BACKEND
    // BACKEND.swapPlayers(player1Id, player2Id);
    // setState function (modifying dummy like following line) has to be called once change took effect in backend so that new, changed data is loaded
    // this.setState({dummy: !this.state.dummy});

    // TODO BACKEND the following function call can be deleted, it is just used for testing/creating some effect upon calling swap
    // therefore, it also only modifies one element instead of doing both and properly swapping elements
    setTimeout(() => {
      // using a timeout to give the loading animation some time to be displayed
      this.canvasElementsPlayers.map((bBox) => {
        if (bBox.my.player === player1Id) {
          bBox.my.player = player2Id;
          bBox.my.name = "CHANGED!";
        }
        return bBox;
      });
      this.setState({ dummy: !this.state.dummy });
    }, 1000);
  };

  setLabelVisibility = (visibility) => {
    let hideOrShowLabels = () => {
      console.log("Entered function hideOrShowLabels");
      this.canvasElementsPlayers.forEach((bBox) => {
        let vis = visibility === "always" ? true : false;
        if (visibility === "selected" && bBox.my.selected) {
          vis = true;
        }
        bBox.my.playerIdOrNameObject.set("visible", vis);
        bBox.my.teamObject.set("visible", vis);
        bBox.my.bBoxIdObject.set("visible", vis);
        this.canvas.requestRenderAll(); //otherwise it is just updated when clicking somewhere
      });
    };

    if (!["always", "selected", "hover", "never"].includes(visibility)) {
      console.warn("ERROR: incorrect visibility parameter!");
    } else this.setState({ labelVisibility: visibility }, hideOrShowLabels);
  };

  render = () => {
    let runningIndex = 0; // runningIndex is used for list key instead of player/corner/group Id because TrackListItemAdd is the first element and needs a unique key too
    let propsTracklist = {
      players: [
        <TrackListItemAdd
          key={runningIndex}
          add={this.add("player")}
          blink={this.blink}
        />,
      ],
      corners: [
        <TrackListItemAdd key={runningIndex} add={this.add("corner")} />,
      ],
      groups: [<TrackListItemAdd key={runningIndex} add={this.add("group")} />],
    };
    runningIndex++;
    let resetRunningIndex = runningIndex;
    // let groupIds = [];
    let canvasWidth = this.canvas?.getWidth(); // ?. is conditional chaining, returns undefined if this.canvas is undefined
    this.canvasElementsPlayers.forEach((bBox) => {
      propsTracklist.players = propsTracklist.players.concat([
        <TrackListItemPlayer
          key={runningIndex++}
          bBox={bBox}
          changeSelection={this.changeSelection}
          setName={this.setName}
          blink={this.blink}
          getTeams={this.getTeams}
          setTeam={this.setTeam}
          delete={this.deletePlayer}
          getSwapMenuEntries={this.getPlayers}
          swap={this.swap}
        />,
      ]);

      // // is now done below, this version extracts all the teams from the bBoxes, it also works on tracking files that do not provide a category Object with a summary of all categories.
      // let group = bBox.my.team;
      // if(!(groupIds.includes(group))) {
      //     propsTracklist.groups = propsTracklist.groups.concat([<TrackListItemGroup id={group}
      //                                                                               activeGroup={this.state.activeGroup}
      //                                                                               changeSelection={this.changeSelection}
      //                                                                               color={this.getCategoryColor(group)}
      //                                                                               delete={undefined}/>]);
      //     groupIds = groupIds.concat([group]);
      // }
    });

    runningIndex = resetRunningIndex;
    this.canvasElementsCorners.forEach((corner) => {
      propsTracklist.corners = propsTracklist.corners.concat([
        <TrackListItemCorner
          key={runningIndex++}
          id={corner.my.id}
          activeCorner={this.state.activeCorner}
          changeSelection={this.changeSelection}
          delete={this.deleteCorner}
        />,
      ]);
    });

    runningIndex = resetRunningIndex;
    this.state.categories.forEach((category) => {
      propsTracklist.groups = propsTracklist.groups.concat([
        <TrackListItemGroup
          key={runningIndex++}
          id={category.id}
          name={category.name}
          setName={this.setTeamName}
          activeGroup={this.state.activeGroup}
          changeSelection={this.changeSelection}
          color={this.getCategoryColor(category.id)}
          delete={this.deleteGroup}
        />,
      ]);
    });

    return (
      <div className="TrackingEditor">
        <NavBar
          undoRedo={this.undoRedo}
          switchFrame={this.switchFrame}
          currentFrame={this.state.currentFrame}
          colorByCategory={this.state.colorByCategory}
          handleSwitchColorByCategory={this.handleSwitchColorByCategory}
          labelVisibility={this.state.labelVisibility}
          setLabelVisibility={this.setLabelVisibility}
          maxFrame={10}
          width={canvasWidth}
        />{" "}
        {/*TODO BACKEND: pass correct maxFrame*/}
        <canvas id="tracking-editor-canvas" width="1440" height="810"></canvas>
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

  testButton = () => {
    this.selectBBox(20);
  };

  hideLabels = (bBox) => {
    bBox.my.setLabelVisibility(false);
    this.canvas.requestRenderAll(); //otherwise it is just updated when clicking somewhere
  };

  maybeHideLabels = (bBox) => {
    // if labelVisibility is hover, the label should always be hidden when this function is called
    if (
      (this.state.labelVisibility === "selected" && !bBox.my.selected) ||
      this.state.labelVisibility === "hover"
    )
      this.hideLabels(bBox);
  };

  showLabels = (bBox) => {
    bBox.my.setLabelVisibility(true);
    this.canvas.requestRenderAll();
  };

  maybeShowLabels = (bBox) => {
    if (this.state.labelVisibility === "selected") {
      this.showLabels(bBox);
    }
  };

  // Automatically deselects all other selected boxes
  selectBBox = (id) => {
    let activeGroup;
    this.canvasElementsPlayers.forEach((bBox) => {
      if (bBox.my.id == id) {
        let bBoxDeepCopy = bBox; // the cleaner/correcter version would be to do a deep clone as indicated (but not done) here. JS does not really have a deep clone functionality.
        activeGroup = bBox.my.team;
        if (
          this.canvas.getActiveObject()?.my?.id !== bBoxDeepCopy.my.id ||
          this.canvas.getActiveObject()?.my?.player === undefined
        ) {
          // 1st: comparison by reference which is intended in this case; 2nd condition: To catch the case that active Object is e.g. corner which might have the same id
          this.canvas.setActiveObject(bBoxDeepCopy); //necessary so that canvas behaves as expected, e.g. clicking in empty spot clears selection
        }
        bBoxDeepCopy.my.selected = true;
        this.maybeShowLabels(bBoxDeepCopy);
        return bBoxDeepCopy;
      } else {
        if (bBox.my.selected) {
          //old selection => deselect (not necessary when selecting next box in canvas and in that case this if clause will not be active since the box is already not selected anymore, but necessary when selecting next box in tracklist
          bBox.my.selected = false;
          this.maybeHideLabels(bBox);
        }
        return bBox;
      }
    });

    this.setState({ dummy: !this.state.dummy, activeGroup }); // triggers rerender with dummy so that Tracklist etc updates

    // this.forceUpdate();      //Alternative to setting dummy state like above
  };

  selectCorner = (id) => {
    if (this.canvas.getActiveObject()?.my?.id != id) {
      this.canvasElementsCorners.forEach((corner) => {
        if (corner.my.id == id) {
          this.canvas.setActiveObject(corner);
          return corner;
        }
      });
      this.selectBBox(undefined); // to deselect all BBoxes
    }
    this.canvas.requestRenderAll();
    this.setState({ activeCorner: id }); // setState for BBoxes is already handled in selectBBox
  };

  deselectCorner = (id) => {
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.setState({ activeCorner: undefined });
  };

  deselectBBox = (id) => {
    let activeGroup = undefined;
    this.canvasElementsPlayers.forEach((bBox) => {
      if (bBox.my.id == id) {
        //comments from selectBBox about deep clone also apply here!
        bBox.my.selected = false;
        this.canvas.discardActiveObject();
        //this.setState({dummy: !this.state.dummy});
        this.maybeHideLabels(bBox);
      }
    });
    this.setState({ dummy: !this.state.dummy, activeGroup }); // triggers rerender so that Tracklist etc updates
  };

  changeSelection = (type, id, deselect) => {
    switch (type) {
      case "player":
        if (deselect) this.deselectBBox(id);
        else this.selectBBox(id);
        break;
      case "corner":
        if (deselect) this.deselectCorner(id);
        else this.selectCorner(id);
        break;
      case "group":
        if (deselect) this.setState({ activeGroup: undefined });
        else this.setState({ activeGroup: id });
        break;
      default:
        console.warn("Invalid type argument: " + type);
    }
  };

  createNewCorner = (args) => {
    let x = args.location[0] * this.state.scalingFactor;
    let y = args.location[1] * this.state.scalingFactor;
    let color = this.state.cornerColor;
    let id = args.id;

    let cornerObject = new fabric.Circle({
      radius: 5,
      originX: "center",
      originY: "center",
      fill: color,
      left: x,
      top: y,
      cornerSize: 4,
      // stroke: color,
      hasBorders: true, // disables the control borders (the lines connecting the controls the show up when object is selected
      hasControls: false,
      padding: 0, // to make sure the pixel coordinates are correct
      cornerStyle: "circle",
      lockRotation: true,
    });

    cornerObject.my = {
      id,
      dirty: false,
      selected: false,
    };

    cornerObject.on({
      selected: () => {
        this.selectCorner(cornerObject.my.id);
      },
      deselected: () => {
        this.deselectCorner(cornerObject.my.id);
      },
      modified: function (e) {
        cornerObject.my.dirty = true;
      },
    });

    this.canvas.add(cornerObject);
    return cornerObject;
  };

  createNewBBox = (args) => {
    //get values for BBox position and color
    let left = args.bbox[0] * this.state.scalingFactor;
    let top = args.bbox[1] * this.state.scalingFactor;
    let width = args.bbox[2] * this.state.scalingFactor;
    let height = args.bbox[3] * this.state.scalingFactor;
    let color = this.getColor(
      args.category_id,
      args.attributes.track_id,
      this.state.colorByCategory,
    );

    // generate fill color which is regular color but more transparent
    let fill = this.generateBBoxFillColor(color);

    //get metadata for BBox
    let textHorizontalOffset = 5;
    let textLeft = left + width + textHorizontalOffset;
    let textVerticalDistance = 25;
    let fontSize = 20;
    let fontFamily = "Roboto";
    let visible = this.state.labelVisibility === "always" ? true : false;
    let id = args.id;
    let team = args.category_id;
    let teamName = this.getTeamName(team); // this might be undefined if there is no name for the team
    let player = args.attributes.track_id;
    let name =
      player in this.state.idToName ? this.state.idToName[player] : undefined;
    let idText = name ? "Name: " + name : "Player ID: " + player.toString();
    let playerIdOrNameObject = new fabric.Text(idText, {
      fontSize,
      fontFamily,
      visible,
      selectable: false,
      hoverCursor: "normal",
      left: textLeft,
      top: top,
    });
    let teamObject = new fabric.Text(
      "Team: " + (teamName ? teamName : team.toString()),
      {
        fontSize,
        fontFamily,
        visible,
        selectable: false,
        hoverCursor: "normal",
        left: textLeft,
        top: top + textVerticalDistance,
      },
    );
    let bBoxIdObject = new fabric.Text("Instance ID: " + args.id.toString(), {
      fontSize,
      fontFamily,
      visible,
      selectable: false,
      hoverCursor: "normal",
      left: textLeft,
      top: top + 2 * textVerticalDistance,
    });

    // add "text" property to cacheProperties so elements are redrawn when their text changes
    // (for example when a player name is changed the labels in the canvas would otherwise not update)
    playerIdOrNameObject.cacheProperties.push("text");
    teamObject.cacheProperties.push("text");
    bBoxIdObject.cacheProperties.push("text");

    let bBox = new fabric.Rect({
      left,
      top,
      fill,
      cornerColor: color,
      cornerSize: 4,
      stroke: color,
      hasBorders: false, // disables the control borders (the lines connecting the controls the show up when object is selected
      strokeWidth: 1,
      strokeUniform: true, // to keep the bounding box a consisten thickness, independent of its size
      width,
      height,
      padding: 0, // to make sure the pixel coordinates are correct
      cornerStyle: "circle",
      lockRotation: true,
    });

    // add Metadata and labels to bBox (using .my to not accidentally override attributes of the fabric Rect object
    bBox.my = {
      id,
      name,
      team,
      player,
      dirty: false, // dirty flag to keep track of which bBoxes have been changed so that only dirty BBoxes have to be sent to/updated in the Backend
      selected: false,
      playerIdOrNameObject,
      teamObject,
      bBoxIdObject,
      setLabelVisibility: (vis) => {
        //vis is boolean value
        bBox.my.playerIdOrNameObject.set("visible", vis);
        bBox.my.teamObject.set("visible", vis);
        bBox.my.bBoxIdObject.set("visible", vis);
      },
    };

    // bBox.cornerSize = Math.min(bBox.width, bBox.height) / ... // Dynamically change corner size so they are more visible on bigger BBoxes? Probably do not do it

    bBox.on({
      selected: () => {
        this.selectBBox(bBox.my.id);
      },
      mouseover: () => {
        if (["selected", "hover"].includes(this.state.labelVisibility)) {
          this.showLabels(bBox);
        }
      },
    });

    bBox.on({
      deselected: () => {
        this.deselectBBox(id);
      },
      mouseout: this.maybeHideLabels.bind(this, bBox),
    });

    let updateTextLocationAccordingToBBox = (options) => {
      let textLeft =
        bBox.left + bBox.width * bBox.scaleX + textHorizontalOffset;
      bBox.my.playerIdOrNameObject.set("left", textLeft);
      bBox.my.teamObject.set("left", textLeft);
      bBox.my.bBoxIdObject.set("left", textLeft);

      bBox.my.playerIdOrNameObject.set("top", bBox.top).setCoords();
      bBox.my.teamObject
        .set("top", bBox.top + textVerticalDistance)
        .setCoords();
      bBox.my.bBoxIdObject
        .set("top", bBox.top + 2 * textVerticalDistance)
        .setCoords();
    };

    bBox.on({
      moving: updateTextLocationAccordingToBBox,
      scaling: updateTextLocationAccordingToBBox,
    });

    // using modified event for stuff that is only necessary after modification is finished
    bBox.on({
      modified: function (e) {
        // Set new positions for labels and call setCoords so that canvas coordinates (aCoords) are updated to rendered coordinates (oCoords)
        // calling setCoords is not necessary because he labels cannot be selected anyways, it just keeps all their attributes consistent.
        bBox.my.playerIdOrNameObject.setCoords();
        bBox.my.teamObject.setCoords();
        bBox.my.bBoxIdObject.setCoords();

        // Set dirty flag
        bBox.my.dirty = true;
      },
    });

    // this.setState({canvas: this.state.canvas.add(bBox, id, team, player)});
    // this.setState({canvas: this.state.canvas.add(group)});

    console.log("BBox : ", bBox);

    this.canvas.add(
      bBox.my.playerIdOrNameObject,
      bBox.my.teamObject,
      bBox.my.bBoxIdObject,
      bBox,
    );
    this.canvas.renderAll();
    return bBox;
  };

  // // This function was just used for testing, it simply adds a rectangle to the canvas
  // addNewRect = () => {
  //
  //     let addNewRect2 = (state, props) => {
  //         let rect = new fabric.Rect({
  //             left: 100,
  //             top: 100,
  //             fill: 'rgba(0, 0, 0, 0)',
  //             stroke: this.state.cornerColor,
  //             strokeWidth: 5,
  //             width: 20,
  //             height: 20,
  //             padding: 0,  // to make sure the pixel coordinates are correct
  //             cornerStyle: 'circle',
  //             lockRotation: true
  //         });
  //
  //         rect.hasBorders = false;    // disables the control borders (the lines connecting the controls the show up when object is selected
  //         rect.strokeUniform = true;  // to keep the bounding box a consisten thickness, independent of its size
  //
  //         //Rect has properties aCoords (with coordinates for all 4 corners), width, heigth
  //
  //         let canvas = state.canvas;
  //
  //
  //         return {canvas: canvas.add(rect)};
  //     };
  //
  //     this.setState(addNewRect2);
  // }

  blink = (bBox) => {
    let originalColor = bBox.cornerColor;
    let originalFillColor = bBox.fill;
    let repeats = 3;
    let time = 0;
    let interval = 400;
    let blinkColor = "rgb(255, 255, 255)";

    if (originalColor !== blinkColor) {
      // necessary because otherwise bBox could permanently be set to blinkColor
      for (let i = repeats; i > 0; i--) {
        setTimeout(() => {
          bBox.set({
            fill: blinkColor,
            cornerColor: blinkColor,
            stroke: blinkColor,
          });
          this.canvas.renderAll();
        }, time);

        time += interval;
        setTimeout(() => {
          bBox.set({
            fill: originalFillColor,
            cornerColor: originalColor,
            stroke: originalColor,
          });
          this.canvas.renderAll();
        }, time);
        time += interval;
      }
    }
  };

  add = (itemType) => () => {
    switch (itemType) {
      case "player":
        // TODO BACKEND
        // let newPlayer = BACKEND.newItem(....);
        // necessary because backend needs to assign IDs etc.
        // Might make sense to reserve a "No Team yet" team for new or unassigned items
        // Also needs to add the player to the following (and maybe previous?) frames, maybe even by running detection algorithm with new initialisation from this bBox again?
        // Maybe Backend could even return a size for the bBox that is the average bBox size so user does not have to resize as much/often manually?
        let newPlayer = {
          attributes: { track_id: 1000 },
          bbox: [2200, 1000, 65, 65],
          category_id: 1, // needs to be initialized in a sensible manner from backend
          id: 1000,
          image_id: this.state.currentFrame,
        };
        let playerId = newPlayer.id;
        newPlayer = this.createNewBBox(newPlayer);
        this.canvasElementsPlayers.push(newPlayer);
        this.setState({ dummy: !this.state.dummy }, () => {
          this.selectBBox(playerId);
          this.blink(newPlayer);
        });
        break;
      case "corner":
        // TODO BACKEND
        // let newCorner = BACKEND.newItem(...);
        let newCorner = {
          id: this.canvasElementsCorners.length + 1,
          image_id: this.state.currentFrame,
          location: [2200, 1000],
        };
        let cornerId = newCorner.id;
        newCorner = this.createNewCorner(newCorner);
        this.canvasElementsCorners.push(newCorner);
        this.setState({ dummy: !this.state.dummy }, () => {
          this.selectCorner(cornerId);
          // does not blink because corners will likely not be used in the end; If they do it would be nice to have a blink function for corners.
        });
        break;
      case "group":
        // TODO BACKEND
        // let newGroup, color = BACKEND.newItem(...);
        let color = "rgb(0, 0, 0)";
        let newGroup = {
          id: 1000,
          name: "New Group",
        };
        let groupId = newGroup.id;
        this.setState((prevState) => {
          let colors = Object.assign(prevState.category_1_Colors);
          colors[newGroup.id] = color;
          return {
            categories: [...prevState.categories, newGroup],
            activeGroup: groupId,
            category_1_Colors: colors,
          };
        });
        break;
      default:
        console.warn("Passed invalid itemType, nothing is added!");
    }
  };

  deletePlayer = (bBox) => {
    // TODO BACKEND
    // BACKEND.deletePlayer(bBox.my.player);

    // remove from canvasElementsPlayers
    let stateUpdate = (state) => {
      // the following is done below this function now since canvasElementsPlayers is moved out of state
      // let canvasElementsPlayers = [...state.canvasElementsPlayers];
      // canvasElementsPlayers.splice(canvasElementsPlayers.indexOf(bBox), 1); // remove bBox
      // let stateModifier = {canvasElementsPlayers: canvasElementsPlayers};

      // canvasElementsPlayers moved out of state!
      let stateModifier = {};

      // remove from other dicts (name and color mapping)
      if (bBox.my.player in state.idToName) {
        let idToName = { ...state.idToName };
        delete idToName[bBox.my.player];
        stateModifier.idToName = idToName;
      }
      if (bBox.my.player in state.playerColors) {
        let playerColors = { ...state.playerColors };
        delete playerColors[bBox.my.player];
        stateModifier.playerColors = playerColors;
      }
      return stateModifier;
    };

    let index = this.canvasElementsPlayers.indexOf(bBox);
    this.canvasElementsPlayers.splice(index, 1); // remove bBox

    this.setState((prevState) => stateUpdate(prevState));

    this.canvas.remove(bBox.my.playerIdOrNameObject);
    this.canvas.remove(bBox.my.teamObject);
    this.canvas.remove(bBox.my.bBoxIdObject);
    this.canvas.remove(bBox);

    this.canvas.requestRenderAll();
  };

  deleteCorner = (id) => {
    // TODO BACKEND
    // BACKEND.deleteCorner(id);

    let index = this.canvasElementsCorners.findIndex(
      (corner) => corner.my.id == id,
    );
    this.canvas.remove(this.canvasElementsCorners[index]);
    this.canvas.requestRenderAll();

    this.canvasElementsCorners.splice(index, 1);
  };

  deleteGroup = (id) => {
    // TODO BACKEND
    // BACKEND.deleteGroup(id);     // Also need to assign a new/unassigned team to players that have assigned the team that is to be deleted

    // TODO BACKEND
    // might be better to just modify the dummy element and reload the categories from the backend because there might have to be a "unassigned" category assigned to all players that now do not have a team anymore
    // Also category colors etc are not handled here because they will be moved to the backend anyways.
    this.setState((prevState) => ({
      categories: [...prevState.categories].filter((group) => group.id != id),
    }));
  };
}

TrackingEditor.propTypes = {
  demo: PropTypes.bool.isRequired,
  startFrame: PropTypes.number,
};

// TrackingEditor.defaultProps = {
//     demo: false,
//     startFrame: 1
// };

export default withRouter(TrackingEditor);
