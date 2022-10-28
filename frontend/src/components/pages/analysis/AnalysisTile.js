import React, {Component} from 'react';
import PropTypes from 'prop-types';

import dataBarchart1 from "../../../data/analysis_distance_barchart_Teams_1_2.json";
import dataBarchart2 from "../../../data/analysis_distance_barchart_groupByTeams_Teams_1_2.json";
import BarChart from "./BarChart";
import "./Analysis.css";

class AnalysisTile extends Component {

    state = {
        data: undefined
    }

    componentDidMount() {
        // TODO BACKEND
        // data = BACKEND.getAnalysisData(this.props.gameId, this.props.type, this.props.groupByTeams, this.props.Teams, this.props.Players);
        let data;
        if(this.props.tileId === 0) {
            this.setState({data: dataBarchart1.data});
        }
        if(this.props.tileId === 1) {
            this.setState({data: dataBarchart2.data});
        }
        if(this.props.tileId === 2) {
                    this.setState({data: dataBarchart2.data});
                }
    }

    render() {
        let chart;
        let headingText;
        console.log(this.props.type);
        console.log(this.state.data);
        if(this.state.data) {
            switch (this.props.type) {
                case "distance-barchart":
                    chart = <BarChart data={this.state.data} groupByTeams={this.props.groupByTeams} tileId={this.props.tileId}/>;
                    headingText = "Distance covered";
                    break;
                case "heatmap":
                    // TODO
                    headingText = (this.props.groupByTeams?"Team":"Player") + " Position Heatmap";
                    break;
            }
        }

        return (
            <div className="AnalysisTile">
                <h1>{headingText}</h1>
                {chart}
            </div>
        );
    }
}

AnalysisTile.propTypes = {
    gameId: PropTypes.number.isRequired,
    tileId: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    groupByTeams: PropTypes.bool.isRequired,
    teams: PropTypes.arrayOf(PropTypes.number),
    players: PropTypes.arrayOf(PropTypes.number)
};

export default AnalysisTile;
