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
        {type: "distance-barchart", groupByTeams: false, teams: [1, 2], players: undefined},
        {type: "distance-barchart", groupByTeams: true, teams: undefined, players: undefined},
        {type: "distance-barchart", groupByTeams: true, teams: undefined, players: undefined},
        {type: "notes", notes: "As you can cleary see, the players of one of the team ran further doing the game."},
        {type: "new"}
    ];

    state = {
        analysisTiles: [],
        filename: undefined
    }

    constructor(props) {
        super(props);
        this.id = parseInt(this.props.match.params.id);
    }

    componentDidMount() {
        // TODO BACKEND
        // let filename = BACKEND.getFilename(this.id);
        // let analyses = BACKEND.getAnalyses(this.id); // should return data in the same format as this.defaultAnalysisTiles or undefined if there are no analyses/charts yet
        let analyses = undefined;
        let filename = this.id === 1?"2022-08-01: Team 1 vs. Team 2":"2021-07-15: Team 1 vs. Team 3";
        if(analyses) {
            this.setState({analysisTiles: analyses, filename});
        }
        else {
            this.setState({analysisTiles: this.defaultAnalysisTiles, filename});   // TODO BACKEND maybe get rid of default analyses once Backend is done, this is just for demo/development purposes
        }
    }

    componentWillUnmount() {
        // TODO BACKEND save changes in analysis to backend so that next time .../analysis/gameId is accessed, same AnalysisTiles are loaded
        // BACKEND.saveAnalysis(this.id, this.state.analysisTiles);
    }

    addButton = () => {
        let newAnalysisTile = {type: "new"};
        this.setState((prevState) => {return {analysisTiles: [...prevState.analysisTiles, newAnalysisTile]};});
    }

    // expects changes object with all properties that have changed
    changeTile = (id) => (changes) => {
        // console.log("Changes to Tile " + id);
        // console.log(changes);
        if(changes.hasOwnProperty("type"))
            this.setState((prevState) => ({analysisTiles: prevState.analysisTiles.map((tile, index) => index === id?{...changes}:tile)}));
        else
            this.setState((prevState) => ({analysisTiles: prevState.analysisTiles.map((tile, index) => index === id?{...tile, ...changes}:tile)}));
    }

    render() {
        let analysisTiles = this.state.analysisTiles.map((t, index) => <AnalysisTile key={index} gameId={this.id} tileId={index} type={t.type} groupByTeams={t?.groupByTeams} teams={t?.teams} players={t?.players} notes={t?.notes} changeTile={this.changeTile(index)}/>);
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