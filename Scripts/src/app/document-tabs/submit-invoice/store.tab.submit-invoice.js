import { observable, action, toJS, computed, reaction } from 'mobx';
import { find, extend } from 'lodash-es';
import * as documentSvc from '../../services/api/documents';
import { isBlank } from 'string-helper';

import { AppGridSvc as appGridSvc } from 'odiss-app-grid';
import { FieldRendererHelper } from 'odiss-field-renderer';
const { mapFieldForOdissGrid } = FieldRendererHelper;

import { buildInvoiceHeaderFieldOverrides, buildLineItemFieldOverrides, buildInvoiceHeaderValidations, buildLineItemValidations } from '../field-overrides'
import * as usersSvc from '../../services/api/users';
import globalSearch, { searchByOptions } from '../../services/api/search';
import globalSearchResolver from '../global-search-resolver';

import '../document-typedefs';
import './typedefs.submit-invoice';

const DEFAULT_CURRENCY_CODE = 'CA';

const INITIAL_DOC_STATE = {
    plantId: null,
    vendorId: null,
    isConfidential: false,
    lineItems: [],
    invoiceStatusCode: 'Received',
    currencyCode: DEFAULT_CURRENCY_CODE
};

/**
 * Mobx Store for the Submit Invoice state
 */
class SubmitInvoiceStore {
    constructor() {
        this.init();

        this.loadLookupOptions = this.loadLookupOptions.bind(this);
        this.receiveDocumentUpdate = this.receiveDocumentUpdate.bind(this);
        this.receiveLineItemsUpdate = this.receiveLineItemsUpdate.bind(this);
        this.receiveFileUploadUpdate = this.receiveFileUploadUpdate.bind(this);
        this.onReceivingError = this.onReceivingError.bind(this);
        this.save = this.save.bind(this);

        this.overrideBuilder = new FieldOverrideBuilder(this);

        this.lineItemAutoCalcDisposer = computed(() => this.document && this.document.lineItems.map(({quantity, unitPrice}, index) => ({index, quantity, unitPrice}))).observe(({newValue, oldValue}) => {
            if (!oldValue) {
                return;
            }

            newValue.forEach(({index, quantity, unitPrice}) => {
                var lineItem = this.document.lineItems[index];
                var old = oldValue[index];

                if (!old) {
                    return;
                }

                if (old.quantity !== quantity || old.unitPrice !== unitPrice) {
                    var autoCalcValue = (Number(quantity) * Number(unitPrice));

                    if (!isNaN(autoCalcValue)) {
                        lineItem.totalAmount = (Math.round(autoCalcValue * 100)/100).toFixed(2);
                    }
                }
            });
        });
    }

    get appData () {
        return window.__appData;
    }

    get applicationIdentifier () {
        return this.appData.ID;
    }

    get fields() {
        return this.appData.Fields.filter(x => !x.NotVisibleFilter).map(field => mapFieldForOdissGrid(field, toJS(this.lookupOptions.get(field.ID))));
    }

    get lineItemFields() {
        return this.appData.FieldsItems.filter(x => !x.NotVisibleFilter).map(field => mapFieldForOdissGrid(field, toJS(this.lookupOptions.get(field.ID))));
    }

    propertiesValidator = null;
    lineItemValidators = [];

    @observable reactError = null

    onReceivingError(error) {
        this.reactError = error;
    }

    /** @type {DocumentInvoice} */
    @observable document = INITIAL_DOC_STATE;

    /** @type {File} */
    @observable file = null;

    /** @type {Boolean} */
    @observable isLoading = false;

    /** @type {FileUploadStatus} */
    @observable fileUploadStatus = null;

    /** @type {SubmissionAlert} */
    @observable submissionAlert = 'NONE';

    /** @type {ValidationState} */
    @observable validationState = 'VALID';

    /** @type {Plant} */
    @observable plant = null;

    /** @type {Vendor} */
    @observable vendor = null;

    @observable glCodeOptions = [];
    @observable partNumberOptions = [];

    @observable lookupOptions = observable.map();

    @observable userCanViewConfidentialDocument = false;

    /** @type {Array<Plant>} */
    @observable plantOptions = [];

    /** @returns {Currency} */
    @computed get currency() {
        if (!this.document) {
            return null;
        }

        var currencyField = find(this.fields, x => x.mapTo === 'CurrencyCode');
        var currencies = this.lookupOptions.get(currencyField.name);

        return find(currencies, x => x.code === this.document.currencyCode);
    }

    @action async init() {
        reaction(() => this.document && this.document.plantId, plantId => {
            this.plant = this.plantOptions.find(x => x.id === plantId);
        });

        reaction(() => this.vendor, ({currencyCode}) => {
            this.document.currencyCode = !isBlank(currencyCode) ? currencyCode : DEFAULT_CURRENCY_CODE;
        });

        this.userCanViewConfidentialDocument = await usersSvc.hasPermission('ViewConfidentialDocuments');
        await this.loadLookupOptions();
    }

