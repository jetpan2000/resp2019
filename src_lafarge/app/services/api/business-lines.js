import http from './http-client';

export function getAll() {
    return http.get('/api/businesslines').then(response => response.data);
}