import React from 'react';
import { observer } from 'mobx-react';
import BootstrapSelect from 'bootstrap-select';
import './document-typedefs';

/**
 * @param {DebitCreditProps} options
 */
const DebitCredit = ({ getIsCredit, setIsCredit, setDebitCreditString = (val) => {}, ...otherProps}) => {
    const options = [{
        text: 'Debit',
        value: false
    }, {
        text: 'Credit',
        value: true
    }];
    
    const onChange = (newValue) => {
        var boolValue = undefined;
    
        switch (newValue) {
            case 'true': boolValue = true; break;
            case 'false': boolValue = false; break;
            default: boolValue = undefined; break;
        }
    
        setIsCredit(boolValue);
    
        if (boolValue === null || boolValue === undefined) {
            setDebitCreditString(null);
        }
        else {
            setDebitCreditString(boolValue ? 'C' : '');
        }
    }

    return <BootstrapSelect value={getIsCredit()} options={options} optionValue="value" optionText="text" onChange={onChange} {...otherProps} />;
};

export default observer(DebitCredit);