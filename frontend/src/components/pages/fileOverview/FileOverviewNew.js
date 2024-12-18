import React, {Component, useState} from "react";
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
              <label className="file-upload" htmlFor="game-dialog-button">
                Add Game
              </label>
              <input
                id="game-dialog-button"
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

export default FileOverviewNew;
