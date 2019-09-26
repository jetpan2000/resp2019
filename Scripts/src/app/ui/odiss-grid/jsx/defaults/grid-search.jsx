import React from 'react';
import { Form, FormGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { assign, find } from 'lodash';
import matcher from 'matcher';
import queryString from 'query-string'
import PROP_TYPES from 'prop-types';

import GRID_PROP_TYPES from '../../grid-prop-types';

import { DefaultFieldRenderer, renderField } from '../../../odiss-field-renderer'

class GridSearch extends React.Component {
    constructor(props) {
        super(props);

        this.search = this.search.bind(this);
        this.reset = this.reset.bind(this);
        this.updateField = this.updateField.bind(this);

        this.state = this.getInitialFieldState(props);
        
        this.fieldRenderer = new this.props.FieldRenderer(this, {bsSize: 'sm'});
    }

    componentWillMount() {
        this.updateStateWithQueryStringValues();
    }

    updateStateWithQueryStringValues() {
        var query = queryString.parse(this.props.location.search);

        var stateChanges = {};

        for (var property in query) {
            var field = find(this.props.fields, f => matcher.isMatch(f.mapTo, property));
            
            if (field) {
                stateChanges[field.name] = query[property];
            }
        }

        this.setState({
            ...this.state,
            ...stateChanges
        }, this.search);
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
        if (e) {
            e.preventDefault();
        }

        var parameters = {};
        this.props.fields.forEach(field => {
            var value = this.state[field.name];

            if (value !== null && value !== undefined) {
                parameters[field.name] = value;
            }
        });

        if (this.props.customSearchParameters) {
            assign(parameters, this.props.customSearchParameters);
        }

        this.props.performSearch(parameters);
    }

    reset(e) {
        e.preventDefault();

        this.setState(this.getInitialFieldState(this.props), () => {
            this.search(e);
        });

        if (this.props.customClearFunction) {
            this.props.customClearFunction();
        }
    }

    updateField(fieldName, e) {
        e.preventDefault();

        var setState = {};
        setState[fieldName] = e.target.value;
        this.setState(setState);
    }

    render() {
        const { title, icon, fields, ActionBarComponent, CustomSearchComponent } = this.props;

        return <React.Fragment>
            <ul className="nav nav-sidebar">
                <li className="active">
                    <a href="#" style={{ cursor: 'default' }} onClick={e => { e.preventDefault(); }}>
                        {title} {icon && <FontAwesomeIcon icon={icon} style={{ float: 'right' }} />}
                    </a>
                </li>
            </ul>
            <Form onSubmit={this.search}>
                {fields.map(field => (
                    <FormGroup key={field.name} bsSize="sm">
                        { renderField(field, this.fieldRenderer) }
                    </FormGroup>
                ))}
                {CustomSearchComponent}
                <Button type="submit" bsStyle="primary" onClick={this.search}>Search</Button>
                <Button type="button" onClick={this.reset} style={{ marginLeft: '4px' }}>Reset</Button>
            </Form>
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
    ActionBarComponent: PROP_TYPES.element,
    CustomSearchComponent: PROP_TYPES.element,
    customSearchParameters: PROP_TYPES.object,
    customClearFunction: PROP_TYPES.func
}

GridSearch.defaultProps = {
    title: 'Search',
    FieldRenderer: DefaultFieldRenderer
};

export default GridSearch;