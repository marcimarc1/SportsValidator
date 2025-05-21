import api from "./api";

api.baseURL = api.baseURL + "sport/";

export function getSport(id) {
  return api.get(`${id}`);
}

export function addSport(sport) {
  return api.post(``, JSON.stringify(sport));
}

export function updateSport(id, sport) {
  return api.update(`${id}`, JSON.stringify(sport));
}

export function deleteSport(id) {
  return api.delete(`${id}`);
}
