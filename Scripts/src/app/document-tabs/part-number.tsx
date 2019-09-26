import { observer } from 'mobx-react';

var instance = null;

const PartNumber = ({fieldRenderer, field, partNumberOptions}) => {
    if (partNumberOptions.length > 0) {
        return fieldRenderer.Autocomplete(field);
    }
    else {
        return fieldRenderer.Text(field);
    }
};

export default observer(PartNumber);