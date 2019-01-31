import { observable, action, toJS } from 'mobx';
import * as documentSvc from '../../services/api/documents';
import * as plantSvc from '../../services/api/plants';
import FormValidator from '../../services/form-validator';
import { assign, some } from 'lodash';
import moment from 'moment';
import * as usersApi from '../../services/api/users';

import ALERT from './alert';

const documentId = window.__editTabState.documentId;
let initialDocument = null;

class EditBOLStore {
    validator = new FormValidator([
        {
            field: 'ticketNo',
            method: 'isEmpty',
            validWhen: false,
            message: 'Ticket Number is required'
        },
        {
            field: 'plantNumber',
            method: 'isEmpty',
            validWhen: false,
            message: 'Plant Number is required'
        }
    ]);

    @observable validation = this.validator.valid();
    @observable document = {
        ticketNo: '',
        plantNumber: '',
        plantId: null
    };
    @observable plantVerification = null;
    @observable isLoading = false;
    @observable submitted = false;
    @observable activeAlert = ALERT.NONE;
    @observable alertMessage = '';
    @observable hasPermission = false;
    @observable allowedTicketNumbers = [];

    @action init() {
        this.loadPermissions();
        this.loadDocument();
    }

    @action async loadPermissions() {
        this.hasPermission = await usersApi.hasPermission('SaveDocuments');
    }

    @action setValidation() {
        var state = toJS(this);
        this.validation = this.validator.validate(state);
        this.submitted = true;
    }

    @action setAlert(alert, message) {
        this.activeAlert = alert;
        this.alertMessage = message;
    }

    @action async loadDocument() {
        var document = await documentSvc.getById(documentId);

        if (!document) {
            return;
        }

        this.document = document;
        initialDocument = document;
    }

    @action async verify() {
        try {
            //await this.verifyPlantNumber();

            this.isLoading = true;
            this.document.mergeAttached = false;
            //var result = await documentSvc.verifyBOL(this.document.ticketNo, this.document.plantNumber);
            var result = null;

            await Promise.all([this.verifyPlantNumber(), documentSvc.verifyBOL(this.document.ticketNo, this.document.plantNumber).then(res => {
                result = res;
            })]);

            const { merge } = result.payload;

            if (result.isSuccess) {
                this.setAlert(ALERT.VERIFY_SUCCESS);
                this.allowedTicketNumbers.push({ ticketNumber: this.document.ticketNo, plantNumber: this.document.plantNumber });
            }
            else {
                this.setAlert(ALERT.VERIFY_FAILED, result.message);
            }

            if (merge) {
                delete merge.ticketNo;
                delete merge.plantNumber;
                delete merge.plantId;
                this.document = assign(this.document, merge);
                this.document.mergeAttached = true;
                this.document.deliveryDateFormatted = moment(this.document.deliveryDate).format('YYYY-MM-DD');
            }
        }
        catch (e) {
            this.setAlert(ALERT.VERIFY_ERROR);
        }
        finally {
            this.isLoading = false;
        }
    }

    @action async verifyPlantNumber() {
        try {
            this.isLoading = true;

            var result = await plantSvc.findByPlantNumber(this.document.plantNumber);

            if (result) {
                this.plantVerification = {
                    plant: result,
                    success: true
                };

                //this.setAlert(ALERT.VERIFY_SUCCESS);
            }
            else {
                this.plantVerification = {
                    success: false
                };

                //this.setAlert(ALERT.VERIFY_FAILED, 'Plant not found');
            }

            this.document.mergeAttached = false;
        }
        catch (e) {
            //this.setAlert(ALERT.VERIFY_ERROR);
        }
        finally {
            this.isLoading = false;
        }
    }

    @action overrideAllowedTicketNumber(ticketNumber, plantNumber) {
        this.allowedTicketNumbers.push({ ticketNumber: ticketNumber, plantNumber: plantNumber });
    }

    @action async update() {
        try {
            if (!some(this.allowedTicketNumbers, x => x.ticketNumber === this.document.ticketNo && x.plantNumber === this.document.plantNumber)) {
                var verifyResults = await documentSvc.verifyBOL(this.document.ticketNo, this.document.plantNumber);

                if (verifyResults.isSuccess) {
                    this.allowedTicketNumbers.push({ ticketNumber: this.document.ticketNo, plantNumber: this.document.plantNumber });
                }
                else if (verifyResults.payload.plant) {
                    // Only show Proceed if plant is not missing
                    this.setAlert(ALERT.UPDATE_TICKET_NUMBER_WARNING)
                    return;
                }
            }

            this.isLoading = true;
            var result = await documentSvc.updateBOL(documentId, this.document.ticketNo, this.document.plantNumber);

            if (result.isSuccess) {
                this.setAlert(ALERT.UPDATE_SUCCESS);
                var doc = toJS(this.document);
                initialDocument = toJS(doc);
            }
            else {
                this.setAlert(ALERT.GENERIC_ERROR, result.message);
            }
        }
        catch (e) {
            this.setAlert(ALERT.UPDATE_ERROR);
        }
        finally {
            this.document.mergeAttached = false;
            this.isLoading = false;
        }
    }

    @action reset() {
        this.document = initialDocument;
        this.document.mergeAttached = false;
        this.plantVerification = null;
        this.setAlert(ALERT.NONE);
    }
}

export default EditBOLStore;