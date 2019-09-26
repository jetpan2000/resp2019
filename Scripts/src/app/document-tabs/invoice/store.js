import { observable, action, toJS, reaction, computed } from 'mobx';
import { camelCase, isEqual, find, first, isObject } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import http from 'odiss-http-client';
import ALERT from './alert';
import * as documentSvc from '../../services/api/documents';
import * as plantsSvc from '../../services/api/plants';
import { AppGridSvc as appGridSvc } from 'odiss-app-grid';
import * as usersSvc from '../../services/api/users';
import * as invoiceLookupSvc from '../../services/api/invoice-lookups';
import { FieldRendererHelper } from 'odiss-field-renderer';
import * as OdissOld from '../../helpers/odiss-old';
import { isBlank } from 'string-helper';
const { mapFieldForOdissGrid } = FieldRendererHelper;
import ActionResolver from 'odiss-action-resolver';
import FieldOverrideBuilder from './field-override-builder';

const DEFAULT_CURRENCY_CODE = 'CA';

class InvoiceStore {
    constructor () {
        reaction(() => this.document, doc => {
            this.resolveActions();
            window.documentId = doc.guid;
         //   this.plant = this.document.plant;
         //   this.vendor = this.document.vendor;
         //   delete this.document.plant;
         //   delete this.document.vendor;
        });

        reaction(() => toJS(this.document), updatedDoc => {
            if (!isEqual(updatedDoc, this.cleanDocument)) {
                this.isDirty = true;
            }
        });

        reaction(() => this.document && this.document.plantId, async plantId => {
          //  var data = await plantsSvc.getGLAccountNumbers(plantId);
           // this.allowedGlCodes = data.map(d => d.accountNumber);
           // this.glCodeOptions.replace(data);
        });

        reaction(() => this.document && this.document.vendorId, vendorId => {
            if (!this.editPropertiesValidator) {
                return;
            }

            var field = this.lookupFieldTable('vendor');
            this.editPropertiesValidator.removeCustomValidation(field);
        });

        
        reaction(() => this.document && this.document.totalAmount, totalAmount => {
            if (!this.editPropertiesValidator) {
                return;
            }

            var field = this.lookupFieldTable('totalAmount');
            this.editPropertiesValidator.removeCustomValidation(field);
        });
        
        reaction(() => this.document && this.document.poNumber, poNumber => {
            if (!this.editPropertiesValidator) {
                return;
            }

            var field = this.lookupFieldTable('purchaseOrder');
            this.editPropertiesValidator.removeCustomValidation(field);
        });

        reaction(() => {
            // This is the function whose return value the reaction reacts to
            // We need the combination of plantId and poNumber

            if (!this.document) {
                return null;
            }

            const { plantId, poNumber } = this.document;

            return { plantId, poNumber };
        }, async ({plantId, poNumber}) => {
            if (isBlank(poNumber)) {
                this.partNumberOptions.replace([]);
                return;
            }

            var data = await invoiceLookupSvc.searchPartNumbers({ plantId, poNumber, pageSize: 2000 }).then(d => d.records);
            this.partNumberOptions.replace(data);
        });

        reaction(() => this.isReadOnly, value => {
            this.resolveActions();

            // If isReadOnly ever gets the value false then we lock in showing the forward to other plant tab
            // The intention is that it's available to show even if the page later becomes read-only, then it still shows but with disabled fields
            if (value === false) {
                this.showForwardingTab = true;
            }
        });


        this.addLineItem = this.addLineItem.bind(this);
        this.save = this.save.bind(this);
        this.performWorkflowAction = this.performWorkflowAction.bind(this);
        this.setToPendingApproval = this.setToPendingApproval.bind(this);
        this.approve = this.approve.bind(this);
        this.submitForApproval = this.submitForApproval.bind(this);
        this.submitToCMS = this.submitToCMS.bind(this);
        this.reject = this.reject.bind(this);
        this.void = this.void.bind(this);
        this.onHold = this.onHold.bind(this);
        this.undo = this.undo.bind(this);
        this.forwardToOtherPlant = this.forwardToOtherPlant.bind(this);
        this.resubmit = this.resubmit.bind(this);
        this.handleSaveError = this.handleSaveError.bind(this);
        this.lookupFieldTable = this.lookupFieldTable.bind(this);

        this.overrideBuilder = new FieldOverrideBuilder(this);
    }

