import globalSearch from '../services/api/search';

const globalSearchResolver = (field, query, searchParameters, appIdentifier) => {
    return globalSearch(field, query, { 
        searchParameters,
        callingApplicationIdentifier: appIdentifier
    }).then(data => data.records);
};

export default globalSearchResolver;