    @action async loadLookupOptions() {
        var fieldsNeedingLookup = this.appData.Fields.filter(field => field.Type === 5);

        await Promise.all(fieldsNeedingLookup.map(async (field) => {
            try {
                var lookupCollection = await appGridSvc.getLookupOptions(field);
                this.lookupOptions.set(field.ID, lookupCollection);
            }
            catch (e) {
                this.lookupOptions.set(field.ID, []);
            }
        }));

        this.plantOptions = await searchByOptions({
            entityName: 'Plant',
            callingApplicationIdentifier: this.applicationIdentifier,
            page: 1,
            pageSize: 1000
        }).then(data => data.records);
    }

    @action receiveDocumentUpdate(updatedProperties) {
        delete updatedProperties.currencyCode;
        extend(this.document, updatedProperties);
    }

    @action receiveLineItemsUpdate(updatedLineItems) {
        this.document.lineItems.replace(updatedLineItems);
    }

    /**
     * Callback to receive update from file upload control
     * @param {File} file 
     * @param {FileUploadStatus} fileUploadStatus 
     */
    @action receiveFileUploadUpdate(file, fileUploadStatus) {
        this.file = file;
        this.fileUploadStatus = fileUploadStatus;
    }

    @action async save() {
        var validationResults = await Promise.all([this.propertiesValidator.resolveValidation(), ...this.lineItemValidators.map(x => x.resolveValidation()) ]);

        if (!validationResults.every(x => x === true)) {
            this.validationState = 'INVALID';
            return; // Do not save
        }

        if (this.file === null || this.file === undefined) {
            this.validationState = 'FILE_MISSING';
            return; // Do not save
        }

        try {
            this.isLoading = true;
            var document = toJS(this.document);
            
            await documentSvc.uploadDocument(document, this.file);
            this.submissionAlert = 'SUCCESS';
            this.validationState = 'VALID';

            top.postal.publish({
                channel: 'document-viewer',
                topic: 'document.uploaded',
                data: { 
                    document
                }
            });
        }
        catch (e) {
            this.submissionAlert = 'SERVER_ERROR';
        }
        finally {
            this.isLoading = false;
        }
    }

    @action clear() {
        this.document = INITIAL_DOC_STATE;

        this.validationState = 'VALID';
        this.submissionAlert = 'NONE';
        this.reactError = null;
    }

    buildInvoiceHeaderFieldOverrides() {
        return [ ...this.overrideBuilder.buildInvoiceHeaderFieldOverrides(), ...[{
            name: '1d1e005f-7410-e911-842c-005056820bd7',
            friendlyIdentifier: 'plant',
            editable: true,
            order: {
                editor: 3
            },
            visibility: {
                editor: true
            },
            lookupPromiseResolver: (field, query, isSearchingForExisting) => {
                return new Promise(resolve => {
                    var data = toJS(this.plantOptions);
                    resolve(data);
                });
            },
            lookupSearchOnClick: true
        }, {
            name: '947c8c8d-7010-e911-842c-005056820bd7',
            friendlyIdentifier: 'vendor',
            editable: true,
            order: {
                editor: 4
            },
            visibility: {
                editor: true
            },
            onSelectCallback: (selectedVendor) => {
                this.vendor = selectedVendor;
            }
        }, {
            name: 'c0a7c606-e7f3-e811-822e-d89ef34a256d',
            friendlyIdentifier: 'po-number',
            order: {
                editor: 5
            }
        }, {
            name: '856183ae-e40a-e911-842c-005056820bd7',
            friendlyIdentifier: 'currency',
            visibility: {
                editor: true
            }
        }]];
    }

    buildLineItemFieldOverrides() {
        return this.overrideBuilder.buildLineItemFieldOverrides({
            getGlCodeOptions: () => toJS(store.glCodeOptions),
            getPartNumberOptions: () => toJS(store.partNumberOptions)
        });
    }
}

class FieldOverrideBuilder {
    /** @param {SubmitInvoiceStore} store */
    constructor (store) {
        this.store = store;
    }

    buildInvoiceHeaderFieldOverrides() {
        const { store } = this;
        const { applicationIdentifier } = store;

        return buildInvoiceHeaderFieldOverrides({
            applicationIdentifier,
            getPlant: () => store.plant,
            getVendor: () => store.vendor,
            getCanUserViewConfidentialDocuments: () => store.userCanViewConfidentialDocument,
            getCurrency: () => store.currency,
            debitCreditProps: {
                getIsCredit: () => store.document && store.document.isCredit,
                setIsCredit: (value) => { store.document.isCredit = value; },
                setDebitCreditString: (value) => { store.document.debitCredit = value; }
            }
        });
    }
    
    buildLineItemFieldOverrides() {
        const { store } = this;

        return buildLineItemFieldOverrides({
            getGlCodeOptions: () => toJS(store.glCodeOptions),
            getPartNumberOptions: () => toJS(store.partNumberOptions),
            getCurrency: () => store.currency
        });
    }
}

export default SubmitInvoiceStore;