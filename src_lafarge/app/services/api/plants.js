import http from './http-client';

const resourceUrl = '/api/plants';

export function getAll() {
    return http.get(resourceUrl).then(response => response.data);
}

export function create(plant) {
    return http.post(resourceUrl, plant);
}

export function update(plant) {
    return http.put(`${resourceUrl}/${plant.id}`, plant);
}

export function findByPlantNumber(plantNumber) {
    return http.get(`${resourceUrl}/FindByPlantNumber/${plantNumber}`).then(response => response.data);
}