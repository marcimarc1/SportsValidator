import api from "../api/api";

class VideoController {
  static prefix = "/video";

  static async getVideoFileById(videoId) {
    return api.get(`${this.prefix}/get_video_file/${videoId}`, {
      responseType: "blob",
    });
  }

  static async getById(videoId) {
    return api.get(`${this.prefix}/${videoId}`);
  }

  static async getVideoList(request) {
    return api.post(`${this.prefix}/list/`, request, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
}
export default VideoController;
