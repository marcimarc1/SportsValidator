import api from './api'

api.baseURL = api.baseURL+"video/"

export async function upload(importRequestDto){
    return api.post(`addVideo`, JSON.stringify(importRequestDto));
}

export function deleteVideo(id) {
    return api.delete(`${id}`)
}

export function getVideoByGameId(id) {
    return api.get(`list/${id}`)
}
