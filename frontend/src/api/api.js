import axios from "axios";

const api = axios.create({
  baseURL: "http://0.0.0.0:8080/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

export default api;
