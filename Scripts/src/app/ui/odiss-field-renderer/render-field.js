import DefaultFieldRenderer from './default-field-renderer';
import FIELD_TYPES from './field-types';
import LOOKUP_TYPES from './lookup-types';

function renderField(field, fieldRenderer = DefaultFieldRenderer, getReferenceFunc = (ref) => {}) {
    if (field.lookupType) {
        switch (field.lookupType) {
            case LOOKUP_TYPES.DROPDOWN:
                return fieldRenderer.Dropdown(field);
            case LOOKUP_TYPES.AUTOCOMPLETE:
                return fieldRenderer.Autocomplete(field, getReferenceFunc);
        }
    }

    switch (field.dataType) {
        case FIELD_TYPES.STRING:
            return fieldRenderer.Text(field);
        case FIELD_TYPES.NUMBER:
            return fieldRenderer.Number(field);
        case FIELD_TYPES.BOOLEAN_YESNO:
            return fieldRenderer.BooleanYesNo(field);
        case FIELD_TYPES.TEXTAREA:
            return fieldRenderer.TextArea(field);
        case FIELD_TYPES.DATE:
            return fieldRenderer.Date(field);
        default:
            return null;
    }
}

export default renderField;