    cleanDocument = null;
    canRevertHistoryItem = false;
    lineItemValidators = [];

    @observable document = null;
    @observable plant = null;
    @observable vendor = null;
    @observable history = [];
    @observable glCodeOptions = [];
    @observable partNumberOptions = [];
    @observable lookupOptions = observable.map();
    @observable activeAlert = ALERT.NONE;
    @observable activeForwardAlert = ALERT.NONE;
    @observable validationResults = [];
    @observable isLoading = false;
    @observable userCanEditDocument = null;
    @observable userCanViewConfidentialDocument = false;
    @observable showForwardingTab = false;
    @observable isDirty = false;
    @observable isShowingSupportingDocument = false;
    @observable allowedActions = null;
    @observable errorMessage = null;
    @observable validationMessage = null;

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

    @computed get canForward() {
        // TODO - Add additonal logic to prevent forwarding based on AP roles of the user
        return !this.isReadOnly;
    }

    @computed get isReadOnly() {
        return !this.userCanEditDocument || this.document && ['Archived', 'Approved', 'Void'].indexOf(this.document.invoiceStatusCode) > -1;
    }

    @computed get currency() {
        if (!this.document) {
            return null;
        }

        var currencyField = find(this.fields, x => x.mapTo === 'CurrencyCode');
        var currencies = null; //this.lookupOptions.get(currencyField.name);

        return find(currencies, x => x.code === this.document.currencyCode);
    }

    @observable actions = [];

    @action showSupportingDocument(documentId) {
        OdissOld.changeDocumentInViewer(window.__getSupportingDocumentUrl + '/' + documentId);
        this.isShowingSupportingDocument = true;
    }

    @action closeSupportingDocument() {
        OdissOld.changeDocumentToOriginalInViewer();
        this.isShowingSupportingDocument = false;
    }

    @action async loadLookupOptions() {
        var fieldsNeedingLookup = this.appData.Fields.filter(field => field.Type === 5);

        await Promise.all(fieldsNeedingLookup.map(async (field) => {
            try {
                var fieldOverrides = this.overrideBuilder.buildInvoiceHeaderFieldOverrides();
                var override = fieldOverrides.find(x => (x.name || '').indexOf(field.ID) > -1);
                const { lookupRest } = override || {};

                var lookupPromise = lookupRest ? http.get(lookupRest).then(x => x.data) : appGridSvc.getLookupOptions(field);

                var lookupCollection = await lookupPromise;
                this.lookupOptions.set(field.ID, lookupCollection);
            }
            catch (e) {
                this.lookupOptions.set(field.ID, []);
            }
        }));
    }

    @action async loadDocument(documentId) {
        try {
            this.history = await documentSvc.getHistory(documentId);
        }
        catch (e) {}

        var document = await documentSvc.getById(documentId); // {guid: documentId, lineItems:[], currencyCode:'', supportingDocuments: [] } //await documentSvc.getById(documentId);

        this.isDirty = false;
        this.cleanDocument = document;
        this.document = document;
        this.userCanViewConfidentialDocument = true; //await usersSvc.hasPermission('ViewConfidentialDocuments');
        this.userCanEditDocument = true; //await usersSvc.canEditDocument(documentId);
        this.isDirty = false;

        const { history, allowedActions } = this;

        top.postal.publish({
            channel: 'document-viewer',
            topic: 'document.loaded',
            data: { 
                document,
                history,
                allowedActions
            }
        });
    }

    @action reload() {
        this.loadDocument(this.document.guid);
        //this.editPropertiesValidator.reset();
       
    }

