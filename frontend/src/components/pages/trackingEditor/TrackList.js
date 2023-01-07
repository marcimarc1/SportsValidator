import React, {Component} from 'react';
import './TrackingEditor.css';
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
                    <Button className={(this.state.activeTab == 1 ? "active" : "")} onClick={this.changeTab(1)}>Corners</Button>
                    <Button className={(this.state.activeTab == 2 ? "active" : "")} onClick={this.changeTab(2)}>Groups</Button>
                </div>

                <div className="TrackListList" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                    <div className={(this.state.activeTab == 0 ? "" : "inactive")}>
                        {this.props.children.players}
                    </div>
                    <div className={(this.state.activeTab == 1 ? "" : "inactive")}>
                        {this.props.children.corners}
                    </div>
                    <div className={(this.state.activeTab == 2 ? "" : "inactive")}>
                        {this.props.children.groups}
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