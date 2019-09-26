import React from 'react';
import Decimal from 'decimal';
import { toJS } from 'mobx';
import { isDecimal } from 'validator';
import { isArray } from 'lodash';
import moment from 'moment';

import { FIELD_TYPES, LOOKUP_TYPES, OdissFieldRenderer } from 'odiss-field-renderer';

import glCodeFormatter from '../helpers/gl-code-formatter';

import DebitCredit from './debit-credit';
import PartNumber from './part-number';
import globalSearchResolver from './global-search-resolver';

import './document-typedefs';

/** @type {(getCurrency: () => Currency) => import('odiss-npm-symlinks/odiss-field-renderer/types').OdissFieldRenderer.Field} */
const buildCurrencyFieldTypeOverride = (getCurrency) => ({
    selector: ({ dataType }) => dataType === FIELD_TYPES.CURRENCY,
    CustomElement: ({ field, fieldRenderer }) => {
        fieldRenderer.currency = getCurrency();

        return fieldRenderer.Currency(field);
    }
});

var currencyElementLastBuiltAt = moment(0);

const buildCurrencyElement = (currency) => ({field, fieldRenderer}) => {
    var newValue = currency.code;
    var oldValue = fieldRenderer.component.state[field.name];
    var secondsSinceLastExec = moment().diff(currencyElementLastBuiltAt, 'seconds');

    if (newValue != oldValue && secondsSinceLastExec > 5) {
        var changeObj = {};
        changeObj[field.name] = newValue;
        fieldRenderer.component.setState(changeObj);
        currencyElementLastBuiltAt = moment();
    }

    return fieldRenderer.Dropdown(field);
}

/** 
 * @param {BuildInvoiceHeaderFieldOverrideParameters} parameters
 * @returns {Array<OdissFieldRenderer>}
 * */
const buildInvoiceHeaderFieldOverrides = ({ getPlant, getVendor, getCanUserViewConfidentialDocuments, getCurrency, debitCreditProps, applicationIdentifier }) => [{
    // PO #
    name: 'c0a7c606-e7f3-e811-822e-d89ef34a256d|2d767887-dbca-4fa7-861f-b6b7510e3eab|fd8a1bee-5a40-471a-8e31-7dba8ea6dd32|c0a7c606-e7f3-e811-822e-d89ef34a202d',
    friendlyIdentifier: 'po-number',
    lookupValueField: 'purchaseOrder',
    lookupPromiseResolver: (field, query, isSearchingForExisting) => {
        const { companyCode: CompanyCode } = getPlant() || {};
        const { vendorNumber } = getVendor() || {};

        var parameters = { CompanyCode };
        if (vendorNumber) {
            parameters['RemitToVendorCode OR VendorCode'] = vendorNumber;
        }

        if (isSearchingForExisting) {
            parameters = {};
        }

        return globalSearchResolver(field, query, parameters, applicationIdentifier);
    },
    lookupFindExistingItemBySearchPromise: true
}, {
    // Vendor #
    name: '947c8c8d-7010-e911-842c-005056820bd7|947c8c8d-7010-e911-842c-005056822bd7|947c8c8d-7010-e911-842c-005056820bd6|9ae6cd34-5b13-e911-842c-005056820bd7',
    friendlyIdentifier: 'vendor',
    lookupPromiseResolver: (field, query, isSearchingForExisting) => {
        const { companyCode: CompanyCode } = getPlant() || {};

        return globalSearchResolver(field, query, isSearchingForExisting ? {} : { CompanyCode }, applicationIdentifier);
    },
    lookupFindExistingItemBySearchPromise: true
}, {
    name: '14642531-41cd-4be4-8b39-001e4821c0c4',
    friendlyIdentifier: 'exception-codes',
    CustomElement: ({value}) => {
        const exceptionCodes = toJS(value);
        if (!isArray(exceptionCodes)) {
            return <div></div>;
        }

        return <ul style={{ padding: '2px' }}>
            { exceptionCodes.map(({exception: { description }, exceptionCode}) => <li key={exceptionCode}>{exceptionCode} - {description}</li>) }
        </ul>
    }
}, {
    name: '896183ae-e40a-e911-842c-005056820bd7|5d24d8e9-c0cf-42be-8d50-668a984b1aa8|0006a605-061d-4d48-bef1-88189d758f33|896183ae-e40a-e911-842c-005056820bd2',
    friendlyIdentifier: 'debit-credit',
    CustomElement: ({props}) => {
        return <DebitCredit {...debitCreditProps} {...props} />;
    }
}, {
    // Invoice Status
    name: '1507f4d9-e7f3-e811-822e-d89ef34a256d|6f2d3372-c6bb-47fd-8d63-284f0ce22a83|772effcf-3db7-4888-aa7a-5216ae191777|1507f4d9-e7f3-e811-822e-d89ef34a212d',
    friendlyIdentifier: 'invoice-status',
    lookupRest: '/api/invoicestatuses'
}, {
    // Is Confidential
    name: '47a2967e-2e35-e911-842e-005056820bd7',
    editable: getCanUserViewConfidentialDocuments(),
    mapTo: 'IsDocumentConfidential'
}, {
    name: '856183ae-e40a-e911-842c-005056820bd7|0bc4b014-7e9a-44bf-b794-ef7d98a12364|105dba1e-db52-4436-b496-fa6f8d71de84|856183ae-e40a-e911-842c-005056815bd7',
    CustomElement: buildCurrencyElement(getCurrency())
}, buildCurrencyFieldTypeOverride(getCurrency)];

