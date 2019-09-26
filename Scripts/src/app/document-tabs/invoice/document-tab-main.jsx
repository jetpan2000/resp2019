import React from 'react';
import { observer, Provider } from 'mobx-react';
import { toJS } from 'mobx';
import { extend } from 'lodash';
import DocumentTab, { EditProperties, LineItems } from 'odiss-document-tab';
import Store from './store';
import ActionBar from './edit-action-bar';
import InvoiceHistory from './invoice-history';
import ForwardToOtherPlant from './forward-to-other-plant';
import SupportingDocuments from './supporting-documents';
import AlertInvoice from './alert.invoice';
import './document-tab.scss';
import ErrorBoundary from '../../error-boundary';

var store = new Store();
store.loadLookupOptions();
store.loadDocument(window.__invoiceTabState.documentId);
window.__documentTabStore = store;

@observer
class DocumentTabMain extends React.Component {
    constructor(props) {
        super(props);

        this.receiveDocumentUpdate = this.receiveDocumentUpdate.bind(this);
        this.receiveLineItemsUpdate = this.receiveLineItemsUpdate.bind(this);
    }

    receiveDocumentUpdate(updatedProperties) {
        extend(store.document, updatedProperties);
    }

    receiveLineItemsUpdate(updatedLineItems) {
        store.document.lineItems.replace(updatedLineItems);
    }

    render() {
        var fieldOverrides = store.overrideBuilder.buildInvoiceHeaderFieldOverrides();
        var invoiceHeaderValidations = store.overrideBuilder.buildInvoiceHeaderValidations();
        var lineItemValidations = store.overrideBuilder.buildLineItemValidations();

        return <Provider store={store}>
            <React.Fragment>                
                <DocumentTab title="Invoice History">
                    <ErrorBoundary>
                        <InvoiceHistory />
                    </ErrorBoundary>
                </DocumentTab>
                <DocumentTab title="Supporting Documents" nopad>
                    <ErrorBoundary>
                        <SupportingDocuments />
                    </ErrorBoundary>
                </DocumentTab>
            </React.Fragment>
        </Provider>
    }
}

export default DocumentTabMain;