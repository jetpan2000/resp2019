import React from 'react';
import { autorun, reaction, observable, action, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { isEqual, extend, camelCase } from 'lodash';
import { v4 as uuid } from 'uuid';
import PROP_TYPES from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DefaultFieldRenderer, renderField } from '../../ui/odiss-field-renderer';
import { mapFieldsWithDynamicItem, mapFieldForOdissGrid } from '../../data-grid/helper';

class LineItemStore {
    @observable lineItems = [];

    lineItemFields = [];
    appData = null;

    constructor(appData, lineItems) {
        this.appData = appData;
        this.lineItems = lineItems;
        this.lineItemFields = appData.FieldsItems.filter(x => !x.NotVisibleFilter).map(mapFieldForOdissGrid);
    }

    @action addLineItem() {
        var fields = this.lineItemFields.map(field => camelCase(field.mapTo));
        var obj = {};
        
        fields.forEach(field => {
            obj[field] = '';
        });
        obj.id = uuid();

        this.lineItems.replace([... this.lineItems, obj]);
    }

    @action removeLineItem(lineItem) {
        this.lineItems.remove(lineItem);
    }
}

var store = null;

@observer
class LineItems extends React.Component {
    constructor(props) {
        super(props);

        this.addLineItemClick = this.addLineItemClick.bind(this);
        store = new LineItemStore(this.props.appData, this.props.lineItems);

        this.disposeAutoUpdate = autorun(() => {
            var lineItems = toJS(store.lineItems);

            if (!isEqual(this.props.lineItems, lineItems)) {
                this.props.onUpdateLineItems(lineItems);
            }
        });
    }

    componentWillUnmount() {
        this.disposeAutoUpdate();
    }

    renderHeadings() {
        return <thead>
            <tr>
                {store.lineItemFields.map(field => <th key={`heading-${field.name}`} style={{ textAlign: 'center' }}>{field.text}</th>)}
            </tr>
        </thead>
    }

    renderRows() {
        return <tbody>
            { store.lineItems.map(item => <LineItemRow key={`row-${item.id}`} lineItem={item} isReadOnly={this.props.isReadOnly} />) }
        </tbody>
    }

    addLineItemClick(e) {
        e.preventDefault();
        store.addLineItem();
    }

    render() {
        return <div>
            <table style={{width: '100%', marginBottom: '20px'}}>
                {this.renderHeadings()}
                {this.renderRows()}
            </table>
            { !this.props.isReadOnly && <a href="#" onClick={this.addLineItemClick}>
                <FontAwesomeIcon icon="plus" /> Add new line
            </a> }
        </div>
    }
}

@observer
class LineItemRow extends React.Component {
    constructor (props) {
        super(props);

        const rowStyle = {
            height: '25px',
            padding: '2px 5px'
        };

        this.fieldRenderer = new this.props.FieldRenderer(this, {bsSize: 'sm', style: rowStyle});
        this.removeClick = this.removeClick.bind(this);

        this.state = this.getInitialFieldState(props);

        const that = this;

        this.disposeReaction = reaction(() => this.props.lineItem, lineItem => {
            that.setState(lineItem);
        });
    }

    get isReadOnly() {
        return this.props.isReadOnly;
    }

    getInitialFieldState(props) {
        var initialState = {
        };

        store.appData.FieldsItems.forEach(field => {
            initialState[field.ID] = props.lineItem[camelCase(field.MapTo)];
        });

        return initialState;
    }

    componentWillUnmount() {
        this.disposeReaction();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isEqual(this.state, prevState)) {
            var mapped = mapFieldsWithDynamicItem(this.state, store.lineItemFields);
            extend(this.props.lineItem, mapped);
        }
    }

    removeClick(e) {
        e.preventDefault();
        store.removeLineItem(this.props.lineItem);
    }

    render () {
        var rowStyle = { padding: '1px' };

        return <tr>
            {store.lineItemFields.map(field => <td key={`row-${this.props.lineItem.Id}-col-${field.name}`} style={rowStyle}>
                {renderField(field, this.fieldRenderer)}
            </td>)}
            { !this.isReadOnly && <td style={rowStyle}><FontAwesomeIcon icon="times" onClick={this.removeClick} /></td> }
        </tr>;
    }
}

LineItems.propTypes = {
    lineItems: PROP_TYPES.array.isRequired,
    onUpdateLineItems: PROP_TYPES.func.isRequired
}

LineItemRow.defaultProps = {
    FieldRenderer: DefaultFieldRenderer
};

LineItemRow.propTypes = {
    lineItem: PROP_TYPES.object.isRequired
}

export default LineItems;