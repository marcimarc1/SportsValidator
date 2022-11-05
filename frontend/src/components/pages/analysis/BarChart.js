import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js/auto';      // /auto to avoid manually registering Chart components; could be changed according to this to decrease bundle size of the app: https://stackoverflow.com/a/67240031
import "./Analysis.css";


class BarChart extends Component {

    chart;
    colors = ["green", "blue", "red", "purple", "grey"];

    componentDidMount() {
        const ctx = document.getElementById("Chart"+this.props.tileId).getContext("2d");
        let rawData = this.props.data;
        // if(this.props.groupByTeams) {
        //     let datasets = [];
        //     let currentTeam = this.props.data.teams[0];
        //     for(let i = 0; i < this.props.data.teams.length; i++) {
        //
        //     }
        //
        // }

        let chartColors;
        let datasets = [];
        if(this.props.groupByTeams) {
            chartColors = rawData.values.map((e, index) => this.colors[index % this.colors.length]);
            datasets = [{
                    data: rawData.values,
                    backgroundColor: chartColors
                }];
        } else {
            // reformat data for chart such that we have one dataset per team so we can color code teams
            let teams = new Set(rawData.teams); // get all unique teams to iterate over
            let counter = 0; // to assign colors to teams
            for(const t of teams) {
                let booleanMask = rawData.teams.map((e) => e === t);
                let indices = booleanMask.map((e, index) => e?index:-1).filter((e) => e >= 0);

                let currentDataset = {
                    label: rawData.teamNames[t],
                    data: rawData.values.map((v, index) => (indices.includes(index)?v:undefined)),  // delete values that belong to other teams
                    backgroundColor: this.colors[counter++]
                };
                datasets.push(currentDataset);
            }
        }

        let chartData = {
            labels: rawData.labels,
            datasets: datasets
        };
        this.chart = new Chart(ctx, {
            type: "bar",
            data: chartData,
            options: {
                responsive: false,
                //maintainAspectRatio: false
                scales: {
                    x: {
                        title: {
                            display: true,  // displays axis title
                            text: rawData.xLabel
                        }
                    },
                    y: {
                        title: {
                            beginAtZero: true,
                            display: true,
                            text: rawData.yLabel
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: !this.props.groupByTeams
                    }
                }
            }
        });
    }

    render() {
        return (
            <div>
                <canvas id={"Chart"+this.props.tileId} className="Chart" width="500" height="500"></canvas>
            </div>
        );
    }
}

BarChart.propTypes = {
    data: PropTypes.object.isRequired,
    groupByTeams: PropTypes.bool.isRequired,
    tileId: PropTypes.number.isRequired
};

export default BarChart;
