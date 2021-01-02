import React, {Component} from 'react';
import Header from "../layout/Header";


// TODO make Buttons resize when window resizes
class Start extends Component {
    render() {
        return (
            <div className="Start full-page">
                <Header />
                <div className="StartBody">
                    <h1 className="StartHeading"> Game Tracker </h1>
                    <div className="StartButtonContainer">
                        <button className="StartButton StartDemoButton turn-white-on-hover"> Demo </button>
                        <button className="StartButton turn-white-on-hover"> Sign In </button>
                        <button className="StartButton turn-white-on-hover"> Register </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Start;