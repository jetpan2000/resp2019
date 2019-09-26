import http from 'odiss-http-client';

const url = '/api/search';

/**
 * @typedef SearchOptions
 * @property {string} entityName
 * @property {Object.<string, any>} searchParameters
 * @property {number} pageSize
 * @property {any} sortings
 * @property {any} additionalArguments
 * @property {string} callingApplicationIdentifier
 */

/** @param {SearchOptions} searchOptions */
export function searchByOptions(searchOptions) {
    return http.post(url, searchOptions).then(response => response.data);
}

export default function search(field, query, { searchParameters = {}, callingApplicationIdentifier = null }) {
    const { 
        filterData: { 
            search: { 
                entityName, maxRecords: pageSize, sortOrder: sortings, additionalArguments
            } 
        } 
    } = field;

    var inputSearchParameter = {};
    inputSearchParameter[field.name] = query;

    /** @type {SearchOptions} */
    const searchOptions = {
        entityName,
        searchParameters: {
            ...inputSearchParameter,
            ...searchParameters
        },
        pageSize,
        sortings,
        additionalArguments,
        callingApplicationIdentifier
    };
    
    return searchByOptions(searchOptions);
}