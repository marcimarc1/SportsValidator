import React, { Component } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as HomeLogo } from "../../icons/home.svg"; //Loading SVG files as components as opposed to in an <img> tag lets us style them
import { ReactComponent as AccountLogo } from "../../icons/account.svg";
import PropTypes from "prop-types";
import "./Header.css";
import { withRouter } from "react-router";

class Header extends Component {
  id;

  constructor(props) {
    super(props);
    this.id = this.props.match?.params?.id;
  }

  render() {
    let path = window.location.pathname;
    let headerLinks = [];

    // find correct header links depending on current url
    let runningIndex = 0;
    switch (true) {
      case path === "/":
      // decided to use Button for this link instead
      // if(this.state.loggedIn) {
      //     headerLinks.push(<Link className="HeaderText turn-light-gray-on-hover" to={"/games"} > File Overview </Link>);
      // }
      case path.split("/")[1] === "account":
      case path.split("/")[1] === "about":
      case path.split("/")[1] === "feedback":
      case path.split("/")[1] === "upload-video":
        headerLinks.push(
          <Link
            key={runningIndex++}
            className="HeaderText turn-light-gray-on-hover"
            to="/about"
          >
            {" "}
            About{" "}
          </Link>,
        );
        headerLinks.push(
          <Link
            key={runningIndex++}
            className="HeaderText turn-light-gray-on-hover"
            to="/feedback"
          >
            {" "}
            Feedback{" "}
          </Link>,
        );
        headerLinks.push(
          <Link
            key={runningIndex++}
            className="HeaderText turn-light-gray-on-hover"
            to="/upload-video"
          >
            {" "}
            Upload{" "}
          </Link>,
        );
        break;
      case path.split("/")[1] === "trackingEditor":
        headerLinks.push(
          <Link
            key={runningIndex++}
            className="HeaderText turn-light-gray-on-hover"
            to={"/games"}
          >
            {" "}
            File Overview{" "}
          </Link>,
        );
        headerLinks.push(
          <Link
            key={runningIndex++}
            className="HeaderText turn-light-gray-on-hover"
            to={"/analysis/" + this.id}
          >
            {" "}
            Analysis{" "}
          </Link>,
        );
        break;
      case path.split("/")[1] === "analysis":
        headerLinks.push(
          <Link
            key={runningIndex++}
            className="HeaderText turn-light-gray-on-hover"
            to={"/games"}
          >
            {" "}
            File Overview{" "}
          </Link>,
        );
        headerLinks.push(
          <Link
            key={runningIndex++}
            className="HeaderText turn-light-gray-on-hover"
            to={"/trackingEditor/" + this.id}
          >
            {" "}
            TrackingEditor{" "}
          </Link>,
        );
        break;
      default:
        // fall through, Header does not display any extra links
        break;
    }

    return (
      // <div>
      <header
        className={
          "Header" +
          (this.props.onStartPage ? " on-start-page" : " not-on-start-page") +
          (this.props.shrinkAnimation ? " shrink-animation" : "")
        }
      >
        <Link className="HeaderLinkWrapper" to="/">
          <HomeLogo
            id="home-logo"
            className="HeaderIcon turn-light-gray-on-hover"
          />
        </Link>
        <div id="header-spacer"></div>

        {headerLinks}

        <Link className="HeaderLinkWrapper" to="/account">
          <AccountLogo
            id="account-logo"
            className="HeaderIcon turn-light-gray-on-hover"
          />
        </Link>
      </header>
    );
  }
}

Header.propTypes = {
  onStartPage: PropTypes.bool,
  shrinkAnimation: PropTypes.bool,
};

Header.defaultProps = {
  onStartPage: false,
  shrinkAnimation: false,
};

export default withRouter(Header);