/** 
 * @param {BuildLineItemFieldOverrideParameters} parameters
 * @returns {Array<OdissFieldRenderer>}
 */
const buildLineItemFieldOverrides = ({ getGlCodeOptions, getPartNumberOptions, getCurrency }) => [{
    name: '746a3545-3cf7-e811-822e-d89ef34a256d|19375c8a-1008-450a-9056-2cbfb0029ab4|054e30c1-a645-47c9-9ee9-7921c118677a|746a3545-3cf7-e811-822e-d89ef34a236d',
    friendlyIdentifier: 'gl-account-number',
    lookupType: LOOKUP_TYPES.AUTOCOMPLETE,
    filterData: {
        displayFormat: '{formattedAccountNumber} - {description}'
    },
    lookupValueField: 'accountNumber',
    lookupValueFormatter: glCodeFormatter,
    lookupPromiseResolver: () => {
        return new Promise(resolve => {
            resolve(getGlCodeOptions());
        });
    },
    setValueOnInputChange: (input, setValue) => {
        var dashesStripped = input.split('-').join('');
        setValue(dashesStripped);
    },
    className: 'gl-account-number'
 },{
    name: '443cfb60-3cf7-e811-822e-d89ef34a256d|18d8e1b0-1a4a-4284-bcfb-f17d63885bc7|c4bbe481-5c7a-4d20-aca2-d1b9dbd30baa|443cfb60-3cf7-e811-822e-d89ef34a266d',
    friendlyIdentifier: 'part-number',
    lookupValueField: 'number',
    // below is an example of how to render the field with a pre-loading of lookup data if dataset is not very large after applying filters
    // it's not used in this case as it makes more sense to have the store retrieve this data just once for all instances of this control
    //fetchLookupAhead: () => (store.document && { plantNumber: store.document.plantNumber, poNumber: store.document.poNumber }) || {},
    lookupSearchOnClick: true,
    lookupPromiseResolver: () => {
        return new Promise(resolve => {
            resolve(getPartNumberOptions());
        });
    },
    className: 'part-number',
    CustomElement: ({field, fieldRenderer}) => <PartNumber field={field} fieldRenderer={fieldRenderer} partNumberOptions={getPartNumberOptions()} />
}, {
    name: '453cfb60-3cf7-e811-822e-d89ef34a256d|f92951c6-e60a-e911-842c-005056820bd7|a2195b21-69dc-4bc5-92f2-fd6155a5a563|96b8db4d-4856-457b-8354-6b8af843e38a|e7983d1b-b01f-4b6c-bc7c-4cb7b9b59909|7595d635-a2ff-401e-89a4-fc0bfea54f57|453cfb60-3cf7-e811-822e-d89ef34a276d|f92951c6-e60a-e911-842c-005056828bd7',
    friendlyIdentifier: 'quantity+unit-price+line-total',
    shrinkToFit: true
}, {
    name: 'bb859a73-3cf7-e811-822e-d89ef34a256d|618637e1-1f04-4c95-a9c4-24343ee9ad17|cc5d9b28-7740-43e0-a659-9bea5809b80c|bb859a73-3cf7-e811-822e-d89ef34a296d',
    friendlyIdentifier: 'unit-price',
    className: 'unit-price',
    numberOfDecimals: 5
}, buildCurrencyFieldTypeOverride(getCurrency)]

/**
 * @param {BuildInvoiceHeaderValidationsParameters} parameters
 */
const buildInvoiceHeaderValidations = ({ getDocument }) => [{
    field: '886183ae-e40a-e911-842c-005056820bd7|885f9797-8715-49d4-ac76-fd983233e9b1|94adfdb2-735b-4f06-bd7e-3cd32a46cb39',
    method: (inputValue) => {
        const document = getDocument();

        if (isNaN(inputValue)) {
            return false;
        }
        var value = Decimal(inputValue);

        const { gsthst, pstqst, lineItems } = document;
        const lineItemTotalAmounts = lineItems.map(x => Decimal(x.totalAmount));

        var lineTotals = lineItemTotalAmounts.length > 0 ? lineItemTotalAmounts.reduce((accumulator, currentValue) => {
            return currentValue.add(accumulator);
        }) : Decimal(0);

        const gsthstNumber = Decimal(gsthst);
        const pstqstNumber = Decimal(pstqst);
        const totalExpected = lineTotals.add(gsthstNumber).add(pstqstNumber);

        return value.toNumber() === totalExpected.toNumber();
    },
    message: 'Total Amount must equal line number totals + GST/HST + PST/QST',
    validWhen: true
}];

/**
 * @param {BuildLineItemValidationsParameters} parameters
 */
const buildLineItemValidations = ({ getGlCodeOptions }) => [{
    // Quantity
    field: '453cfb60-3cf7-e811-822e-d89ef34a256d|a2195b21-69dc-4bc5-92f2-fd6155a5a563|e7983d1b-b01f-4b6c-bc7c-4cb7b9b59909|453cfb60-3cf7-e811-822e-d89ef34a276d',
    method: (inputValue) => {
        return isDecimal(inputValue, { decimal_digits: '1,2', locale: 'en-US' });
    },
    message: 'Quantity must be a decimal number of maximum two digits',
    validWhen: true
}];

export { 
    buildInvoiceHeaderFieldOverrides, 
    buildLineItemFieldOverrides, 
    buildInvoiceHeaderValidations, 
    buildLineItemValidations,
    globalSearchResolver
};