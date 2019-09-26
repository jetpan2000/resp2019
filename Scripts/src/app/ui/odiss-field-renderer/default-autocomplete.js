import React from 'react';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { FormControl } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import http from '../../services/api/http-client';
import { camelCase } from 'lodash';
import * as strings from '../../helpers/string';

class DefaultAutocomplete extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allowNew: false,
            isLoading: false,
            multiple: false,
            options: [],
            item: null,
            selected: []
        }

        this.onSearch = this.onSearch.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.propertyName = camelCase(props.field.mapTo);

        this.labelKey = (item) => item[this.propertyName];

        const { filterData } = this.props.field;

        if (filterData && filterData.displayFormat) {
            this.labelKey = (item) => strings.format(filterData.displayFormat, item);
        }
    }

    componentDidMount() {
        this.loadItem();
    }

    shouldComponentUpdate(nextProps, nextState) {
        const fieldName = this.props.field.name;

        var result = !!(nextState.item !== this.state.item 
            || nextState.options !== this.state.options 
            || nextProps.disabled !== this.props.disabled
            || !nextProps.componentState[fieldName]);

        return result;
    }

    async loadItem() {
        var keyValue = this.props.component.state[this.props.field.name];

        if (!keyValue) {
            this.setState({
                item: 'NULL'
            });

            return;
        }

        var item = await http.get(`${this.props.field.lookupRest}/${keyValue}`)
            .then(response => response.data);

        await this.onSearch(item.id, item);  // TODO - modify so that it dynamically selects the key name of the object instead of hard coding it
    }

    onSearch(query, item) {
        this.setState({isLoading: true});

        http.get(`${this.props.field.lookupRest}?searchParameter=${query}`)
            .then(response => response.data)
            .then(data => {
                var update = {
                    isLoading: false,
                    options: data
                }

                if (item) {
                    update.item = item;
                }

                this.setState(update);
            });
    }

    onChange(selected) {
        if (selected && selected.length === 1) {
            var setStateObject = {};
            setStateObject[this.props.field.name] = selected[0]['id']; // TODO - modify so that it dynamically selects the key name of the object instead of hard coding it
            this.props.component.setState(setStateObject);
        }
    }

    onBlur(e) {
        e.preventDefault();

        console.log('blurring....');
        var labelKey = this.labelKey(this.state.item);
        var value = this.props.componentState[this.props.field.name];
        console.log(labelKey);
        console.log(value);
        //this.instance.clear();
        //this.forceUpdate();
    }

    render() {
        if (!this.state.item) {
            return null;
        }

        const { field, ...others } = this.props;

        var defaultInputValue = this.state.item && this.state.item !== 'NULL' && this.labelKey(this.state.item);

        if (defaultInputValue === false) {
            defaultInputValue = ''; // Avoid letting react render the text "false"
        }

        if (this.props.disabled) {
            return (<FormControl type="text" placeholder={field.text} defaultValue={defaultInputValue} {...others} disabled />)
        }

        return <React.Fragment>
                <AsyncTypeahead 
                {...this.state}
                labelKey={this.labelKey}
                onSearch={this.onSearch}
                onChange={this.onChange}
                onBlur={this.onBlur}
                defaultInputValue={defaultInputValue}
                placeholder={field.text}
                minLength={1}
                ref={(ref) => {
                    //this.instance = ref.getInstance();
                    this.props.getReferenceFunc(ref);
                }}
                {...others} />
                <FormControl.Feedback>
                    <span>
                        <FontAwesomeIcon icon="search" />
                    </span>
                </FormControl.Feedback>
            </React.Fragment>;
    }
}

export default DefaultAutocomplete;