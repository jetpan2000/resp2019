import DefaultFieldRenderer from './default-field-renderer';
import FIELD_TYPES from './field-types';
import LOOKUP_TYPES from './lookup-types';

function renderField(field, fieldRenderer = DefaultFieldRenderer) {
    if (field.lookupType) {
        switch (field.lookupType) {
            case LOOKUP_TYPES.DROPDOWN:
                return fieldRenderer.Dropdown(field);
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
        default:
            return null;
    }
}

export default renderField;