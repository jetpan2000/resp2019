import React from 'react';
import { observer } from 'mobx-react';
import { FormControl, Button, Alert, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ClipLoader as Spinner } from 'react-spinners';
import { keys } from 'lodash';
import DocumentTab from '../../ui/document-tab';
import DocumentTabForm from '../../ui/document-tab-form';
import EditBOLStore from './store';

const store = new EditBOLStore();
store.init();

var mergeDisplayFields = {
    deliveryDateFormatted: 'Delivery Date',
    plantName: 'Plant Name',
    soldTo: 'Customer Number',
    soldToName: 'Customer Name',
    vehicle: 'Vehicle',
    vendor: 'Carrier'
}

var plantDisplayFields = {
    name: 'Plant Name',
    businessLineName: 'Business Line',
    regionName: 'Region'
}

const btnStyle = {
    margin: '3px'
};

@observer
export default class EditBOLTab extends React.Component {

    constructor(props) {
        super(props);

        this.verify = this.verify.bind(this);
        this.update = this.update.bind(this);
        this.reset = this.reset.bind(this);
    }

    verify(e) {
        e.preventDefault();

        store.verify();
    }

    update(e) {
        e.preventDefault();

        store.update();
    }

    proceedUpdateBOL(e) {
        e.preventDefault();

        store.overrideAllowedTicketNumber(store.document.ticketNo, store.document.plantNumber);
        store.update();
    }

    reset(e) {
        e.preventDefault();

        store.reset();
    }

    renderAlert() {
        const { activeAlert, alertMessage } = store;

        if (!activeAlert || activeAlert.HIDE) {
            return null;
        }

        return <Alert bsStyle={activeAlert.ALERT_TYPE}>
            <FontAwesomeIcon icon={activeAlert.ICON} /> {activeAlert.MESSAGE.replace('{0}', alertMessage)}
            {activeAlert.PROCEED && <div style={{ marginTop: '10px' }}>
                <Button bsSize="sm" bsStyle="primary" style={{ marginRight: '5px' }} onClick={this.proceedUpdateBOL} disabled={store.isLoading}>Proceed</Button>
                <Button bsSize="sm" bsStyle="secondary" onClick={this.reset} disabled={store.isLoading}>Cancel</Button>
            </div>}
        </Alert>
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

        return <DocumentTab title="Edit BOL">
            {this.renderAlert()}
            {store.document && <DocumentTabForm onSubmit={this.update}>
                <DocumentTabForm.Field controlId="ticketNo" validationState={getValidationState('ticketNo')}>
                    <DocumentTabForm.Label>Ticket Number</DocumentTabForm.Label>
                    <DocumentTabForm.Control validation={validation.ticketNo}>
                        <FormControl type="text" placeholder="Ticket Number" value={store.document.ticketNo} onChange={e => store.document.ticketNo = e.target.value} />
                    </DocumentTabForm.Control>
                </DocumentTabForm.Field>
                <tr>
                    <td colSpan="2">
                        {store.document && store.document.mergeAttached && <dl className="dl-horizontal">
                            {keys(mergeDisplayFields).map(fieldName => (
                                <React.Fragment key={fieldName}>
                                    <dt style={{ width: '120px', paddingRight: '10px', borderRight: 'solid thin' }}>{mergeDisplayFields[fieldName]}</dt>
                                    <dd style={{ marginLeft: '140px' }}>{store.document[fieldName]}</dd>
                                </React.Fragment>
                            ))}
                        </dl>}
                    </td>
                </tr>
                <DocumentTabForm.Field controlId="plantNumber" validationState={getValidationState('plantNumber')}>
                    <DocumentTabForm.Label>Plant Number</DocumentTabForm.Label>
                    <DocumentTabForm.Control validation={validation.plantNumber}>
                        <FormControl type="text" placeholder="Plant Number" value={store.document.plantNumber} onChange={e => store.document.plantNumber = e.target.value} />
                    </DocumentTabForm.Control>
                </DocumentTabForm.Field>
                <tr>
                    <td colSpan="2">
                        {store.plantVerification && store.plantVerification.success && <dl className="dl-horizontal">
                            {keys(plantDisplayFields).map(fieldName => (
                                <React.Fragment key={fieldName}>
                                    <dt style={{ width: '120px', paddingRight: '10px', borderRight: 'solid thin' }}>{plantDisplayFields[fieldName]}</dt>
                                    <dd style={{ marginLeft: '140px' }}>{store.plantVerification.plant[fieldName]}</dd>
                                </React.Fragment>
                            ))}
                        </dl>}
                    </td>
                </tr>
                <DocumentTabForm.Footer>
                    <div style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '30px' }}><Spinner loading={store.isLoading} size={25} /></div>
                    <Button type="button" bsSize="sm" onClick={this.verify} disabled={store.isLoading} style={btnStyle}>Verify</Button>
                    <Button type="submit" bsSize="sm" disabled={store.isLoading} style={btnStyle}>Update...</Button>
                    <Button type="button" bsSize="sm" onClick={this.reset} disabled={store.isLoading} style={btnStyle}>Reset</Button>
                </DocumentTabForm.Footer>
            </DocumentTabForm>}
        </DocumentTab>
    }
}