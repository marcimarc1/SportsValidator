import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {ReactComponent as HomeLogo} from '../../icons/home.svg';    //Loading SVG files as components as opposed to in an <img> tag lets us style them
import {ReactComponent as AccountLogo} from '../../icons/account.svg';
import PropTypes from 'prop-types';
import './Header.css';
import {withRouter} from "react-router";

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
        switch (true) {
            case path === "/":
                // decided to use Button for this link instead
                // if(this.state.loggedIn) {
                //     headerLinks.push(<Link className="HeaderText turn-light-gray-on-hover" to={"/games"} > File Overview </Link>);
                // }
            case path.split("/")[1] === "account":
            case path.split("/")[1] === "about":
            case path.split("/")[1] === "feedback":
                headerLinks.push(<Link className="HeaderText turn-light-gray-on-hover" to="/about"> About </Link>);
                headerLinks.push(<Link className="HeaderText turn-light-gray-on-hover" to="/feedback"> Feedback </Link>);
                break;
            case path.split("/")[1] === "trackingEditor":
                headerLinks.push(<Link className="HeaderText turn-light-gray-on-hover" to={"/games"} > File Overview </Link>);
                headerLinks.push(<Link className="HeaderText turn-light-gray-on-hover" to={"/analysis/"+this.id} > Analysis </Link>);
                break;
            case path.split("/")[1] === "analysis":
                headerLinks.push(<Link className="HeaderText turn-light-gray-on-hover" to={"/games"} > File Overview </Link>);
                headerLinks.push(<Link className="HeaderText turn-light-gray-on-hover" to={"/trackingEditor/"+this.id} > TrackingEditor </Link>);
        }

        return (
            // <div>
                <header className={"Header" + (this.props.onStartPage ? " on-start-page" : " not-on-start-page") + (this.props.shrinkAnimation ? " shrink-animation" : "")}>
                    {/*The above is just the standard html header tag (instead of div), not to be confused with the Header component*/}

                    <Link className="HeaderLinkWrapper" to="/">
                        <HomeLogo id="home-logo" className="HeaderIcon turn-light-gray-on-hover"/>
                    </Link>
                    <div id="header-spacer"></div>

                    {headerLinks}

                    {/*First, I tried to do it like follows (which would be more straight-forward) but react router does not seem to support placing a Link component inside a BrowserRouter/Route*/}

                    {/*<Router>*/}
                    {/*    <Route exact path="/" >*/}
                    {/*        /!*<Link className="HeaderText turn-light-gray-on-hover" to="/about"> About </Link>*!/*/}
                    {/*        /!*<Link className="HeaderText turn-light-gray-on-hover" to="/feedback"> Feedback </Link>*!/*/}
                    {/*    </Route>*/}
                    {/*    <Route path="/trackingEditor/:id" >*/}
                    {/*        /!*<Link className="HeaderText turn-light-gray-on-hover" to={"/games"} > File Overview </Link>*!/*/}
                    {/*        /!*<Link className="HeaderText turn-light-gray-on-hover" to={"/analysis/"+this.id} > Analysis </Link>*!/*/}
                    {/*    </Route>*/}
                    {/*    <Route path="/analysis/:id" >*/}
                    {/*            <Link className="HeaderText turn-light-gray-on-hover" to={"/games"} > File Overview </Link>*/}
                    {/*            <Link className="HeaderText turn-light-gray-on-hover" to={"/trackingEditor/"+this.id} > TrackingEditor </Link>*/}
                    {/*    </Route>*/}
                    {/*</Router>*/}





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
        onStartPage: PropTypes.bool,
        shrinkAnimation: PropTypes.bool
    };

    Header.defaultProps = {
        onStartPage: false,
        shrinkAnimation: false
    };


export default withRouter(Header);