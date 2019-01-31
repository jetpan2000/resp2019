import http from './http-client';

export function search(appId, parameters, page, pageSize) {
    return http.post('/api/documents/search', {
        applicationId: appId,
        parameters: parameters,
        page: page,
        pageSize: pageSize
    }).then(response => response.data);
}

export function getById(documentId) {
    return http.get(`/api/documents/${documentId}`).then(response => response.data);
}

export function voidDocument(documentId, referenceNumber, reason) {
    var data = {
        documentId: documentId,
        referenceNumber: referenceNumber,
        reason: reason
    };

    return http.post('/api/documentVoid', data);
}

export function findMergeByTicketNumber(ticketNumber) {
    return http.get(`/api/merge/findByTicketNumber/${ticketNumber}`).then(response => response.data);
}

export function verifyBOL(ticketNumber, plantNumber) {
    return http.post('/api/documents/verifyBOL', {
        ticketNumber: ticketNumber,
        plantNumber: plantNumber
    }).then(response => response.data);
}

export function updateBOL(documentId, ticketNumber, plantNumber) {
    return http.post(`/api/documents/UpdateBOL/${documentId}`, {
        ticketNumber: ticketNumber,
        plantNumber: plantNumber
    }).then(response => response.data);
}

export function uploadBOL(mergeId, file) {
    var formData = new FormData();
    formData.append(file, file);

    return http.post(`/api/documents/UploadBOL/${mergeId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}