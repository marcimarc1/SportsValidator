import React, {Component} from 'react';
import {ReactComponent as HomeLogo} from '../../icons/home.svg';    //Loading SVG files as components as opposed to in an <img> tag lets us style them
import {ReactComponent as AccountLogo} from '../../icons/account.svg';
import './Header.css';

class Header extends Component {
    render() {
        return (
            <div id="header">
                <HomeLogo id="home-logo" className="HeaderIcon turn-white-on-hover"/>
                <div id="header-spacer"></div>
                <h1 className="HeaderText turn-white-on-hover"> About </h1>
                <h1 className="HeaderText turn-white-on-hover"> Feedback </h1>
                {/*<h1 id="app-name" className="HeaderText"> Game Tracker </h1>*/}
                <AccountLogo id="account-logo" className="HeaderIcon turn-white-on-hover"/>
            </div>
        );
    }
}

export default Header;