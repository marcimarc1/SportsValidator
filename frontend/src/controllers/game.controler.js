import api from './api'

api.baseURL = api.baseURL+"game/"

export function getGame(id) {
    return api.get(`${id}`)
}

export function addGame(game) {
    return api.post(``, JSON.stringify(game));
}

export function updateGame(id, game) {
    return api.update(`${id}`, JSON.stringify(game))
}

export function deleteGame(id) {
    return api.delete(`${id}`)
}

export function getGames(){
    return api.get('')
}