    @action setAlert(alert) {
        if (alert === ALERT.VALIDATION_ERROR && !this.validationMessage) {
            // Disabling validation errors for now
            this.activeAlert = ALERT.NONE;
            return;
        }

        this.activeAlert = alert;
    }

    /**
     * Takes a function as argument and executes it only after the store data is successfully saved before unless the state is not dirty and all form validations pass.
     * This is necessary to ensure that we don't allow performing any workflow actions unless the form is valid and changes are saved.
     * 
     * For certain actions, requireSaveIfNotDirty is passed as false as we don't need to validate and save in the event that the form is not dirty. The reason being
     * we want to allow the action if it means that the document is not actively going to remain in workflow (e.g. when putting on hold, archiving, rejecting).
     * 
     * @param {InvoiceStore} store
     * @param {Function} action
     * @param {bool} requireSaveIfNotDirty
     * @returns {Function} - Wrapped function performing the action if successfully saved ahead of time
     */
    @action wrapSaveBeforeAction(store, action, requireSaveIfNotDirty) {
        return () => {
            const saveAndActionIfOk = () => {
                store.save().then(saveSuccess => {
                    if (saveSuccess) {
                        action();
                    }
                });
            }

            if (store.isDirty) {
                // We always need to save if state is dirty
                saveAndActionIfOk();
                return;
            }

            if (requireSaveIfNotDirty) {
                store.checkValidations().then(validationsOk => {
                    if (validationsOk) {
                        // Since validations are okay we can just perform the action (no need to save)
                        action();
                    }
                    else {
                        // Need to save before performing action
                        saveAndActionIfOk();
                    }
                });
            }
            else {
                // State is not dirty and we don't require validation beforehand so just perform the action
                action();
            }
        }
    }

    @action async resolveActions() {
        const saveWrapper = this.wrapSaveBeforeAction.bind(this);

        this.actions = await new ActionResolver([
            {
                name: 'Save',
                func: this.save,
                canPerform: new Promise((resolve, reject) => {
                    resolve(!this.isReadOnly);
                }),
                props: {
                    key: 1,
                    bsStyle: 'primary',
                    left: true
                }
            },
            {
                name: 'Ready for Approval',
                func: saveWrapper(this, this.setToPendingApproval, true),
                canPerform: new Promise((resolve, reject) => {
                    resolve(this.allowedActions.setToPendingApproval.isSuccess);
                }),
                props: {
                    key: 2,
                    bsStyle: 'primary',
                    right: true
                }
            },
            {
                name: 'Approve',
                func: saveWrapper(this, this.approve, true),
                canPerform: new Promise((resolve, reject) => {
                    resolve(this.allowedActions.approve.isSuccess);
                }),
                props: {
                    key: 3,
                    bsStyle: 'primary',
                    right: true
                }
            },
            {
                name: 'Reject',
                func: saveWrapper(this, this.reject, false),
                canPerform: new Promise((resolve, reject) => {
                    resolve(this.allowedActions.reject.isSuccess);
                }),
                props: {
                    key: 4,
                    bsStyle: 'primary',
                    right: true
                }
            },
            {
                name: 'Void',
                func: saveWrapper(this, this.void, false),
                canPerform: new Promise((resolve, reject) => {
                    resolve(this.allowedActions.void.isSuccess);
                }),
                props: {
                    key: 5,
                    bsStyle: 'primary',
                    right: true
                }
            },
            {
                name: 'On Hold',
                func: saveWrapper(this, this.onHold, false),
                canPerform: new Promise((resolve, reject) => {
                    resolve(this.allowedActions.setToOnHold.isSuccess);
                }),
                props: {
                    key: 6,
                    bsStyle: 'primary',
                    right: true
                }
            },
            {
                name: 'Off Hold',
                func: saveWrapper(this, this.setToPendingApproval, true),
                canPerform: new Promise((resolve, reject) => {
                    resolve(!this.isReadOnly && this.document.invoiceStatusCode === 'OnHold');
                }),
                props: {
                    key: 7,
                    bsStyle: 'primary',
                    right: true
                }
            },
            {
                name: 'Submit for Approval',
                func: saveWrapper(this, this.submitForApproval, false),
                canPerform: new Promise((resolve, reject) => {
                    resolve(this.allowedActions.submitForApproval.isSuccess);
                }),
                props: {
                    key: 8,
                    bsStyle: 'primary',
                    right: true
                }
            },
            {
                name: 'Undo',
                func: saveWrapper(this, this.undo, false),
                canPerform: new Promise((resolve, reject) => {
                    resolve(this.allowedActions.undo.isSuccess);
                }),
                props: {
                    key: 9,
                    bsStyle: 'primary',
                    right: true
                }
            },
            {
                name: 'Resubmit',
                func: saveWrapper(this, this.resubmit, false),
                canPerform: new Promise((resolve, reject) => {
                    resolve(this.allowedActions.resubmit.isSuccess);
                }),
                props: {
                    key: 9,
                    bsStyle: 'primary',
                    right: true
                }
            },
            {
                name: 'Submit',
                func: saveWrapper(this, this.submitToCMS, false),
                canPerform: new Promise((resolve, reject) => {
                    resolve(this.allowedActions.submit.isSuccess);
                }),
                props: {
                    key: 10,
                    bsStyle: 'primary',
                    right: true
                }
            }
        ]).resolveDefinitions();
    }

