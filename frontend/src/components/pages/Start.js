import React, {Component} from 'react';
import { Link } from 'react-router-dom';


class Start extends Component {


    state = {
        loggedIn: false
    }

    componentDidMount() {
        let loggedIn = true;

        // TODO BACKEND
        //let loggedIn = BACKEND.isLoggedIn();

        if(loggedIn)
            this.setState({loggedIn: loggedIn});
    }

    render() {
        let buttons = [];
        if(this.state.loggedIn) {
            buttons.push(<Link to="/games">
                <button className="StartButton StartDemoButton turn-light-gray-on-hover"> File Overview </button>
            </Link>)
        }
        else {
            buttons = buttons.concat(
                [<Link to="/demo">
                    <button className="StartButton StartDemoButton turn-light-gray-on-hover"> Demo </button>
                </Link>,
                <button className="StartButton turn-light-gray-on-hover"> Sign In </button>,
                <button className="StartButton turn-light-gray-on-hover"> Register </button>]);
        }
        return (
            <div className="Start full-page">
                <div className="StartBody">
                    <h1 className="StartHeading"> Game Tracker </h1>
                    <div className="StartButtonContainer">
                        {buttons}
                    </div>
                </div>
            </div>
        );
    }
}

export default Start;