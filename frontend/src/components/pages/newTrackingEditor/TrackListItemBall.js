import React, { Component } from "react";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import { EditText } from "react-edit-text";
import "react-edit-text/dist/index.css";

import "./NewTrackingEditor.css";
import { ReactComponent as Highlight } from "../../../icons/highlight.svg";
import { ReactComponent as Delete } from "../../../icons/delete.svg";
import { ReactComponent as Merge } from "../../../icons/merge.svg";

class TrackListItemBall extends Component {
  testId = "mergeSwapModal" + this.props.name;

  handleChangeName = (obj) => {
    this.props.setName(this.props.ballBox, obj.value);
  };

  delete = () => {
    if (window.confirm("Do you really want to delete this player ?")) {
      this.props.delete(this.props.ballBox);
    }
  };

  handleClickMerge = () => {
    //TODO: only open merge modal -> needs to be implemented // check if neccessary
    this.props.handleModalOpen(this.props.name);
  };

  render() {
    let ballBox = this.props.ballBox;

    let name = this.props.name ? this.props.name : "testBall1";

    // selects or deselects (if its already selected) the clicked item (e.g. player)
    let clickItem = () => {
      this.props.changeSelection(ballBox);
    };

    const dotStyle = {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor:
        "rgb(" +
        this.props.color.r +
        "," +
        this.props.color.g +
        "," +
        this.props.color.b +
        ")",
      display: "inline-block",
      marginRight: "8px", // Adjust spacing as needed
    };

    return (
      <div
        className={"TrackListItem" + (ballBox.my.selected ? " selected" : "")}
        onClick={clickItem}
      >
        <IconButton
          size="small"
          className={"TrackListItemBlink"}
          onClick={this.props.blink.bind(this, ballBox)}
          aria-label="blink item"
        >
          <Highlight />
        </IconButton>

        <IconButton
          size="small"
          className={"TrackListItemDelete"}
          onClick={this.delete}
          aria-label="delete item"
        >
          <Delete />
        </IconButton>

        <IconButton
          size="small"
          className={"TrackListItemMerge"}
          data-testid={this.testId}
          onClick={this.handleClickMerge}
          aria-label="merge item"
        >
          <Merge />
        </IconButton>

        <div className="staticText">Ball name: </div>
        <EditText
          className={
            "TrackListItemName" + (ballBox.my.selected ? " selected" : "")
          }
          defaultValue={name.toString()}
          onSave={this.handleChangeName}
          style={{ marginLeft: "5px", width: "100px" }}
        />
        <div>
          <div style={dotStyle}></div>
        </div>
      </div>
    );
  }
}

TrackListItemBall.propTypes = {
  ballBox: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  changeSelection: PropTypes.func.isRequired,
  blink: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  color: PropTypes.object.isRequired,
  setName: PropTypes.func.isRequired,
  handleModalOpen: PropTypes.func.isRequired,
};

export default TrackListItemBall;
