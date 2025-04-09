import React, { Component } from "react";
import "./NewTrackingEditor.css";
import { Button } from "@material-ui/core";
// import {ReactComponent as Add} from "../../../icons/plus.svg";

class TrackList extends Component {
  state = { activeTab: 0, newTeamColor: "#ffffff" };

  changeTab = (tabID) => () => {
    // currying so that tabID can be a parameter but onClick still receives a function
    this.setState({ activeTab: tabID });
  };

  render = () => {
    const allPlayers = React.Children.toArray(this.props.children).map(
      (child) => ({
        id: child.props.playerBox?.my?.key,
        name: child.props.name,
      }),
    );

    return (
      <div className="TrackList">
        <div className="TrackListTabs">
          <Button
            className={this.state.activeTab == 0 ? "active" : ""}
            onClick={this.changeTab(0)}
          >
            Players
          </Button>
          <Button
            className={this.state.activeTab == 1 ? "active" : ""}
            onClick={this.changeTab(1)}
          >
            Teams
          </Button>
          <Button
            className={this.state.activeTab == 2 ? "active" : ""}
            onClick={this.changeTab(2)}
          >
            Ball
          </Button>
        </div>

        <div className="TrackListList">
          <div className={this.state.activeTab == 0 ? "" : "inactive"}>
            {this.props.children}
          </div>

          <div className={this.state.activeTab == 1 ? "" : "inactive"}>
            {this.props.teams.map((team) => (
              <div
                key={team.id}
                className="team-section"
                style={{ marginBottom: "1.5rem" }}
              >
                <h3
                  style={{
                    color: `rgb(${this.props.teamColors[team.id]?.r || 255}, ${
                      this.props.teamColors[team.id]?.g || 255
                    }, ${this.props.teamColors[team.id]?.b || 255})`,
                  }}
                >
                  {team.name}
                </h3>

                <div className="team-players-list">
                  {this.props.children.filter((item) =>
                    team.players.some(
                      (player) => player.id === item.props.playerBox.my.key,
                    ),
                  )}
                </div>

                {/* Stacked label + dropdown */}
                <div style={{ marginTop: "0.5rem" }}>
                  <label
                    htmlFor={`select-player-${team.id}`}
                    style={{
                      display: "block",
                      marginBottom: "0.25rem",
                      fontSize: "0.85rem",
                      color: "#ccc",
                    }}
                  >
                    Add Player:
                  </label>
                  <select
                    id={`select-player-${team.id}`}
                    value={this.state.selectedPlayerMap?.[team.id] || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;

                      this.props.addPlayerToTeam(team.id, selectedId);

                      this.setState((prev) => ({
                        selectedPlayerMap: {
                          ...prev.selectedPlayerMap,
                          [team.id]: "",
                        },
                      }));
                    }}
                    style={{
                      width: "100%",
                      padding: "0.35rem",
                      borderRadius: "4px",
                      backgroundColor: "#f0f0f0",
                      border: "1px solid #aaa",
                    }}
                  >
                    <option value="" disabled>
                      Select player to add
                    </option>
                    {allPlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {/* Add New Team UI */}
            <div
              style={{
                marginTop: "2rem",
                paddingTop: "1rem",
                borderTop: "1px solid gray",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <label
                htmlFor="newTeamColor"
                style={{ color: "#ccc", fontSize: "0.9rem" }}
              >
                Team Color:
              </label>
              <input
                id="newTeamColor"
                type="color"
                value={this.state.newTeamColor}
                onChange={(e) =>
                  this.setState({ newTeamColor: e.target.value })
                }
                style={{
                  width: "40px",
                  height: "30px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              />
              <Button
                onClick={() => {
                  this.props.addTeam(this.state.newTeamColor);
                  this.setState({ newTeamColor: "#ffffff" });
                }}
                disabled={this.state.newTeamColor === "#ffffff"}
                variant="contained"
                style={{
                  backgroundColor:
                    this.state.newTeamColor === "#ffffff" ? "#555" : "#4caf50",
                  color: "white",
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                Add Team
              </Button>
            </div>
          </div>

          <div className={this.state.activeTab == 2 ? "" : "inactive"}>
            {this.props.groups}
          </div>
        </div>

        {/*<div className="TrackListControls" >*/}
        {/*    tests*/}
        {/*    <Add />*/}
        {/*    /!*TODO suggestions: Search Bar, Sort By Dropdown*!/*/}
        {/*</div>*/}
      </div>
    );
  };
}

export default TrackList;
