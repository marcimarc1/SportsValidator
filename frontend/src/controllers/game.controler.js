import api from "../api/api";

class GameController {
    static prefix = '/team';

    static async addGame(data) {
        return api.post(
            'http://localhost:8080/game/',
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            }
            );
    }

    static async updateGame(data, id) {
        return api.post(
            `http://localhost:8080/game/${id}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            }
        );
    }

}
export default GameController;