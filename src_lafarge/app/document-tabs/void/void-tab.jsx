import React from 'react';
import { Alert, FormControl, Button } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isEqual } from 'lodash';
import DocumentTab from '../../ui/document-tab';
import DocumentTabForm from '../../ui/document-tab-form';
import BootstrapConfirm from '../../ui/bootstrap-confirm';

import ALERT from './alert';
import VoidStore from './void-store';

var store = new VoidStore();
store.loadPermissions();

@observer
export default class VoidTab extends React.Component {

    submit(e) {
        e.preventDefault();

        store.setValidation();
        if (store.validation.isValid) {
            store.submit();
        }
    }

    renderAlert() {
        const { activeAlert } = store;

        if (activeAlert.HIDE) {
            return null;
        }

        return <Alert bsStyle={activeAlert.ALERT_TYPE}>
            <FontAwesomeIcon icon={activeAlert.ICON} /> {activeAlert.MESSAGE}
        </Alert>
    }

    onConfirm() {
        store.save();
    }

    render() {
        if (!store.hasPermission) {
            return null;
        }

        let validation = store.submitted ?           // if the form has been submitted at least once
            store.validator.validate(store) :     // then check validity every time we render
            store.validation;                         // otherwise just use what's in state

        const getValidationState = (field) => {
            var validate = validation[field];

            if (validation.isValid || !validate) {
                return null;
            }
            else {
                return validate.isInvalid ? 'error' : null;
            }
        }

        var validationAlert = validation.isValid ? ALERT.INFO : ALERT.VALIDATION_ERROR;
        if ((isEqual(store.activeAlert, ALERT.INFO) || isEqual(store.activeAlert, ALERT.VALIDATION_ERROR)) && !isEqual(store.activeAlert, validationAlert)) {
            store.setAlert(validationAlert);
        }

        return <DocumentTab title="Archive this document">
            <BootstrapConfirm
                title="Confirm archive"
                message="Are you sure that you want to move this document to the Archive tab?"
                yesAction={this.onConfirm}
                show={store.showConfirmDialog}
                onClose={store.hideConfirm.bind(store)} />
            {this.renderAlert()}
            {!isEqual(store.activeAlert, ALERT.SUCCESS) &&
                <DocumentTabForm onSubmit={this.submit.bind(this)}>
                    <DocumentTabForm.Field controlId="referenceNumber" validationState={getValidationState('referenceNumber')}>
                        <DocumentTabForm.Label>Reference #</DocumentTabForm.Label>
                        <DocumentTabForm.Control validation={validation.referenceNumber}>
                            <FormControl type="text" placeholder="Reference #" defaultValue={store.referenceNumber} onChange={e => store.referenceNumber = e.target.value} />
                        </DocumentTabForm.Control>
                    </DocumentTabForm.Field>
                    <DocumentTabForm.Field controlId="reason" validationState={getValidationState('reason')}>
                        <DocumentTabForm.Label>Reason</DocumentTabForm.Label>
                        <DocumentTabForm.Control validation={validation.reason}>
                            <FormControl componentClass="textarea" rows="5" defaultValue={store.reason} onChange={e => store.reason = e.target.value} />
                        </DocumentTabForm.Control>
                    </DocumentTabForm.Field>
                    <DocumentTabForm.Footer>
                        <Button type="submit" bsStyle="primary" bsSize="sm">Archive</Button>
                    </DocumentTabForm.Footer>
                </DocumentTabForm>
            }
        </DocumentTab>
    }
}