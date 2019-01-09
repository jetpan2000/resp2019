import matcher from 'matcher';
import { find, each, keys, camelCase } from 'lodash';

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