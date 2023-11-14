import React, {Component} from 'react';
import './NewTrackingEditor.css';
import {Button} from "@material-ui/core";
// import {ReactComponent as Add} from "../../../icons/plus.svg";




class TrackList extends Component {

    state = {activeTab: 0}

    changeTab = (tabID) => () => {      // currying so that tabID can be a parameter but onClick still receives a function
        this.setState({activeTab: tabID})
    }

    render = () => {
        return (
            <div className="TrackList">
                <div className="TrackListTabs">
                    <Button className={(this.state.activeTab == 0 ? "active" : "")} onClick={this.changeTab(0)}>Players</Button>
                    <Button className={(this.state.activeTab == 1 ? "active" : "")} onClick={this.changeTab(1)}>Teams</Button>
                    <Button className={(this.state.activeTab == 2 ? "active" : "")} onClick={this.changeTab(2)}>Ball</Button>
                </div>

                <div className="TrackListList" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                    <div className={(this.state.activeTab == 0 ? "" : "inactive")}>
                        {/* {this.props.children.players} */}
                        place players here.
                    </div>
                    <div className={(this.state.activeTab == 1 ? "" : "inactive")}>
                        {/* {this.props.children.corners} */}
                        place teams here.
                    </div>
                    <div className={(this.state.activeTab == 2 ? "" : "inactive")}>
                        {/* {this.props.children.groups} */}
                        place ball data here.
                    </div>
                </div>

                {/*<div className="TrackListControls" >*/}
                {/*    test*/}
                {/*    <Add />*/}
                {/*    /!*TODO suggestions: Search Bar, Sort By Dropdown*!/*/}
                {/*</div>*/}
            </div>
        );
    }
}


export default TrackList;