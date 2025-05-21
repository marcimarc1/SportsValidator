import api from "../api/api";

class ImExport {
    static prefix = 'imexport';

    static async GetPlayerCSV(videoId) {
        return api.get(`/${this.prefix}/GetPlayerCSV/${videoId}`,{
            responseType: "blob"
        });
    }

    static async GetBallCSV(videoId) {
        return api.get(`/${this.prefix}/GetBallCSV/${videoId}`,{
            responseType: "blob"
        });
    }

    static async GetHomographieJSON(videoId) {
        return api.get(`/${this.prefix}/GetHomographieJSON/${videoId}`);
    }
}

export default ImExport;