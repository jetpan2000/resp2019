import http from 'odiss-http-client';
import { searchByOptions } from './search';

const resourceUrl = '/api/plantsGrid';

export function getAll() {
    var searchPromise = searchByOptions({
        entityName: 'Plant',
        pageSize: 100
    });

    return searchPromise.then(data => data.records);
}

export function getGLAccountNumbers(plantId) {
    return http.get(`${resourceUrl}/${plantId}/GLAccountNumbers`).then(response => response.data);
}

export function validateGlAccountNumber(accountNumber, plantId) {
    return http.get(`${resourceUrl}/${plantId}/ValidateGlAccountNumber/${accountNumber}`).then(response => response.data)
}