    @action addLineItem() {
        var fields = this.lineItemFields.map(field => camelCase(field.MapTo));
        var obj = {};
        
        fields.forEach(field => {
            obj[field] = '';
        });
        obj.id = uuid();

        this.document.lineItems.push(obj);
    }

    /**
     * Performs form validations and resolves a promise with the results of such check. Will replace the stored validationResults for this store also.
     * @returns {Promise<bool>} - true if all validation checks pass, false otherwise
     */
    @action async checkValidations() {
        var validationResults = await Promise.all([this.editPropertiesValidator.resolveValidation(), ...this.lineItemValidators.map(x => x.resolveValidation()) ]);
        this.validationResults.replace(validationResults);

        return this.validationResults.every(x => x === true);
    }

    @action async save() {
        var validationCheck = await this.checkValidations();

        if (!validationCheck) {
            this.setAlert(ALERT.VALIDATION_ERROR);
            return false; // Do not save
        }

        try {
            this.isLoading = true;
            var document = toJS(this.document);
            
            await documentSvc.update(document);
            this.setAlert(ALERT.SUCCESS);
            await this.reload();
            
            return true;
        }
        catch (e) {
            this.handleSaveError(e);

            return false;
        }
        finally {
            this.isLoading = false;
        }
    }

    /**
     * @param {Promise} workflowAction
     */
    @action performWorkflowAction(workflowAction) {
        this.isLoading = true;

        workflowAction.then(() => {
            this.setAlert(ALERT.SUCCESS);
            this.reload();
        }, this.handleSaveError).finally(() => {
            this.isLoading = false;
        })
    }

    @action setToPendingApproval() {
        this.performWorkflowAction(documentSvc.setToPendingApproval(this.document.guid));
    }

    @action approve() {
        this.performWorkflowAction(documentSvc.approve(this.document.guid));
    }

    @action submitForApproval() {
        this.performWorkflowAction(documentSvc.submitForApproval(this.document.guid));
    }

    @action reject() {
        this.performWorkflowAction(documentSvc.reject(this.document.guid));
    }

    @action void() {
        this.performWorkflowAction(documentSvc.voidDocument(this.document.guid));
    }

    @action onHold() {
        this.performWorkflowAction(documentSvc.setToOnHold(this.document.guid));
    }

    @action undo() {
        this.performWorkflowAction(documentSvc.undo(this.document.guid));
    }

    @action submitToCMS() {
        this.performWorkflowAction(documentSvc.submitToCMS(this.document.guid));
    }

    @action resubmit() {
        this.performWorkflowAction(documentSvc.resubmit(this.document.guid));
    }

