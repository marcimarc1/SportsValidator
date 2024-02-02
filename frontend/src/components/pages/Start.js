import React, { Component } from "react";
import { Link } from "react-router-dom";

class Start extends Component {
  state = {
    loggedIn: false, // leave this set to false and change the value in componentDidMount to prevent bugs/confusion
  };

  componentDidMount() {
    let loggedIn = true;

    // TODO BACKEND
    //let loggedIn = BACKEND.isLoggedIn();

    // TODO BACKEND User/Login Management, probably best done in App.js ?

    if (loggedIn) this.setState({ loggedIn: loggedIn });
  }

  render() {
    let buttons = [];
    let runningIndex = 0;
    if (this.state.loggedIn) {
      buttons.push(
        <Link key={runningIndex++} to="/games">
          <button className="StartButton StartDemoButton turn-light-gray-on-hover">
            {" "}
            File Overview{" "}
          </button>
        </Link>,
      );
    } else {
      buttons = buttons.concat([
        <Link key={runningIndex++} to="/demo">
          <button className="StartButton StartDemoButton turn-light-gray-on-hover">
            {" "}
            Demo{" "}
          </button>
        </Link>,
        // TODO BACKEND when wrapping following buttons in a link, move the key to Link like for the demo button above (mainly done so that the linter does not throw a warning)
        <button
          key={runningIndex++}
          className="StartButton turn-light-gray-on-hover"
        >
          {" "}
          Log In{" "}
        </button>,
        <button
          key={runningIndex++}
          className="StartButton turn-light-gray-on-hover"
        >
          {" "}
          Register{" "}
        </button>,
      ]);
    }
    return (
      <div className="Start full-page">
        <div className="StartBody">
          <h1 className="StartHeading"> Game Tracker </h1>
          <div className="StartButtonContainer">{buttons}</div>
        </div>
      </div>
    );
  }
}

export default Start;
