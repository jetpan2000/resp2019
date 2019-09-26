import React from 'react';
import DocumentTabForm from './document-tab-form';

import { orderBy, filter, camelCase } from 'lodash';

import PROP_TYPES from 'prop-types';
import { mapFieldForOdissGrid, mapFieldsWithDynamicItem } from '../../data-grid/helper';
import { DefaultFieldRenderer, renderField } from '../odiss-field-renderer';

const noop = () => {};

class EditProperties extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.buildStateFromProps(props);

        this.isEdit = true;
        this.fieldRenderer = new this.props.FieldRenderer(this, {bsSize: 'sm'});

        this.fields = this.props.appData.Fields.map(mapFieldForOdissGrid);
    }

    get isReadOnly () {
        return this.props.isReadOnly;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state !== prevState) {
            var mapped = mapFieldsWithDynamicItem(this.state, this.fields);
            this.props.onUpdateDocument(mapped);
        }

        if (this.props.document !== prevProps.document) {
            this.setState(this.buildStateFromProps(this.props));
        }
    }

    buildStateFromProps(props) {
        var state = {
        };

        props.appData.Fields.forEach(field => {
            state[field.ID] = props.document[camelCase(field.MapTo)];
        });

        return state;
    }

    render() {
        // TODO - Refactor below logic to use this.fields instead of appData.Fields
        const { appData } = this.props;
        var fields = appData.Fields;
        fields = filter(fields, x => !x.NotVisibleViewer);
        fields = orderBy(fields, x => x.ResultOrder);

        return <DocumentTabForm>
            { fields.map(field => {
                var f = mapFieldForOdissGrid(field, this.props.lookupCollection[field.ID]);
                return <DocumentTabForm.Field key={'edit-properties-item-' + f.name}>
                    <DocumentTabForm.Label>{f.text}</DocumentTabForm.Label>
                    <DocumentTabForm.Control>
                        {renderField(f, this.fieldRenderer)}
                    </DocumentTabForm.Control>
                </DocumentTabForm.Field>
            }) }
        </DocumentTabForm>;
    }
}

EditProperties.propTypes = {
    appData: PROP_TYPES.object.isRequired,
    document: PROP_TYPES.object.isRequired,
    onUpdateDocument: PROP_TYPES.func.isRequired
};

EditProperties.defaultProps = {
    FieldRenderer: DefaultFieldRenderer,
    onUpdateDocument: noop,
    isReadOnly: false
}

export default EditProperties;