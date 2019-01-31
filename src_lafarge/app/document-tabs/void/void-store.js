import { observable, action, toJS } from 'mobx';
import * as documentSvc from '../../services/api/documents';
import FormValidator from '../../services/form-validator';
import { voidDocumentPostAction } from '../../ui/odiss-legacy-helper';
import * as usersApi from '../../services/api/users';

import ALERT from './alert';

const documentId = window.__voidTabState.documentId;

export default class VoidStore {
    validator = new FormValidator([
        {
            field: 'referenceNumber',
            method: 'isEmpty',
            validWhen: false,
            message: 'Reference Number is required'
        },
        {
            field: 'reason',
            method: 'isEmpty',
            validWhen: false,
            message: 'Reason is required'
        }
    ]);

    @observable referenceNumber = '';
    @observable reason = '';
    @observable activeAlert = ALERT.INFO;
    @observable showConfirmDialog = false;
    @observable validation = this.validator.valid();
    @observable submitted = false;
    @observable hasPermission = false;

    @action async loadPermissions() {
        this.hasPermission = await usersApi.hasPermission('VoidDocuments');
    }

    @action submit() {
        this.setValidation();

        if (this.validation.isValid) {
            this.showConfirm();
        }
    }

    @action save() {
        const that = this;
        documentSvc.voidDocument(documentId, this.referenceNumber, this.reason).then(() => {
            that.clear();
            that.setAlert(ALERT.SUCCESS);
            setTimeout(voidDocumentPostAction, 200);
        }, (error) => {
            that.setAlert(ALERT.ERROR);
        }).finally(() => {
            that.hideConfirm();
        });
    }

    @action setAlert(alert) {
        this.activeAlert = alert;
    }

    @action showConfirm() {
        this.showConfirmDialog = true;
    }

    @action hideConfirm() {
        this.showConfirmDialog = false;
    }

    @action setValidation() {
        var state = toJS(this);
        this.validation = this.validator.validate(state);
        this.submitted = true;
    }

    @action clear() {
        this.reason = '';
        this.referenceNumber = '';
        this.submitted = false;
    }
}