import React, {Component} from 'react';
import {withRouter} from "react-router";
import AnalysisTile from "./AnalysisTile";
import "./Analysis.css";
import IconButton from "@material-ui/core/IconButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faPlus} from "@fortawesome/free-solid-svg-icons";

class Analysis extends Component {

    id = -1;
    defaultAnalysisTiles = [
        // teams: considers players from all (undefined) or specific teams (team id)
        // players: same as teams
        // groupByTeams:
        {type: "distance-barchart", groupByTeams: false, teams: [1, 2], players: undefined},
        {type: "distance-barchart", groupByTeams: true, teams: undefined, players: undefined},
        {type: "distance-barchart", groupByTeams: true, teams: undefined, players: undefined}
    ];

    state = {
        analysisTiles: [],
        filename: undefined
    }

    constructor(props) {
        super(props);
        this.id = this.props.match.params.id;
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

    render() {
        let analysisTiles = this.state.analysisTiles.map((t, index) => <AnalysisTile gameId={this.id} tileId={index} type={t.type} groupByTeams={t.groupByTeams} teams={t?.teams} players={t?.players} />);
        return (
            <div className="Analysis">
                <div className="AnalysisHeadingContainer">
                    
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