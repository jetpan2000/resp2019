import React from 'react';

import { Modal, Button, Form, FormGroup, Col, ControlLabel, FormControl, Checkbox, Alert, HelpBlock } from 'react-bootstrap';
import { isEqual, orderBy } from 'lodash';
import { inject, observer } from 'mobx-react';
import { reaction } from 'mobx';
import EDIT_MODE from './edit-mode';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ClipLoader as Spinner } from 'react-spinners';

import FIELD_TYPES from './../ui/odiss-grid/field-types';
import LOOKUP_TYPES from './../ui/odiss-grid/lookup-types';

import FormValidator from './../services/form-validator';
// import FieldRenderer from './../ui/odiss-grid/jsx/defaults/grid-search-field-renderer';
import { DefaultFieldRenderer as FieldRenderer, renderField } from '../ui/odiss-field-renderer'
import BootstrapConfirm from '../ui/bootstrap-confirm';

import { isAlphanumericAllowSpaces, isAlpha } from '../utilities/custom-validators';

@inject('store')
@observer
class Edit extends React.Component {

    constructor(props) {
        super(props);

        this.validator = new FormValidator(this.createValidatorRules(this.props.store.appData.Fields));

        this.state = {
            validation: this.validator.valid(),
            submitted: false
        };

        this.fieldRenderer = new FieldRenderer(this);

        this.submit = this.submit.bind(this);
        this.cancel = this.cancel.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        //this.renderField = this.renderField.bind(this);
        this.renderFields = this.renderFields.bind(this);

        var that = this;
        this.disposeReaction = reaction(() => this.props.store.editItem, editItem => {
            that.setState(editItem);
        });

        this.disposeEditModeReaction = reaction(() => this.props.store.editMode, editMode => {
            this.isEdit = editMode === EDIT_MODE.UPDATE;
        });
    }

    createValidatorRules(fields) {
        var rules = [];

        fields.forEach(field => {
            var validations = field.ValidationRules;

            if (!validations) {
                return;
            }

            var fieldName = field.ID;

            if (validations.IsRequired) {
                rules.push({
                    field: fieldName,
                    method: 'isEmpty',
                    validWhen: false,
                    message: `${field.Name} is required`
                });
            }

            if (validations.IsAlpha) {
                rules.push({
                    field: fieldName,
                    method: isAlpha,
                    args: [undefined],
                    validWhen: true,
                    message: `${field.Name} must be alphanumeric`
                });
            }

            if (validations.IsAlphanumeric) {
                rules.push({
                    field: fieldName,
                    method: isAlphanumericAllowSpaces,
                    args: [undefined],
                    validWhen: true,
                    message: `${field.Name} must be alphanumeric`
                });
            }

            if (validations.MinLength !== undefined && validations.MinLength !== null && validations.MaxLength !== undefined && validations.MaxLength !== null) {
                rules.push({
                    field: fieldName,
                    method: 'isLength',
                    args: [{
                        min: validations.MinLength,
                        max: validations.MaxLength
                    }],
                    validWhen: true,
                    message: function () {
                        if (validations.MinLength) {
                            return `${field.Name} must be between ${validations.MinLength} and ${validations.MaxLength} characters`;
                        }
                        else {
                            return `${field.Name} must not be more than ${validations.MaxLength} characters`;
                        }
                    }()
                });
            }
        });

        return rules;
    }

    componentWillUnmount() {
        this.disposeReaction();
        this.disposeEditModeReaction();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isEqual(this.state, prevState)) {
            this.props.store.editItem = this.state;
        }
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
        store.hideEdit();
    }

    onInputChange(fieldName, e) {
        this.props.store.editItem[fieldName] = e.target && e.target.value || e;
        this.forceUpdate();
    }

    // renderField(field) {
    //     const { fieldRenderer } = this;

    //     if (field.lookupType) {
    //         switch (field.lookupType) {
    //             case LOOKUP_TYPES.DROPDOWN:
    //                 return fieldRenderer.Dropdown(field);
    //         }
    //     }

    //     switch (field.dataType) {
    //         case FIELD_TYPES.STRING:
    //             return fieldRenderer.Text(field);
    //         case FIELD_TYPES.NUMBER:
    //             return fieldRenderer.Number(field);
    //         case FIELD_TYPES.BOOLEAN_YESNO:
    //             return fieldRenderer.BooleanYesNo(field);
    //         case FIELD_TYPES.TEXTAREA:
    //             return fieldRenderer.TextArea(field);
    //         default:
    //             return null;
    //     }
    // }

    renderFields() {
        const { store } = this.props;
        const { fields } = store;

        if (!store.editItem) {
            return null;
        }

        let validation = this.state.submitted ?           // if the form has been submitted at least once
            this.validator.validate(store.editItem) :     // then check validity every time we render
            this.state.validation                         // otherwise just use what's in state

        const getValidationState = (f) => {
            var validate = validation[f];

            if (validation.isValid || !validate) {
                return null;
            }
            else {
                return validate.isInvalid ? 'error' : null;
            }
        }

        return orderBy(fields.filter(x => x.visibility.editor), x => x.order.editor).map(field => (
            <FormGroup key={field.name} controlId={field.name} validationState={getValidationState(field.name)}>
                <Col componentClass={ControlLabel} sm={6}>{field.text}</Col>
                <Col sm={6}>
                    { renderField(field, this.fieldRenderer) }
                    {/* {this.renderField(field)} */}
                    <FormControl.Feedback />
                    {validation[field.name].isInvalid && <HelpBlock>{validation[field.name].message}</HelpBlock>}
                </Col>
            </FormGroup>
        ))

        return null;
    }

    getValidationState(field) {
        var validate = validation[field];

        if (validation.isValid || !validate) {
            return null;
        }
        else {
            return validate.isInvalid ? 'error' : null;
        }
    }

    renderAlert() {
        const { store } = this.props;
        const { activeAlert } = store;

        if (!activeAlert || activeAlert.HIDE) {
            return null;
        }

        return <Alert bsStyle={activeAlert.ALERT_TYPE}>
            <FontAwesomeIcon icon={activeAlert.ICON} /> {activeAlert.MESSAGE}
        </Alert>
    }

    render() {
        const { store } = this.props;

        return <Modal
            show={store.isEditShowing}
            onHide={this.cancel}
        >
            <Modal.Header closeButton>
                <Modal.Title>{store.editMode === EDIT_MODE.CREATE ? 'Create' : 'Edit'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form horizontal onSubmit={this.submit}>
                    {this.renderFields()}
                </Form>
                {this.renderAlert()}
            </Modal.Body>
            <Modal.Footer>
                { store.appData.EnableDelete && store.editMode === EDIT_MODE.UPDATE && <Button onClick={() => { store.showDeleteConfirmDialog = true; }} className="pull-left">Delete</Button>}
                <Button bsStyle="secondary" onClick={this.cancel}>Close</Button>
                <Button bsStyle="primary" onClick={this.submit}>Save changes</Button>
            </Modal.Footer>
            <BootstrapConfirm
                show={store.showDeleteConfirmDialog}
                yesAction={() => { store.delete(); }}
                onClose={() => { store.showDeleteConfirmDialog = false; }}
            />
        </Modal>
    }
}

export default Edit;