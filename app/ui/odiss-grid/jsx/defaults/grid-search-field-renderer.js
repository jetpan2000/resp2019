import React from 'react';
import { FormControl } from 'react-bootstrap';
import { assign } from 'lodash';
import BootstrapSelect from '../../../bootstrap-select';

console.warn('DEPRECATION WARNING - Use odiss-field-renderer instead');

class FieldRenderer {
    constructor(component, props) {
        this.component = component;
        this.props = props;

        this.getProps = this.getProps.bind(this);
    }

    getProps(field) {
        if (!this.component.isEdit) {
            return this.props;
        }

        var props = {};

        if (!field.editable) {
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

        return <BootstrapSelect value={this.component.state[field.name]} options={lookupCollection} optionValue={lookupValue} optionText={lookupText} selectText={`${field.text}`} onChange={onChange} {...this.getProps(field)} />
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

        return <BootstrapSelect value={this.component.state[field.name]} options={collection} optionValue="value" optionText="text" selectText={`${field.text}`} onChange={onChange} {...this.getProps(field)} />
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
}

export default FieldRenderer;