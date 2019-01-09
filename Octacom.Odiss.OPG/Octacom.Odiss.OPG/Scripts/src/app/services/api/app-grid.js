import http from './http-client';

const defaultResourceUrl = '/api/app-grid';

function hasCustomAPI() {
    return window.__appData && window.__appData.Custom && window.__appData.Custom.DataGridAPI;
}

function getResourceUrl(appId) {
    return hasCustomAPI() ? window.__appData.Custom.DataGridAPI : `${defaultResourceUrl}/${appId}`;
}

export function getAll(appId) {
    return http.get(getResourceUrl(appId)).then(response => response.data);
}

export function create(data, appId) {
    return http.post(getResourceUrl(appId), data)
}

export function update(data, appId) {
    return http.put(getResourceUrl(appId), data)
}

export function remove(key, appId) {
    if (hasCustomAPI()) {
        return http.delete(`${getResourceUrl}/{key}`);
    }
    else {
        return http.delete(`${getResourceUrl(appId)}?key=${key}`)
    }
}