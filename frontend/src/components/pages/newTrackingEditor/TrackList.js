import React, { Component } from "react";
import { Button } from "@material-ui/core";
import TrackListItemPlayer from "./TrackListItemPlayer";

class TrackList extends Component {
  state = {
    activeTab: 0,
    newTeamColor: "#ffffff",
  };

  changeTab = (tabID) => () => {
    this.setState({ activeTab: tabID });
  };

  handleAddTeam = () => {
    const { addTeam } = this.props;
    const { newTeamColor } = this.state;

    addTeam(newTeamColor);
    this.setState({ newTeamColor: "#ffffff" });
  };

  handleColorChange = (event) => {
    this.setState({ newTeamColor: event.target.value });
  };

  render() {
    const {
      children,
      groups,
      teams,
      addPlayerToTeam,
      players,
      teamColors,
      setName,
      deletePlayer,
      handleModalOpen,
      blink,
    } = this.props;

    const { activeTab, newTeamColor } = this.state;

    return (
      <div className="TrackList">
        <div className="TrackListTabs">
          <Button
            className={activeTab === 0 ? "active" : ""}
            onClick={this.changeTab(0)}
          >
            Players
          </Button>
          <Button
            className={activeTab === 1 ? "active" : ""}
            onClick={this.changeTab(1)}
          >
            Teams
          </Button>
          <Button
            className={activeTab === 2 ? "active" : ""}
            onClick={this.changeTab(2)}
          >
            Ball
          </Button>
        </div>

        <div className="TrackListList">
          {/* Players */}
          <div className={activeTab === 0 ? "" : "inactive"}>
            {React.Children.map(children, (child) =>
              React.cloneElement(child, { setName })
            )}
          </div>

          {/* Teams */}
          <div className={activeTab === 1 ? "" : "inactive"}>
            {teams.map((team) => (
              <div key={team.id} className="team-section">
                <h3
                  style={{
                    color: `rgb(${teamColors[team.id]?.r || 255}, ${
                      teamColors[team.id]?.g || 255
                    }, ${teamColors[team.id]?.b || 255})`,
                  }}
                >
                  {team.name}
                </h3>
                <div className="team-players-list">
                  {team.players.map((player) => {
                    const playerBox = React.Children.toArray(children).find(
                      (child) =>
                        child.props.playerBox.my.key === player.id
                    )?.props.playerBox;

                    return (
                      <TrackListItemPlayer
                        key={player.id}
                        playerBox={
                          playerBox || { my: { key: player.id, selected: false } }
                        }
                        name={player.name}
                        changeSelection={() => {}}
                        setName={setName}
                        delete={deletePlayer}
                        blink={blink}
                        color={teamColors[team.id] || { r: 255, g: 255, b: 255 }}
                        handleModalOpen={handleModalOpen}
                      />
                    );
                  })}
                </div>
                {/* Add player dropdown */}
                <select
                  onChange={(e) => addPlayerToTeam(team.id, e.target.value)}
                >
                  <option value="">Select Player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Add New Team Section */}
            <div
              style={{
                margin: "20px 0",
                padding: "10px",
                backgroundColor: "var(--secondary-bg)",
                border: "1px solid var(--main-text-color)",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <label
                htmlFor="team-color-picker"
                style={{
                  color: "var(--main-text-color)",
                  fontSize: "0.9rem",
                }}
              >
                Choose a color for the new team:
              </label>
              <input
                id="team-color-picker"
                type="color"
                value={newTeamColor}
                onChange={this.handleColorChange}
                style={{
                  cursor: "pointer",
                  width: "50px",
                  height: "50px",
                  border: "none",
                  padding: "0",
                  borderRadius: "5px",
                  backgroundColor: "transparent",
                }}
              />
              <Button
                onClick={this.handleAddTeam}
                disabled={newTeamColor === "#ffffff"}
                style={{
                  backgroundColor:
                    newTeamColor !== "#ffffff" ? newTeamColor : "var(--accent)",
                  color: newTeamColor !== "#ffffff" ? "#000" : "#fff",
                  height: "50px",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
              >
                ADD TEAM
              </Button>
            </div>
          </div>

          {/* Ball */}
          <div className={activeTab === 2 ? "" : "inactive"}>{groups}</div>
        </div>
      </div>
    );
  }
}

export default TrackList;
