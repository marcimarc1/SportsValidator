import React, { Component } from "react";
import "./NewTrackingEditor.css";
import { Button } from "@material-ui/core";
import TrackListItemPlayer from "./TrackListItemPlayer";


const generateRandomColor = (usedColors) => {
  let color;
  do {
    color = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
  } while (
    usedColors.some(
      (c) => c.r === color.r && c.g === color.g && c.b === color.b
    )
  );
  return color;
};

class TrackList extends Component {
  state = { activeTab: 0, teamColors: {} };

  changeTab = (tabID) => () => {
    this.setState({ activeTab: tabID });
  };

  handleAddPlayerToTeam = (teamId, playerId) => {
    const { addPlayerToTeam, teams, players } = this.props;


    addPlayerToTeam(teamId, playerId);


    const usedColors = Object.values(this.state.teamColors);

   
    const newTeamColor = generateRandomColor(usedColors);

   
    this.setState((prevState) => ({
      teamColors: {
        ...prevState.teamColors,
        [teamId]: prevState.teamColors[teamId] || newTeamColor,
      },
    }));

  
    const selectedPlayer = players.find((p) => p.id === parseInt(playerId));
    if (selectedPlayer) {
      selectedPlayer.color = this.state.teamColors[teamId] || newTeamColor;
    }
  };

  render() {
    const { children, groups, teams, addTeam, players } = this.props;
    const { teamColors } = this.state;

    return (
      <div className="TrackList">
        <div className="TrackListTabs">
          <Button
            className={this.state.activeTab === 0 ? "active" : ""}
            onClick={this.changeTab(0)}
          >
            Players
          </Button>
          <Button
            className={this.state.activeTab === 1 ? "active" : ""}
            onClick={this.changeTab(1)}
          >
            Teams
          </Button>
          <Button
            className={this.state.activeTab === 2 ? "active" : ""}
            onClick={this.changeTab(2)}
          >
            Ball
          </Button>
        </div>

        <div className="TrackListList">
          {/* Players */}
          <div className={this.state.activeTab === 0 ? "" : "inactive"}>
            {children}
          </div>

          {/* Teams */}
          <div className={this.state.activeTab === 1 ? "" : "inactive"}>
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
                  {team.players && team.players.length > 0 ? (
                    team.players.map((player) => (
                      <TrackListItemPlayer
                        key={player.id}
                        playerBox={{ my: { key: player.id, selected: false } }}
                        name={player.name}
                        changeSelection={() => {}}
                        setName={() => {}}
                        blink={() => {}}
                        delete={() => {}}
                        color={teamColors[team.id] || { r: 255, g: 255, b: 255 }}
                        handleModalOpen={() => {}}
                      />
                    ))
                  ) : (
                    <p>No players added to this team yet.</p>
                  )}
                </div>
                {/* Add player dropdown */}
                <select
                  onChange={(e) =>
                    this.handleAddPlayerToTeam(team.id, e.target.value)
                  }
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
            <Button onClick={addTeam}>Add Team</Button>
          </div>

          {/* Ball */}
          <div className={this.state.activeTab === 2 ? "" : "inactive"}>
            {groups}
          </div>
        </div>
      </div>
    );
  }
}

export default TrackList;
