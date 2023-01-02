import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';

import dataBarchart1 from "../../../data/analysis_distance_barchart_Teams_1_2.json";
import dataBarchart2 from "../../../data/analysis_distance_barchart_groupByTeams_Teams_1_2.json";
import dataNewTile from "../../../data/analysis_new_tile_selections_1.json";
import BarChart from "./BarChart";
import TileTypeSelector from "./TileTypeSelector";
import Heatmap from "./Heatmap";
import "./Analysis.css";

import {ReactComponent as Delete} from "../../../icons/delete.svg";
import IconButton from "@material-ui/core/IconButton";
import {faTrash, faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import tracking from "../../../data/tracking_data.json";       // TODO BACKEND delete this again once Backend is implemented

class AnalysisTile extends Component {

    state = {
        data: undefined
    }

    // for testing without backend
    annotations;
    teams;

    constructor(props) {
        super(props);
        this.annotations = tracking.annotations;
        this.teams = tracking.categories;
    }

    componentDidMount() {
        if(this.props.type === "new")
            // TODO BACKEND
            // let data = BACKEND.getNewTileSelectionOptions(this.props.gameId);
            this.setState({data: dataNewTile.data});
        if(this.props.type === "notes") {
            // editText is currently working in a uncontrolled fashion and is therefore not using the state
            // this.setState({data: this.props?.notes});
        }
        if(this.props.type === "heatmap") {
            // TODO BACKEND
            // let positionData, teams, categoryColors, originalImageDimensions = BACKEND.getAnalysisData(this.props.gameId, this.props.type, this.props.groupByTeams, this.props.Teams, this.props.Players);
            // should return position data either aggregated for teams (format the same way as for 2 players, player names are team names) or for players, in both cases filtered so only data for requested teams/players is returned
            let positionData = this.getAnnotationsForFrames(this.annotations, 1, 100);
            let teams = this.teams;
            let categoryColors = {
                1: 'rgb(100, 0, 0)',
                2: 'rgb(0, 0, 200)',
                3: 'rgb(0, 250, 0)',
                4: 'rgb(100, 0, 100)'
            }
            let originalImageDimensions = {
                x: 3840,
                y: 2160
            }
            let scalingFactor = 8;  // might make sense to set this depending on the originalImageDimension, maybe so that canvasWidth is always (roughly) the same
            let data = {
                positionData,
                teams,
                categoryColors,
                canvasWidth: originalImageDimensions.x/scalingFactor,
                canvasHeight: originalImageDimensions.y/scalingFactor,
                scalingFactor
            };
            this.setState({data: data});
        }
        else {
            // TODO BACKEND
            // let data = BACKEND.getAnalysisData(this.props.gameId, this.props.type, this.props.groupByTeams, this.props.Teams, this.props.Players);

            if (this.props.tileId === 0) {
                this.setState({data: dataBarchart1.data});
            }
            if (this.props.tileId === 1) {
                this.setState({data: dataBarchart2.data});
            }
            if (this.props.tileId === 2) {
                this.setState({data: dataBarchart2.data});
            }
        }
    }

    // just copy-pasted from TrackingEditor.js to get data without backend
    getAnnotationsForFrames = (annotations, firstFrame, lastFrame) => {
        // TODO BACKEND
        // return BACKEND.getAnnotations(gameId, firstFrame, lastFrame);

        console.log(annotations);
        let firstAnnotation = annotations.findIndex(element => element.image_id == firstFrame);
        console.log("first Annotation: " + firstAnnotation);
        let lastAnnotation = annotations.findIndex(element => element.image_id == lastFrame + 1);
        console.log("last Annotation: " + lastAnnotation);

        let cachedAnnotations = annotations.slice(firstAnnotation, lastAnnotation);
        console.log(cachedAnnotations);
        return cachedAnnotations;
    }

    changeTile = (changes) => {
        this.props.changeTile(changes);
    }

    handleChangeNotes = (obj) => {
        this.changeTile({notes: obj.value});
    }

    selectTileType = (changes) => {
        this.setState({data: undefined});
        this.changeTile(changes)
    }

    delete = () => {
        this.changeTile({type: "delete"});
    }

    // shiftRight is true means tile should move one spot to the right, false makes it moves to the left
    changeOrder = (shiftRight) => {
        let shift = shiftRight?"shift-right":"shift-left";
        this.changeTile({type: shift});
    }

    shiftRight = () => {
        this.changeOrder(true);
    }

    shiftLeft = () => {
        this.changeOrder(false);
    }

    saveState = (state) => {
        this.props.changeTile({stateVariables: state});
    }

    render() {
        let chart;
        let headingText;
        if(this.state.data || this.props.type === "new" || this.props.type === "notes") {
            switch (this.props.type) {
                case "distance-barchart":
                    // TODO BACKEND maybe get team colors assigned to team from backend and pass them here so colors in chart match team colors?
                    chart = <BarChart data={this.state.data} groupByTeams={this.props.groupByTeams} tileId={this.props.tileId}/>;
                    headingText = "Distance covered";
                    break;
                case "heatmap":
                    // TODO BACKEND maybe get team colors assigned to team from backend and pass them here so colors in chart match team colors?
                    headingText = (this.props.groupByTeams?"Team":"Player") + " Position Heatmap";
                    chart = <Heatmap
                        positionData={this.state.data.positionData}
                        teams={this.state.data.teams}
                        categoryColors={this.state.data.categoryColors}
                        canvasWidth={this.state.data.canvasWidth}
                        canvasHeight={this.state.data.canvasHeight}
                        scalingFactor={this.state.data.scalingFactor}
                        stateVariables={this.props.tileState}
                        saveState={this.saveState}
                    />
                    break;
                case "new":
                    headingText = "Select Type of Chart";
                    chart = <TileTypeSelector data={this.state.data} selectTileType={this.selectTileType}/>;
                    break;
                case "notes":
                    headingText = "Notes";
                    chart = <div>
                        <EditTextarea
                            className="NotesEditTextarea"
                            rows={20}
                            style={{ paddingTop: 0, width: "535px", height: "535px", margin: "15px"}}
                            defaultValue={this.props?.notes}
                            placeholder='Enter your notes here'
                            onSave={this.handleChangeNotes}
                        />
                    </div>;
                break;
            }
        }

        return (
            <div className="AnalysisTile">
                <div className="AnalysisTileHeadingContainer">
                    <div></div>     {/*dummy element to center heading*/}
                    <h1 className="AnalysisTileHeading">{headingText}</h1>
                    <div className="AnalysisTileButtonContainer">
                        <IconButton size="medium" className={"AnalysisTileButton"} onClick={this.shiftLeft} aria-label="shift tile to the left">
                            <FontAwesomeIcon className="ButtonIcon" icon={faChevronLeft} />
                        </IconButton>
                        <IconButton size="medium" className={"AnalysisTileButton"} onClick={this.delete} aria-label="delete tile">
                            <FontAwesomeIcon className="ButtonIcon" icon={faTrash} />
                        </IconButton>
                        <IconButton size="medium" className={"AnalysisTileButton right"} onClick={this.shiftRight} aria-label="shift tile to the right">
                            <FontAwesomeIcon className="ButtonIcon" icon={faChevronLeft} flip="horizontal" />
                        </IconButton>
                    </div>
                </div>
                {chart}
            </div>
        );
    }
}

AnalysisTile.propTypes = {
    gameId: PropTypes.number.isRequired,
    tileId: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    groupByTeams: PropTypes.bool,
    teams: PropTypes.arrayOf(PropTypes.number),
    players: PropTypes.arrayOf(PropTypes.number),
    notes: PropTypes.string,
    changeTile: PropTypes.func.isRequired,
    tileState: PropTypes.object,
};

export default AnalysisTile;
