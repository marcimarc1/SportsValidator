import React, { Component } from "react";
import "./NewTrackingEditor.css";
import { Button } from "@material-ui/core";
import TrackListItemPlayer from "./TrackListItemPlayer";


class TrackList extends Component {
  state = { activeTab: 0 };

  changeTab = (tabID) => () => {
    this.setState({ activeTab: tabID });
  };

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
    const { children, groups, teams, addTeam, addPlayerToTeam, players, teamColors, setName,deletePlayer, handleModalOpen, blink } =
      this.props;
      
      const { activeTab, newTeamColor } = this.state;
    
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
  {React.Children.map(children, (child) =>
    React.cloneElement(child, { setName })
  )}
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
        {team.players.map((player) => {
          // Find the corresponding playerBox from playerList
          const playerBox = React.Children.toArray(children).find(
            (child) =>
              child.props.playerBox.my.key === player.id
          )?.props.playerBox;

          return (
            <TrackListItemPlayer
              key={player.id}
              playerBox={playerBox || { my: { key: player.id, selected: false } }} 
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
   <h4>Add New Team</h4>
              <input
                type="color"
                value={newTeamColor}
                onChange={this.handleColorChange}
              />
              <Button onClick={this.handleAddTeam}>Add Team</Button>
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
