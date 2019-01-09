import React from 'react';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { isEqual, extend, camelCase } from 'lodash';
import PROP_TYPES from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DefaultFieldRenderer from '../../ui/odiss-grid/jsx/defaults/grid-search-field-renderer';
import { mapFieldsWithDynamicItem } from '../../data-grid/helper';

// --------------------------------------------------------
// THIS COMPONENT HAS BEEN FLAGGED FOR BEING MADE RE-USABLE
// ACROSS DIFFERENT ODISS SITES
//
// IT'S BEING WRITTEN SPECIFICALLY TO ODISS AP MINI
// BUT IS REALLY APPLICABLE FOR ANY ODISS AP
// --------------------------------------------------------

@inject('store')
@observer
class LineItems extends React.Component {
    constructor(props) {
        super(props);
        this.addLineItemClick = this.addLineItemClick.bind(this);
    }

    renderHeadings() {
        return <thead>
            <tr>
                {this.props.store.lineItemFields.map(field => <th key={`heading-${field.name}`} style={{ textAlign: 'center' }}>{field.text}</th>)}
            </tr>
        </thead>
    }



    renderRows() {
        return <tbody>
            { this.props.store.document.lineItems.map(item => <LineItemRow key={`row-${item.id}`} lineItem={item} />) }
        </tbody>
    }

    addLineItemClick(e) {
        e.preventDefault();
        this.props.store.addLineItem();
    }

    componentDidMount() {
        //console.log(this.props.store.appData.EnableItemlinesCreate);
      }

    render() {
        let ifAddNewLine;

        if (this.props.store.appData.EnableItemlinesCreate) {
            ifAddNewLine =   <a href="#" onClick={this.addLineItemClick}>
            <FontAwesomeIcon icon="plus" /> Add new line
        </a>;          
        }
        else{
            ifAddNewLine = "";        
        }


        return <div>
            { /* <h5>Item Lines </h5> */ }
            <table style={{width: '100%'}}>
                {this.renderHeadings()}
                {this.renderRows()}
            </table>
           
            {ifAddNewLine}
          
        </div>
    }
}

@inject('store')
@observer
class LineItemRow extends React.Component {
    constructor (props) {
        super(props);

        const rowStyle = {
            height: '25px',
            padding: '2px 5px'
        };

        this.fieldRenderer = new this.props.FieldRenderer(this, {bsSize: 'sm', style: rowStyle});
        this.renderField = this.renderField.bind(this);
        this.removeClick = this.removeClick.bind(this);

        this.state = this.getInitialFieldState(props);

        const that = this;

        this.disposeReaction = reaction(() => this.props.lineItem, lineItem => {
            that.setState(lineItem);
        });
    }

    getInitialFieldState(props) {
        var initialState = {
        };

        props.store.appData.FieldsItems.forEach(field => {
            initialState[field.ID] = props.lineItem[camelCase(field.MapTo)];
        });

        return initialState;
    }

    componentWillUnmount() {
        this.disposeReaction();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isEqual(this.state, prevState)) {
            var mapped = mapFieldsWithDynamicItem(this.state, this.props.store.lineItemFields);
            extend(this.props.lineItem, mapped);
        }
    }

    renderField(field) {
        const { fieldRenderer } = this;

        switch(field.Type) {
            case 3:
                return "";  
            case 2:
            default:
                if (this.props.store.appData.EnableItemlinesUpdate){
                    return fieldRenderer.Text(field);
                }
                else{
                    return fieldRenderer.TextReadOnly(field);
                }
        }
    }  

    removeClick(e) {
        e.preventDefault();

console.log('removeing ');
console.log(this.props.lineItem);

        this.props.store.document.lineItems.remove(this.props.lineItem);
    }

    render () {
        var rowStyle = { padding: '2px' };
        let ifRemoveButton;
        if (this.props.store.appData.EnableItemlinesDelete) {
            ifRemoveButton = <td style={rowStyle}><FontAwesomeIcon icon="times" onClick={this.removeClick} /></td>;
        }
        else{
            ifRemoveButton = null;            
        }

        return <tr>   
            {this.props.store.lineItemFields.map(field => <td key={`row-${this.props.lineItem.Id}-col-${field.name}`} style={rowStyle}>
                {this.renderField(field)}  
            </td>)}
            {ifRemoveButton}
        </tr>;
    }
}

LineItemRow.defaultProps = {
    FieldRenderer: DefaultFieldRenderer
};

LineItemRow.propTypes = {
    lineItem: PROP_TYPES.object.isRequired
}

export default LineItems;