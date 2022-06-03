import React, {Component} from 'react';
import { Link } from 'react-router-dom';


// TODO make Buttons resize when window resizes
class Start extends Component {
    render() {
        return (
            <div className="Start full-page">
                <div className="StartBody">
                    <h1 className="StartHeading"> Game Tracker </h1>
                    <div className="StartButtonContainer">
                        <Link to="/demo">
                            <button className="StartButton StartDemoButton turn-light-gray-on-hover"> Demo </button>
                        </Link>
                        <button className="StartButton turn-light-gray-on-hover"> Sign In </button>
                        <button className="StartButton turn-light-gray-on-hover"> Register </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Start;