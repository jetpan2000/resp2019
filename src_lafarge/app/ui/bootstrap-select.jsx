import React from 'react';
import { FormControl } from 'react-bootstrap';
import _ from 'lodash';

export default class BootstrapSelect extends React.Component {

    onChange(e) {
        const { onChange } = this.props;

        if (onChange) {
            onChange(e.target.value);
        }
    }

    render() {
        const { value, options, optionValue, optionText, selectText, onChange, ...other } = this.props;

        var optionsElements = [];

        if (selectText) {
            optionsElements.push((<option key="select" value="">{selectText}</option>));
        }

        optionsElements.push(..._.map(options, option => (<option key={option[optionValue]} value={option[optionValue]}>{option[optionText]}</option>)));

        return <FormControl componentClass="select" value={value} onChange={this.onChange.bind(this)} {...other}>
            {optionsElements}
        </FormControl>;
    }
}