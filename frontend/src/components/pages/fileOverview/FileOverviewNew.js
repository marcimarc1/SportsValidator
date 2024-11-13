import React, { Component } from "react";

import {getGames} from "../../../controllers/game.controler";
import FileListItem from "./FileListItem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle, faInfoCircle, faTrash, faUpload} from "@fortawesome/free-solid-svg-icons";
import IconButton from "@material-ui/core/IconButton";

class GameOverview extends React.Component{
    constructor(props){
        super(props);

        this.games = getGames();

        this.hasGameSelected = false;
    }

    openGameModal = (event) => {
        return
    };

    render() {

    return (
      <div className="GameOverview">
        <div className="GameOverviewList">
          <div className="FileOverviewHeadingContainer">
            <h1 className={"FileOverviewHeading"}>Game Overview</h1>
            <div className="file-upload-container">
              <label className="file-upload" for="file-upload">
                Add Game
              </label>

              <input
                id="file-upload"
                type="file"
                ref={this.fileInput}
                name="file"
                multiple
                onClick={this.this.openGameModal}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}