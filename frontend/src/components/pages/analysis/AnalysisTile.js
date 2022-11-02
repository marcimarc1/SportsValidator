import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { EditText, EditTextarea } from 'react-edit-text';
import 'react-edit-text/dist/index.css';

import dataBarchart1 from "../../../data/analysis_distance_barchart_Teams_1_2.json";
import dataBarchart2 from "../../../data/analysis_distance_barchart_groupByTeams_Teams_1_2.json";
import dataNewTile from "../../../data/analysis_new_tile_selections_1.json";
import BarChart from "./BarChart";
import TileTypeSelector from "./TileTypeSelector";
import "./Analysis.css";

class AnalysisTile extends Component {

    state = {
        data: undefined
    }

    componentDidMount() {
        if(this.props.type === "new")
            // TODO BACKEND
            // let data = BACKEND.getNewTileSelectionOptions(this.props.gameId);
            this.setState({data: dataNewTile.data});
        if(this.props.type === "notes") {
            this.setState({data: this.props?.notes});
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

    selectTileType = (changes) => {
        this.props.changeTile(changes);
    }

    render() {
        let chart;
        let headingText;
        console.log(this.props.type);
        console.log(this.state.data);
        if(this.state.data || this.props.type === "new" || this.props.type === "notes") {
            switch (this.props.type) {
                case "distance-barchart":
                    // TODO BACKEND maybe get team colors assigned to team from backend and pass them here so colors in chart match team colors?
                    chart = <BarChart data={this.state.data} groupByTeams={this.props.groupByTeams} tileId={this.props.tileId}/>;
                    headingText = "Distance covered";
                    break;
                case "heatmap":
                    // TODO
                    headingText = (this.props.groupByTeams?"Team":"Player") + " Position Heatmap";
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
                            style={{ paddingTop: 0}}
                            defaultValue={this.state.data}
                            placeholder='Enter your notes here'
                            onSave={this.handleChangeNotes}
                        />
                    </div>;
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
    players: PropTypes.arrayOf(PropTypes.number),
    notes: PropTypes.string,
    changeTile: PropTypes.func.isRequired
};

export default AnalysisTile;
