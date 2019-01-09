import http from './http-client';

export function getById(documentId) {
    var url = window.__baseUrl + 'api/documents/' + documentId ;
    console.log('base url:' + window.__baseUrl + '; getting to:' + url);

    return http.get(url).then(response => response.data);
}

export function update(document) {
    var url = window.__baseUrl + 'api/documents/upsert' ;
    console.log('base url:' + window.__baseUrl + '; posting to doc:' + url);
    console.log(url);
    debugger;
    return http.post(url, document);
}