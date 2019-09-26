const PIVOT_AGGREGATES = {
    ALL_SAME_OR_BLANK: 'ALL_SAME_OR_BLANK',
    FIRST_VALUE: 'FIRST_VALUE',
    COMMA_SEPARATED: 'COMMA_SEPARATED'
};

export function aggregateAllSameOrBlank (values) {
    if (values.every(v => v && v.toUpperCase() === values[0].toUpperCase())) {
        return values[0];
    }
    else {
        return null;
    }
}

export function aggregateFirstValue (values) {
    var notEmptyValues = values.filter(v => v !== '' && v !== null && v !== undefined);
                    
    if (notEmptyValues.length === 0) {
        return null;
    }
    else {
        return notEmptyValues[0];
    }
}

export function aggregateCommaSeparated (values) {
    return values.join(', ');
}

export function getAggregateFunction(pivotAggregateType) {
    if (pivotAggregateType === PIVOT_AGGREGATES.COMMA_SEPARATED) {
        return aggregateCommaSeparated;
    }
    else if (pivotAggregateType === PIVOT_AGGREGATES.FIRST_VALUE) {
        return aggregateFirstValue;
    }
    else {
        return aggregateAllSameOrBlank;
    }
}

export default PIVOT_AGGREGATES;