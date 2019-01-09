import { observable, action, toJS, reaction } from 'mobx';
import { camelCase } from 'lodash';
import { v4 as uuid } from 'uuid';
import ALERT from './alert';
import * as documentSvc from '../../services/api/documents';
import * as appGridSvc from '../../services/api/app-grid';
import * as usersSvc from '../../services/api/users';
import { mapFieldForOdissGrid } from '../../data-grid/helper';
import ActionResolver from '../../services/action-resolver';

import { LOOKUP_TYPES } from '../../ui/odiss-grid';

/// <reference path="../../services/action-resolver.d.ts" />

class InvoiceStore {
    constructor () {
        reaction(() => this.document, doc => {
            this.resolveActions();
        });

        this.addLineItem = this.addLineItem.bind(this);
        this.save = this.save.bind(this);
        this.setToPendingApproval = this.setToPendingApproval.bind(this);
        this.approve = this.approve.bind(this);
        this.reject = this.reject.bind(this);
        this.archive = this.archive.bind(this);
        this.onHold = this.onHold.bind(this);
    }

    @observable document = null;
    @observable lookupOptions = observable.map();
    @observable activeAlert = ALERT.NONE;
    @observable isLoading = false;

    get appData () {
        return window.__appData;
    }

    get lineItemFields() {
        return this.appData.FieldsItems.filter(x => !x.NotVisibleFilter).map(mapFieldForOdissGrid);
    }

    @observable actions = [];

    @action
    async loadLookupOptions() {
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
    }

    @action async loadDocument(documentId) {
        this.document = await documentSvc.getById(documentId);

        console.log('document is');
        console.log(this.document);
    }

    @action reload() {
        this.loadDocument(this.document.guid);
    }

    @action setAlert(alert) {
        this.activeAlert = alert;
    }

    @action async resolveActions() {
        this.actions = await new ActionResolver([
            {
                name: 'Save',
                func: this.save,
                canPerform: new Promise((resolve, reject) => {
                    resolve(true);
                }),
                props: {
                    key: 1,
                    bsStyle: 'primary'
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

    @action async save() {
        try {
            console.log( this.document);

            this.isLoading = true;
            var document = toJS(this.document);
            
       debugger;

            await documentSvc.update(document);
            this.setAlert(ALERT.SUCCESS);
        }
        catch (e) {
            this.setAlert(ALERT.ERROR);
        }
        finally {
            this.isLoading = false;
        }
    }

    @action async setToPendingApproval() {
        try {
            this.isLoading = true;
            await documentSvc.setToPendingApproval(this.document.guid);
            this.setAlert(ALERT.SUCCESS);
        }
        catch (e) {
            this.setAlert(ALERT.ERROR);
        }
        finally {
            this.isLoading = false;
        }

        await this.reload();
    }

    @action async approve() {
        try {
            this.isLoading = true;
            await documentSvc.approve(this.document.guid);
            this.setAlert(ALERT.SUCCESS);
        }
        catch (e) {
            this.setAlert(ALERT.ERROR);
        }
        finally {
            this.isLoading = false;
        }

        await this.reload();
    }

    @action async reject() {
        try {
            this.isLoading = true;
            await documentSvc.reject(this.document.guid);
            this.setAlert(ALERT.SUCCESS);
        }
        catch (e) {
            this.setAlert(ALERT.ERROR);
        }
        finally {
            this.isLoading = false;
        }
        
        await this.reload();
    }

    @action async archive() {
        try {
            this.isLoading = true;
            await documentSvc.archive(this.document.guid);
            this.setAlert(ALERT.SUCCESS);
        }
        catch (e) {
            this.setAlert(ALERT.ERROR);
        }
        finally {
            this.isLoading = false;
        }

        await this.reload();
    }

    @action async onHold() {
        try {
            this.isLoading = true;
            await documentSvc.setToOnHold(this.document.guid);
            this.setAlert(ALERT.SUCCESS);
        }
        catch (e) {
            this.setAlert(ALERT.ERROR);
        }
        finally {
            this.isLoading = false;
        }

        await this.reload();
    }
}

export default InvoiceStore;