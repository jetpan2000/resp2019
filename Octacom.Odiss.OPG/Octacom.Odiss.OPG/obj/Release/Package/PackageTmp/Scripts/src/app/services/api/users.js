import http from './http-client';

export function hasPermission(permission) {
    return http.get('/api/users/hasPermission/' + permission).then(results => results.data);
}