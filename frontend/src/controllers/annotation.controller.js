import api from './api'

api.baseURL = api.baseURL+"annotation/"

export function getAnnotations(id) {
    return api.get(`${id}`)
}