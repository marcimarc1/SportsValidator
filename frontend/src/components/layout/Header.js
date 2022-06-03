import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import {ReactComponent as HomeLogo} from '../../icons/home.svg';    //Loading SVG files as components as opposed to in an <img> tag lets us style them
import {ReactComponent as AccountLogo} from '../../icons/account.svg';
import PropTypes from 'prop-types';
import './Header.css';

class Header extends Component {
    render() {
        return (
            // <div>
                <header className={"Header" + (this.props.onStartPage ? " on-start-page" : " not-on-start-page")}>
                    {/*The above is just the standard html header tag (instead of div), not to be confused with the Header component*/}
                    <Link className="HeaderLinkWrapper" to="/">
                        <HomeLogo id="home-logo" className="HeaderIcon turn-light-gray-on-hover"/>
                    </Link>
                    <div id="header-spacer"></div>
                    <Link className="HeaderText turn-light-gray-on-hover" to="/about"> About </Link>
                    <Link className="HeaderText turn-light-gray-on-hover" to="/feedback"> Feedback </Link>
                    <Link className="HeaderLinkWrapper" to="/account">
                        <AccountLogo id="account-logo" className="HeaderIcon turn-light-gray-on-hover"/>
                    </Link>
                </header>
        );
            // {/*    <div className={"HeaderSpacerDummy" + (this.props.onStartPage ? " on-start-page" : "")}></div>*/}
            // {/*</div>*/}
    }
}

    Header.propTypes = {
        onStartPage: PropTypes.bool
    };

    Header.defaultProps = {
        onStartPage: false
    };


export default Header;