import React from 'react';
import { inject, observer } from 'mobx-react';
import { Form, FormGroup, Col, ControlLabel, FormControl, Button, Checkbox, Modal, Alert, HelpBlock } from 'react-bootstrap';
import { ClipLoader as Spinner } from 'react-spinners';

import { BootstrapSelect } from 'octacom-react-ui';
import FormValidator from './../services/form-validator';

import { isAlphanumericAllowSpaces } from '../utilities/custom-validators';

@inject('store')
@observer
export default class EditRow extends React.Component {

    constructor(props) {
        super(props);

        this.validator = new FormValidator([
            {
                field: 'number',
                method: 'isEmpty',
                validWhen: false,
                message: 'Number is required'
            },
            {
                field: 'number',
                method: 'isLength',
                args: [{
                    min: 4,
                    max: 4
                }],
                validWhen: true,
                message: 'Number must be four characters'
            },
            {
                field: 'number',
                method: isAlphanumericAllowSpaces,
                args: [undefined],
                validWhen: true,
                message: 'Number must be alphanumeric'
            },
            {
                field: 'name',
                method: 'isEmpty',
                validWhen: false,
                message: 'Name is required'
            },
            {
                field: 'name',
                method: 'isLength',
                args: [{
                    min: 1,
                    max: 200
                }],
                validWhen: true,
                message: 'Name must not be more than 200 characters'
            },
            {
                field: 'name',
                method: isAlphanumericAllowSpaces,
                args: [undefined],
                validWhen: true,
                message: 'Name must be alphanumeric'
            },
            {
                field: 'businessLineID',
                method: 'isEmpty',
                validWhen: false,
                message: 'Business Line is required'
            },
            {
                field: 'regionID',
                method: 'isEmpty',
                validWhen: false,
                message: 'Region is required'
            },
        ]);

        this.state = {
            validation: this.validator.valid(),
            submitted: false
        };
    }

    submit(e) {
        const { store } = this.props;

        e.preventDefault();

        const validation = this.validator.validate(store.editItem);
        this.setState({ validation, submitted: true });

        if (validation.isValid) {
            store.saveEdit();
        }
    }

    cancel() {
        const { store } = this.props;

        this.setState({ submitted: false, validation: this.validator.valid() });
        store.hideModal();
    }

    toggleIsActive(e) {
        const { store } = this.props;

        store.editItem.isActive = e.target.checked;
    }

    onInputChange(fieldName, e) {
        this.props.store.editItem[fieldName] = e.target && e.target.value || e;
        this.forceUpdate();
    }

    render() {
        const { store } = this.props;

        if (!store.editItem) {
            return null;
        }

        let validation = this.state.submitted ?           // if the form has been submitted at least once
            this.validator.validate(store.editItem) :     // then check validity every time we render
            this.state.validation                         // otherwise just use what's in state

        const getValidationState = (field) => {
            var validate = validation[field];

            if (validation.isValid || !validate) {
                return null;
            }
            else {
                return validate.isInvalid ? 'error' : null;
            }
        }

        return <div>
            <Modal show={store.showModal} onHide={this.cancel.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>{store.editItem.isNew ? 'Add' : 'Edit'} Plant</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form horizontal onSubmit={this.submit.bind(this)}>
                        <FormGroup controlId="plantNumber" validationState={getValidationState('number')}>
                            <Col componentClass={ControlLabel} sm={3}>Number</Col>
                            <Col sm={9}>
                                <FormControl type="text" placeholder="Number" defaultValue={store.editItem.number} onChange={this.onInputChange.bind(this, 'number')} readOnly={!store.editItem.isNew} />
                                <FormControl.Feedback />
                                {validation.number.isInvalid && <HelpBlock>{validation.number.message}</HelpBlock>}
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="plantName" validationState={getValidationState('name')}>
                            <Col componentClass={ControlLabel} sm={3}>Name</Col>
                            <Col sm={9}>
                                <FormControl type="text" placeholder="Name" defaultValue={store.editItem.name} onChange={this.onInputChange.bind(this, 'name')} />
                                <FormControl.Feedback />
                                {validation.name.isInvalid && <HelpBlock>{validation.name.message}</HelpBlock>}
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="plantBusinessLine" validationState={getValidationState('businessLineID')}>
                            <Col componentClass={ControlLabel} sm={3}>Business Line</Col>
                            <Col sm={9}>
                                <BootstrapSelect
                                    value={store.editItem.businessLineID}
                                    onChange={this.onInputChange.bind(this, 'businessLineID')}
                                    options={store.businessLines}
                                    optionValue="id"
                                    optionText="description"
                                    selectText="-- Select --"
                                    disabled={!store.editItem.isNew}
                                />
                                <FormControl.Feedback />
                                {validation.businessLineID.isInvalid && <HelpBlock>{validation.businessLineID.message}</HelpBlock>}
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="plantRegion" validationState={getValidationState('regionID')}>
                            <Col componentClass={ControlLabel} sm={3}>Region</Col>
                            <Col sm={9}>
                                <BootstrapSelect
                                    value={store.editItem.regionID}
                                    onChange={this.onInputChange.bind(this, 'regionID')}
                                    options={store.regions}
                                    optionValue="id"
                                    optionText="name"
                                    selectText="-- Select --"
                                    disabled={!store.editItem.isNew}
                                />
                                <FormControl.Feedback />
                                {validation.regionID.isInvalid && <HelpBlock>{validation.regionID.message}</HelpBlock>}
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="plantActive">
                            <Col sm={12}>
                                <Checkbox checked={store.editItem.isActive} onChange={this.toggleIsActive.bind(this)}>
                                    Is Active
                                </Checkbox>
                            </Col>
                        </FormGroup>
                    </Form>
                    {store.showUpdatedAlert && <Alert bsStyle="success">
                        Plant {store.editItem.isNew ? 'added' : 'updated'} successfully.
                    </Alert>}
                    {store.showErrorAlert && <Alert bsStyle="danger">
                        {store.customErrorMessage || 'An error occured while saving changes. Please try again later.'}
                    </Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <div style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '30px'}}>
                        <Spinner loading={store.isLoading} size={25} />
                    </div>
                    <Button type="button" onClick={this.cancel.bind(this)}>Close</Button>
                    <Button type="button" onClick={this.submit.bind(this)} bsStyle="primary">Save changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    }

}