    @action async forwardToOtherPlant(plantId) {
        try {
            this.isLoading = true;

            await documentSvc.forwardToOtherPlant(this.document.guid, plantId);
            this.activeForwardAlert = ALERT.PLANT_FORWARD_SUCCCES;
        }
        catch (e) {
            this.activeForwardAlert = ALERT.PLANT_FORWARD_ERROR;
        }
        finally {
            this.isLoading = false;
        }

        await this.reload();
    }

    handleSaveError({ response: { status, data } }) {
        if (status === 403 && isObject(data)) {
            const { fieldErrors = {}, errors = [] } = data;

            if (Object.keys(fieldErrors).length > 0) {
                this.updateValidationWithHighlightResult(data.fieldErrors);
                this.validationMessage = null;
                this.setAlert(ALERT.VALIDATION_ERROR);
            }
            else if (errors.length > 0) {
                this.validationMessage = errors.join(' ');
                this.setAlert(ALERT.VALIDATION_ERROR);
            }
            else {
                this.setAlert(ALERT.ERROR);
            }
        }
        else {
            this.setAlert(ALERT.ERROR);
            this.errorMessage = data;
        }
    }

    updateValidationWithHighlightResult(result) {
        var validations = {};
        var lineItemValidations = this.document.lineItems.map(x => ({}));

        var lineItemFieldRegex = /lineItems\[([0-9]*)\].(.*)/;

        Object.keys(result).map(fieldName => {
            const message = result[fieldName];

            if (lineItemFieldRegex.test(fieldName)) {
                var match = fieldName.match(lineItemFieldRegex);
                var index = match[1];
                var nestedFieldName = match[2];

                const field = this.lookupFieldTable(nestedFieldName);

                if (!field) {
                    return;
                }

                lineItemValidations[index][field] = message;
            }
            else {
                const field = this.lookupFieldTable(fieldName);

                if (!field) {
                    return;
                }

                validations[field] = message;
            }
        });

        lineItemValidations.forEach((validation, index) => {
            this.lineItemValidators[index].addCustomValidations(validation);
        });

        this.editPropertiesValidator.addCustomValidations(validations);
    }

    lookupFieldTable(fieldName) {
        var fieldIdentifiers = fieldTable[fieldName];

        if (!fieldIdentifiers) {
            return null;
        }

        var field = [...this.fields, ...this.lineItemFields].find(x => fieldIdentifiers.indexOf(x.identifier) > -1);

        if (!field) {
            return null;
        }

        return field.name;
    }
}

const fieldTable = {
    vendor: ['947c8c8d-7010-e911-842c-005056822bd7', '947c8c8d-7010-e911-842c-005056820bd7', '947c8c8d-7010-e911-842c-005056820bd6', '9ae6cd34-5b13-e911-842c-005056820bd7'],
    totalAmount: ['886183ae-e40a-e911-842c-005056820bd7', '885f9797-8715-49d4-ac76-fd983233e9b1', '94adfdb2-735b-4f06-bd7e-3cd32a46cb39', '886183ae-e40a-e911-842c-005056820bd1'],
    purchaseOrder: ['c0a7c606-e7f3-e811-822e-d89ef34a256d', 'fd8a1bee-5a40-471a-8e31-7dba8ea6dd32', '2d767887-dbca-4fa7-861f-b6b7510e3eab', 'c0a7c606-e7f3-e811-822e-d89ef34a202d'],
    invoiceNumber: ['bfa7c606-e7f3-e811-822e-d89ef34a201d', 'bfa7c606-e7f3-e811-822e-d89ef34a256d', '06013820-87f1-441a-a9fd-e61455bb61dd', '58c8e85d-4a1a-48c3-8cdb-dfcb5c15ece9'],
    GLAccountNumber: ['746a3545-3cf7-e811-822e-d89ef34a256d', '19375c8a-1008-450a-9056-2cbfb0029ab4', '054e30c1-a645-47c9-9ee9-7921c118677a', '746a3545-3cf7-e811-822e-d89ef34a236d']
};

export default InvoiceStore;