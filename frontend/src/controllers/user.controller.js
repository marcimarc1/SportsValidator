import api from "./api";

api.baseURL = api.baseURL + "user/";

export function getUser(id) {
  return api.get(`${id}`);
}

export function addUser(user) {
  return api.post(``, JSON.stringify(user));
}

export function updateUser(id, user) {
  return api.update(`${id}`, JSON.stringify(user));
}

export function deleteUser(id) {
  return api.delete(`${id}`);
}
