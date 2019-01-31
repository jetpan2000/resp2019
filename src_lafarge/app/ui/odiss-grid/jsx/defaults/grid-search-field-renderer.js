import React from 'react';
import { FormControl } from 'react-bootstrap';
import BootstrapSelect from '../../../bootstrap-select';

class FieldRenderer {
    constructor(component, props) {
        this.component = component;
        this.props = props;
    }

    Text(field) {
        const updateField = (e) => {
            e.preventDefault();

            var setStateObject = {};
            setStateObject[field.name] = e.target.value;
            this.component.setState(setStateObject);
        }

        return (<FormControl type="text" placeholder={field.text} value={this.component.state[field.name]} onChange={updateField} {...this.props} />)
    }

    Number(field) {
        const updateField = (e) => {
            e.preventDefault();

            var setStateObject = {};
            setStateObject[field.name] = Number(e.target.value);
            this.component.setState(setStateObject);
        }

        return (<FormControl type="number" placeholder={field.text} value={this.component.state[field.name]} onChange={updateField} {...this.props} />)
    }

    Dropdown(field) {
        const { lookupCollection, lookupValue, lookupText } = field;

        const onChange = (newValue) => {
            var setStateObject = {};
            setStateObject[field.name] = newValue;
            this.component.setState(setStateObject);
        }

        return <BootstrapSelect value={this.component.state[field.name]} options={lookupCollection} optionValue={lookupValue} optionText={lookupText} selectText={`${field.text}`} onChange={onChange} {...this.props} />
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

        return <BootstrapSelect value={this.component.state[field.name]} options={collection} optionValue="value" optionText="text" selectText={`${field.text}`} onChange={onChange} {...this.props} />
    }
}

export default FieldRenderer;