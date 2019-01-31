﻿import React from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { assign } from 'lodash';
import PROP_TYPES from 'prop-types';

import GRID_PROP_TYPES from '../../grid-prop-types';
import FIELD_TYPES from '../../field-types';
import LOOKUP_TYPES from '../../lookup-types';

import DefaultFieldRenderer from './grid-search-field-renderer';

class GridSearch extends React.Component {
    constructor(props) {
        super(props);

        this.search = this.search.bind(this);
        this.reset = this.reset.bind(this);
        this.updateField = this.updateField.bind(this);

        this.state = this.getInitialFieldState(props);
        
        this.fieldRenderer = new this.props.FieldRenderer(this, {bsSize: 'sm'});
    }

    getInitialFieldState(props) {
        var initialState = {
        };

        props.fields.forEach(field => {
            initialState[field.name] = '';
        });

        return initialState;
    }

    search(e) {
        e.preventDefault();

        var parameters = {};
        this.props.fields.forEach(field => {
            var value = this.state[field.name];

            if (value !== null && value !== undefined) {
                parameters[field.name] = value;
            }
        });

        this.props.performSearch(parameters);
    }

    reset(e) {
        e.preventDefault();

        this.setState(this.getInitialFieldState(this.props));
    }

    updateField(fieldName, e) {
        e.preventDefault();

        var setState = {};
        setState[fieldName] = e.target.value;
        this.setState(setState);
    }

    renderField(field) {
        const { fieldRenderer } = this;

        if (field.lookupType) {
            switch(field.lookupType) {
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
            default:
                return null;
        }
    }

    render() {
        const { title, icon, fields, ActionBarComponent } = this.props;

        return <React.Fragment>
            <ul className="nav nav-sidebar">
                <li className="active">
                    <a href="#" style={{ cursor: 'default' }} onClick={e => { e.preventDefault(); }}>
                        {title} {icon && <FontAwesomeIcon icon={icon} style={{ float: 'right' }} />}
                    </a>
                </li>
            </ul>
            <form onSubmit={this.search}>
                {fields.map(field => (
                    <FormGroup bsSize="sm" key={field.name}>
                        {this.renderField(field)}
                    </FormGroup>
                ))}
                <Button type="submit" bsStyle="primary" onClick={this.search}>Search</Button>
                <Button type="button" onClick={this.reset} style={{ marginLeft: '4px' }}>Reset</Button>
            </form>
            { ActionBarComponent && <hr /> }
            { ActionBarComponent }
        </React.Fragment>
    }
}

GridSearch.propTypes = {
    title: PROP_TYPES.string.isRequired,
    icon: PROP_TYPES.string,
    fields: GRID_PROP_TYPES.fields,
    performSearch: PROP_TYPES.func.isRequired,
    ActionBarComponent: PROP_TYPES.element
}

GridSearch.defaultProps = {
    title: 'Search',
    FieldRenderer: DefaultFieldRenderer
};

export default GridSearch;