import React from 'react';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { ListGroup, ListGroupItem, Pagination, Button } from 'react-bootstrap';
import { find, chain, orderBy, range, chunk, extend, camelCase } from 'lodash';
import { formatText, FieldRendererHelper } from 'odiss-field-renderer';
import { formatDateTime } from '../../utilities/datetime-formatter';
import ErrorBoundary from '../../error-boundary';
import diff from 'deep-diff';
import humanizer from 'humanize-string';
import capitalize from 'capitalize';
import { isUUID } from 'validator';
import { isBlank } from 'string-helper';
import '../document-typedefs';
import ReactTable from "react-table";
import './document-tab.scss';

const { extendWithFieldOverrides, mapFieldForOdissGrid } = FieldRendererHelper;

const PAGE_SIZE = 10;

var statusOptions = {};
const fieldsLookup = [...window.__appData.Fields, ...window.__appData.FieldsItems];



/** @type {(parameters: { field: Field, diffObj: Diff }) => CustomValueResolver} */
const getCustomResolver = (parameters) => customValueResolvers.find(x => x.selector(parameters));

/** @type {(value, field: Field, currency: Currency) => string} */
const parseValue = (value, field, currency) => {
    console.log(field);

    if (field) {
        return formatText(field, value, currency)
    }
    else if (isBlank(value)) {
        return 'blank';
    }
    else {
        return value;
    }
}

/** @type {(fieldName: string, fieldsLookup: Array<Field>) => Field} */
const getField = (fieldName, fieldsLookup) => {
    return fieldsLookup.find(x => camelCase(x.mapTo) === fieldName);
}

/** @type {(fromValue: string, toValue: string) => string} */
const buildOptionsChangedText = (fromValue, toValue) => `from <b>${fromValue}</b> to <b>${toValue}</b>`;

/** @type {(obj, fieldLookup: Array<Field>, currency: Currency => string} */

/** 
 * @typedef DiffViewerProps
 * @property {Array<Diff>} diffObj
 * @property {Array<string} fieldsIgnore
 * @property {Array<Field>} fields
 */
/** @type {(props: DiffViewerProps) => JSX.Element} */
const DiffViewer = ({ diffObj, lhs, rhs, fieldsIgnore, ignoreGuids, fields, currency }) => {
    var obj = diffObj || diff(lhs, rhs);
    obj = orderBy(obj, x => (x.index || (x.path && x.path.length >= 1 && x.path[1])));

    if (!obj || obj.length === 0) {
        return null;
    }

    return <ErrorBoundary>
        <ul style={{marginTop: '20px'}}>
            { obj.map((diffObj, i) => {
                // TODO - Find a way to refactor the logic below so it's more "general"
                // Needs to be done when extracting this component into a Odiss Component in its own NPM package
                // Good amount of spec tests need to be written for it as well.
                // - A pattern that I'm sensing now is that the last index of path is the property name always.. spec tests need to confirm it
                if ((fieldsIgnore.indexOf(diffObj.path[0]) > -1) || (diffObj.path.length > 2 && fieldsIgnore.indexOf(diffObj.path[2]) > -1)) {
                    return null;
                }
    
                if (ignoreGuids && (typeof(diffObj.lhs) === 'string' && isUUID(diffObj.lhs)) || (typeof(diffObj.rhs) === 'string' && isUUID(diffObj.rhs))) {
                    return null;
                }

                const __html = buildChangeDescription(diffObj, fields, currency);

                if (!__html) {
                    return null;
                }
    
                return <li key={i} dangerouslySetInnerHTML={{ __html }}>
                </li>
            }) }
        </ul>
    </ErrorBoundary>
}

const PropertyViewer = ({ diffObj: item, fieldsToInclude, fields }) => <ErrorBoundary>
    <ul style={{marginTop: '20px'}}>
        {fieldsToInclude.map(fieldName => <li key={fieldName}><b>{humanizeField(fieldName)}</b>: {parseValue(item[fieldName], getField(fieldName, fields))}</li>)}
    </ul>
</ErrorBoundary>


//@inject("store")
@observer
class InvoiceHistoryItem extends React.Component {

    constructor (props) {
        super(props);

       // this.onClick = this.onClick.bind(this);

       this.state = {
            showDiff2: false
        };
    }

    calcAction() {
     
    }

