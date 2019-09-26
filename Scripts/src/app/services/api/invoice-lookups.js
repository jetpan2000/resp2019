import http, { odissSearch } from 'odiss-http-client';

const resourceUrl = '/api/POHeaders';

export function searchInvoiceItemNumbers(companyCode, poNumber, itemNumber, vendorPartNumber, pageSize = 10) {
    var searchParameters = { 'PurchaseOrder.Equals': poNumber, 'CompanyCode.Equals': companyCode };
    var sortings = { PurchaseOrder: 'Ascending' };

    if (itemNumber) {
        searchParameters = {...searchParameters, 'POItem.StartsWith': itemNumber};
        sortings = { ...sortings, POItem: 'Ascending' };
    }

    if (vendorPartNumber) {
        searchParameters = {...searchParameters, 'VendorPartNumber.StartsWith': vendorPartNumber};
        sortings = { ...sortings, VendorPartNumber: 'Ascending' };
    }

    var searchOptions = {
        searchParameters,
        pageSize,
        sortings
    }

    return http.post(`${resourceUrl}/searchInvoiceItems`, searchOptions).then(response => response.data);
}

export function searchPartNumbers({ companyCode, plantId, poNumber, pageSize = 10 } = {}) {
    var searchParameters = {};

    if (companyCode) {
        searchParameters = { ...searchParameters, 'CompanyCode.Equals': companyCode };
    }

    if (plantId) {
        searchParameters = { ...searchParameters, 'PlantId.Equals': plantId };
    }

    if (poNumber) {
        searchParameters = { ...searchParameters, 'PurchaseOrder.Equals': poNumber };
    }

    var sortings = { Number: 'Ascending' };

    var searchOptions = {
        searchParameters,
        pageSize,
        sortings
    }

    return odissSearch(`${resourceUrl}/searchPartNumbers`, searchOptions).then(response => response.data);
}

export function searchPurchaseOrders(searchString, companyCode) {
    var searchOptions = {
        searchParameters: { PurchaseOrder: searchString, CompanyCode: companyCode },
        pageSize: 10,
        sortings: {
            PurchaseOrder: 'Ascending'
        }
    }

    return odissSearch(`${resourceUrl}/search`, searchOptions).then(response => response.data);
}