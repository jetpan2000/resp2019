import http from 'odiss-http-client';

const resourceUrl = '/api/documents';

export function getById(documentId) {
    var virtualPath = getVirtualPath();
    return http.get(`${virtualPath + resourceUrl}/${documentId}`).then(response => response.data);
}

export function update(document) {
    return http.put(resourceUrl, document);
}

export function setToPendingApproval(documentId) {
    return http.post(`${resourceUrl}/${documentId}/setToPendingApproval`);
}

export function approve(documentId) {
    return http.post(`${resourceUrl}/${documentId}/approve`);
}

export function submitForApproval(documentId) {
    return http.post(`${resourceUrl}/${documentId}/submitForApproval`);
}

export function reject(documentId) {
    return http.post(`${resourceUrl}/${documentId}/reject`);
}

export function voidDocument(documentId) {
    return http.post(`${resourceUrl}/${documentId}/void`);
}

export function setToOnHold(documentId) {
    return http.post(`${resourceUrl}/${documentId}/setToOnHold`);
}

export function undo(documentId) {
    return http.post(`${resourceUrl}/${documentId}/undo`);
}

export function getHistory(documentId) { 
    var virtualpart = getVirtualPath();
    return http.get(`${virtualpart + resourceUrl}/${documentId}/history`).then(response => response.data);
}

export function getDocumentStatusSummary() {
    var virtualpart = getVirtualPath();
    console.log(`${virtualpart + resourceUrl}/DocumentStatusSummary`);

    return http.get(`${virtualpart + resourceUrl}/DocumentStatusSummary`).then(response => response.data)
}

export function getExceptionCount() {
    var virtualpart = getVirtualPath();
    return http.get(`${virtualpart + resourceUrl}/exceptionCount`).then(response => response.data)
}

export function forwardToOtherPlant(documentId, plantId) {
    return http.post(`${resourceUrl}/${documentId}/forwardToOtherPlant/${plantId}`);
}

export function submitToCMS(documentId) {
    return http.post(`${resourceUrl}/${documentId}/submitToCMS`).then(response => response.data);
}

export function resubmit(documentId) {
    return http.post(`${resourceUrl}/${documentId}/resubmit`).then(response => response.data);
}

export function getAllowedActions(documentId) {
    return http.get(`${resourceUrl}/${documentId}/AvailableActions`).then(response => response.data);
}

/**
 * Upload Document to the server
 * @param {Object} document 
 * @param {File} file 
 */
export function uploadDocument(document, file) {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('documentData', JSON.stringify(document));

    return http.post(`${resourceUrl}/submit`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export function getVirtualPath()
{
    var ind =  window.__pageBaseUrl.indexOf('/app/');
    var virtualpart = "";

    if (ind > 0){// has virtual folder
        virtualpart = __pageBaseUrl.substring(0, ind);
    }

    return virtualpart;
}

export function uploadSupportingDocument(documentId, description, file) {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    var virtualpart = getVirtualPath();
    var ind =  OdissViewerBase.baseUrl.indexOf('/app/');
    var appId = OdissViewerBase.baseUrl.substring(ind + 5).replace('/','');
    console.log('appId:' + appId + '; virtual:' + virtualpart);
    formData.append('appId', appId);

    console.log(`${virtualpart + resourceUrl}/${documentId}/uploadSupportingDocument`);

    return http.post(`${virtualpart + resourceUrl}/${documentId}/uploadSupportingDocument`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}