import React from 'react';
import { FormControl } from 'react-bootstrap';
import { assign } from 'lodash';
import BootstrapSelect from '../bootstrap-select';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { formatDatePicker } from '../../utilities/datetime-formatter';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DefaultAutocomplete from './default-autocomplete';

import 'bootstrap-daterangepicker/daterangepicker.css';

class FieldRenderer {
    constructor(component, props) {
        this.component = component;
        this.props = props;

        this.getProps = this.getProps.bind(this);
    }

    getProps(field) {
        if (!this.component.isEdit && !this.component.isReadOnly) {
            return this.props || {};
        }

        var props = {};

        if (!field.editable || this.component.isReadOnly) {
            props['disabled'] = true;
        }

        assign(props, this.props);

        return props;
    }

    Text(field) {
        const updateField = (e) => {
            e.preventDefault();

            var setStateObject = {};
            setStateObject[field.name] = e.target.value;
            this.component.setState(setStateObject);
        }

        return (<FormControl type="text" placeholder={field.text} value={this.component.state[field.name]} onChange={updateField} {...this.getProps(field)} />)
    }

    Number(field) {
        const updateField = (e) => {
            e.preventDefault();

            var setStateObject = {};
            setStateObject[field.name] = Number(e.target.value);
            this.component.setState(setStateObject);
        }

        return (<FormControl type="number" placeholder={field.text} value={this.component.state[field.name]} onChange={updateField} {...this.getProps(field)} />)
    }

    Dropdown(field) {
        const { lookupCollection, lookupValue, lookupText } = field;

        const onChange = (newValue) => {
            var setStateObject = {};
            setStateObject[field.name] = newValue;
            this.component.setState(setStateObject);
        }

        return <BootstrapSelect value={this.component.state[field.name]} options={lookupCollection} optionValue={lookupValue} optionText={lookupText} selectText={field.text} onChange={onChange} {...this.getProps(field)} />
    }

    BooleanYesNo(field) {
        var collection = [
            { text: 'Yes', value: true },
            { text: 'No', value: false }
        ];

        const onChange = (newValue) => {
            var setStateObject = {};
            setStateObject[field.name] = newValue;
            this.component.setState(setStateObject);
        }

        return <BootstrapSelect value={this.component.state[field.name]} options={collection} optionValue="value" optionText="text" selectText={field.text} onChange={onChange} {...this.getProps(field)} />
    }

    TextArea(field) {
        const updateField = (e) => {
            e.preventDefault();

            var setStateObject = {};
            setStateObject[field.name] = e.target.value;
            this.component.setState(setStateObject);
        }

        return (<FormControl rows="6" componentClass="textarea" type="text" placeholder={field.text} value={this.component.state[field.name]} onChange={updateField} {...this.getProps(field)} />)
    }

    Date(field) {
        var props = this.getProps(field);
        var value = formatDatePicker(this.component.state[field.name]);
        var formControl = <React.Fragment>
            <FormControl type="text" placeholder={field.text} value={value} {...props} />
            <FormControl.Feedback>
                <span>
                    <FontAwesomeIcon icon="calendar" />
                </span>
            </FormControl.Feedback>
        </React.Fragment>;

        if (props.disabled) {
            return formControl;
        }

        var startDate = moment(this.component.state[field.name]).format("M/D/YYYY");

        return <DateRangePicker
            singleDatePicker={!this.component.isFilter}
            showDropdowns={true}
            linkedCalendars={true}
            containerStyles={{}}
            startDate={startDate}
            onApply={(e, picker) => {
                const { startDate } = picker;
                var setStateObject = {};
                setStateObject[field.name] = moment([startDate.year(), startDate.month(), startDate.date()]).format("YYYY-MM-DDT00:00:00.000");
                this.component.setState(setStateObject);
            }}
            >
            {formControl}
        </DateRangePicker>
    }

    Autocomplete(field, getReferenceFunc = (ref) => {}) {
        var props = this.getProps(field);
        props.disabled = !!props.disabled;

        return <DefaultAutocomplete field={field} {...props} component={this.component} componentState={this.component.state} getReferenceFunc={getReferenceFunc} />
    }
}

export default FieldRenderer;