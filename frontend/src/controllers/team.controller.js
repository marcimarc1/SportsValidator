import api from "../api/api";

class TeamController {
  static prefix = "/team";

  static async getTeamList() {
    return api.get(`${this.prefix}/list/`, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
}
export default TeamController;
