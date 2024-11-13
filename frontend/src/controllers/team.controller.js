import api from './api'

api.baseURL = api.baseURL+"team/"

export function getTeam(id) {
    return api.get(`${id}`)
}

export function addTeam(team) {
    return api.post(``, JSON.stringify(team));
}

export function updateTeam(id, team) {
    return api.update(`${id}`, JSON.stringify(team))
}

export function deleteTeam(id) {
    return api.delete(`${id}`)
}