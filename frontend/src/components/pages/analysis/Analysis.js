import React, {Component} from 'react';
import {withRouter} from "react-router";
import AnalysisTile from "./AnalysisTile";
import "./Analysis.css";
import IconButton from "@material-ui/core/IconButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

class Analysis extends Component {

    id = -1;
    defaultAnalysisTiles = [
        // teams: considers players from all (undefined) or specific teams (team id)
        // players: same as teams
        // groupByTeams:
        {id: 0, type: "distance-barchart", groupByTeams: false, teams: [1, 2], players: undefined},
        {id: 1, type: "distance-barchart", groupByTeams: true, teams: undefined, players: undefined},
        {id: 2, type: "distance-barchart", groupByTeams: true, teams: undefined, players: undefined},
        {id: 3, type: "notes", notes: "As you can cleary see, the players of one of the team ran further doing the game."},
        {id: 4, type: "new"},
        {id: 5, type: "heatmap"}
    ];

    runningIndex = 6;

    state = {
        analysisTiles: [],
        order: [],  // order does not use the ids of the analysisTiles but is simply a permutation of the natural numbers 0 - (numberTiles-1)
        filename: undefined
    }

    constructor(props) {
        super(props);
        this.id = parseInt(this.props.match.params.id);
    }

    componentDidMount() {
        let analyses = undefined;
        let order = undefined;
        // TODO BACKEND
        // let filename = BACKEND.getFilename(this.id);
        // let analyses, order = BACKEND.getAnalyses(this.id); // should return data in the same format as this.defaultAnalysisTiles or undefined if there are no analyses/charts yet
        let filename = this.id === 1?"2022-08-01: Team 1 vs. Team 2":"2021-07-15: Team 1 vs. Team 3";
        if(analyses) {
            this.setState({analysisTiles: analyses, order, filename});
        }
        else {
            this.setState({analysisTiles: this.defaultAnalysisTiles, order: this.defaultAnalysisTiles.map((tile) => tile.id), filename});   // TODO BACKEND maybe get rid of default analyses once Backend is done, this is just for demo/development purposes
        }
    }

    componentWillUnmount() {
        // TODO BACKEND save changes in analysis to backend so that next time .../analysis/gameId is accessed, same AnalysisTiles are loaded
        // the backend should reorder the tiles according to order and sent them in the correct order next time
        // BACKEND.saveAnalysis(this.id, this.state.analysisTiles, this.state.order);
    }

    addButton = () => {
        let newAnalysisTile = {id: this.runningIndex, type: "new"};
        this.setState((prevState) => {
            return ({
                analysisTiles: [...prevState.analysisTiles, newAnalysisTile],
                order: [...prevState.order, this.runningIndex++]
            });});
    }

    // expects changes object with all properties that have changed
    // special operations:
    //   type = "delete": deletes the tile
    //   type = "shift-right" || "shift-left": changes order of tiles by shifting current tile to right/left
    changeTile = (id) => (changes) => {
        // console.log("Changes to Tile " + id);
        // console.log(changes);

        // Delete Tile
        if (changes?.type === "delete") {
            let indexToDelete = this.state.analysisTiles.findIndex((e) => e.id == id);
            this.setState((prevState) => ({
                analysisTiles: prevState.analysisTiles.filter((tile) => tile.id !== id),    // quite inefficient, should use splice on a copy of the arrays but does not matter here
                order: prevState.order.filter((e) => e !== id)
            }));
            return;
        }

        // Change position of tile
        if(changes?.type === "shift-right" || changes?.type === "shift-left") {
            let order = [...this.state.order];
            let indexTile = order.findIndex((value) => value == id);
            let relativeIndexChangePartner = changes.type==="shift-right"?1:-1;
            let indexChangePartner = indexTile+relativeIndexChangePartner;
            if(indexChangePartner < 0 || indexChangePartner >= order.length)
                return;     // when tile cannot be shifted because it is already at start or end, nothing happens
            let cache = order[indexTile];
            order[indexTile] = order[indexChangePartner];
            order[indexChangePartner] = cache;

            this.setState({order: order});
            return;
        }

        // Do other / "normal" changes of tile
        if (changes.hasOwnProperty("type"))
            this.setState((prevState) => ({analysisTiles: prevState.analysisTiles.map((tile) => tile.id === id ? {id: tile.id, ...changes} : tile)}));
        else
            this.setState((prevState) => ({analysisTiles: prevState.analysisTiles.map((tile) => tile.id === id ? {...tile, ...changes} : tile)}));
    }

    render() {
        let analysisTiles = this.state.analysisTiles.map((t, index) =>
            <div key={t.id} style={{order: this.state.order.indexOf(t.id)}}>
                <AnalysisTile
                    gameId={this.id}
                    tileId={t.id}
                    type={t.type}
                    groupByTeams={t?.groupByTeams}
                    teams={t?.teams}
                    players={t?.players}
                    notes={t?.notes}
                    changeTile={this.changeTile(t.id)}/>
            </div>);
        return (
            <div className="Analysis">
                <div className="AnalysisHeadingContainer">
                    <div className={"AnalysisAddButtonContainer"}>
                        <IconButton size="medium" variant="contained" className={"AnalysisAddButton"} onClick={this.addButton} aria-label="add new analysis tile">
                            <FontAwesomeIcon className="PlusIcon" icon={faPlus} />
                        </IconButton>
                    </div>
                    <div className="AnalysisHeadingAndSubheading">
                        <h1 className="AnalysisHeading">Analysis</h1>
                        <h2 className="AnalysisSubheading">{this.state.filename}</h2>
                    </div>
                </div>
                <div className="AnalysisTileContainer">
                    {analysisTiles}
                </div>
            </div>
        );
    }
}

export default withRouter(Analysis);