    buildActionResult({text, ComponentToRender = null, fieldsToInclude = [], fieldsIgnore = [], fields = [], ignoreGuids = true, diffObjSelector = (diffObj) => diffObj}, diffObj) {
     
    }

    showDetails() {
       if (this.state.showDiff2){
        this.setState({
            showDiff2: false
        });
       }
       else{
        this.setState({
            showDiff2: true
        });
       }
    }

    onRevertClick(e) {
      
    }

    render () {
        const { item } = this.props;

        if (item.actionName === 'Edit Properties'){
            const data = JSON.parse(item.data);          
            if (data.dataChanges === null || data.dataChanges === undefined){
                data.dataChanges = [];                
            }

            console.log(data);

            return <ListGroupItem >
                <ErrorBoundary>
                        {item.actionName} by {item.userName} on {formatDateTime(item.recorded)}
                        <div style={{paddingLeft:'30px'}}>
                            {data.dataChanges.map((item1, index) => <li key={index}><strong>{item1.FieldName}</strong> was changed from <strong>{item1.OldValue}</strong> to <strong>{item1.NewValue}</strong></li>)}
                        </div>
                </ErrorBoundary>
            </ListGroupItem>
        }
        else if (item.actionName === 'Upload Support Document'){
            const data = JSON.parse(item.data);       
            return <ListGroupItem fields={this.fields}>
                <ErrorBoundary>
                    {item.actionName} by {item.userName} on {formatDateTime(item.recorded)}
                    <div style={{paddingLeft:'30px'}}>
                        <li><strong>Original Filename:</strong> {data.filename}</li>
                        <li><strong>Description:</strong> {data.description}</li>
                    </div>
                </ErrorBoundary>
            </ListGroupItem>
        }
        else if (item.actionName === 'Archive Document'){
            const data = JSON.parse(item.data);       
            return <ListGroupItem>
                <ErrorBoundary>
                    {item.actionName} by {item.userName} on {formatDateTime(item.recorded)}
                    <div style={{paddingLeft:'30px'}}>
                        <li><strong>Archive Type:</strong> {data.archiveType}</li>
                    <   li><strong>Comment:</strong> {data.archiveNote}</li>
                    </div>                  
                </ErrorBoundary>
            </ListGroupItem>
        }
        else if (item.actionName === 'Move to Invoice Tab'){
            const data = JSON.parse(item.data);       
            return <ListGroupItem>
                <ErrorBoundary>
                    {item.actionName} by {item.userName} on {formatDateTime(item.recorded)}
                    <div style={{paddingLeft:'30px'}}>
                    <   li><strong>Comment:</strong> {item.note}</li>
                    </div>                  
                </ErrorBoundary>
            </ListGroupItem>
        }
       

        return <ListGroupItem fields={this.fields}>
            <ErrorBoundary>
                {item.actionName} by {item.userName} on {formatDateTime(item.recorded)}

                  
            </ErrorBoundary>
        </ListGroupItem>
    }
}

@inject("store")
@observer
class InvoiceHistory extends React.Component {
    constructor(props) {
        super(props);

        this.paginateClick = this.paginateClick.bind(this);

        this.state = {
            currentPage: 1
        };
    }

    componentDitUpdate() {
      }

    componentWillUpdate() {
    }

    paginateClick(page, e) {
        e.preventDefault();

        this.setState({
            currentPage: page
        });
    }

    get fields() {
        return []; //fields;
    }

    render () {
        if (this.props.store.history.length === 0) {
            return <div>No changes found</div>;
        }

        var paginatedList = chunk(toJS(this.props.store.history), PAGE_SIZE)[this.state.currentPage - 1];
        var numberOfPages = parseInt(this.props.store.history.length / PAGE_SIZE) ;
        if (this.props.store.history.length % PAGE_SIZE > 0){
            numberOfPages ++;
        }

        var rangenumber = numberOfPages + 1;

        return <React.Fragment>
            <ListGroup>
                { paginatedList.map(item => (<InvoiceHistoryItem key={item.id} item={item} fields={this.fields} />)) }
            </ListGroup>
            { numberOfPages > 1 && <Pagination bsSize="small">
                { range(1, rangenumber).map(page => {
                    return <Pagination.Item key={page} onClick={this.paginateClick.bind(this, page)} active={page === this.state.currentPage}>{page}</Pagination.Item>
                })}
                </Pagination>
            }
        </React.Fragment>
    }
}

export default InvoiceHistory;