import matcher from 'matcher';
import { find, each, keys, camelCase } from 'lodash';
import { toJS } from 'mobx';
import { FIELD_TYPES, LOOKUP_TYPES } from '../ui/odiss-grid';

export function mapDynamicItemWithFields(data, fields) {
    var d = {};

    each(fields, field => {
        var key = find(keys(data), key => matcher.isMatch(key, field.mapTo));
        d[field.name] = data[key];
    });

    return d;
}

export function mapFieldsWithDynamicItem(data, fields) {
    var d = {};

    each(fields, field => {
        var name = find(keys(data), key => matcher.isMatch(key, field.name));
        d[camelCase(field.mapTo)] = data[name];
    });

    return d;
}

export function getFieldType(field) {
    switch (field.Type) {
        case 2:
        case 5:
        default: return FIELD_TYPES.STRING;
        case 9: return FIELD_TYPES.TEXTAREA;
    }
}

export function getLookupType(field) {
    // This is only completed for dropdown field types. Complete implementation for other types when needed.
    if (field.Type === 5) {
        return LOOKUP_TYPES.DROPDOWN;
    }

    return null;
}

export function mapFieldForOdissGrid(field, lookupCollection) {
    var lookupMapping = {
        value: null,
        text: null
    };

    var lookupType = getLookupType(field);
    if (lookupType === LOOKUP_TYPES.DROPDOWN) {
        if (field.FilterData) {
            lookupMapping = JSON.parse(field.FilterData);
        }
        else {
            lookupMapping = {
                value: 'code',
                text: 'name'
            };
        }
    }

    return {
        name: field.ID,
        entryDetails: field.IsKey,
        text: field.Name,
        mapTo: field.MapTo,
        dataType: getFieldType(field),
        lookupType: lookupType,
        lookupValue: lookupMapping.value,
        lookupText: lookupMapping.text,
        editable: field.Editable,
        lookupCollection: lookupCollection,
        visibility: {
            search: !field.NotVisibleFilter,
            grid: !field.NotVisibleList,
            editor: !field.NotVisibleViewer
        },
        order: {
            search: field.FilterOrder,
            grid: field.ResultOrder,
            editor: field.ResultOrder
        }
    }
}