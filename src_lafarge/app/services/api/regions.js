import http from './http-client';

export function getAll() {
    return http.get('/api/regions').then(response => response.data);
}