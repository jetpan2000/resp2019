import PropTypes from 'prop-types';
import { keys } from 'lodash';

import FIELD_TYPES from '../odiss-field-renderer/field-types';
import LOOKUP_TYPES from '../odiss-field-renderer/lookup-types';

export default {
    getData: PropTypes.func.isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        dataType: PropTypes.oneOf(keys(FIELD_TYPES)).isRequired,
        entryDetails: PropTypes.bool,
        valueAccessor: PropTypes.func,
        customElement: PropTypes.element,
        lookupCollection: PropTypes.array,
        lookupValue: PropTypes.string,
        lookupText: PropTypes.string,
        lookupType: PropTypes.oneOf(keys(LOOKUP_TYPES)),
        visibility: PropTypes.shape({
            search: PropTypes.bool,
            grid: PropTypes.bool
        }),
        order: PropTypes.shape({
            search: PropTypes.number,
            grid: PropTypes.number
        })
    })).isRequired,
    openRow: PropTypes.func,
    canOpenRow: PropTypes.bool,
    gridHeight: PropTypes.string,
    rowsPerPage: PropTypes.number,
    serverSideSearch: PropTypes.shape({
        searchFunc: PropTypes.func.isRequired,
        searchResultTransform: PropTypes.func,
        updatePaginationFromResult: PropTypes.func,
        buildParameters: PropTypes.func.isRequired,
        onPageChange: PropTypes.func.isRequired
    }),
    SearchComponent: PropTypes.element,
    ActionBarComponent: PropTypes.element
}