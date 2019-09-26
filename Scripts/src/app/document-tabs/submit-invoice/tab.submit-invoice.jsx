import React from 'react';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';
import { Button } from 'react-bootstrap';
import ErrorBoundary from '../../error-boundary';

import DocumentTab, { EditProperties, LineItems, DocumentSubmit } from 'odiss-document-tab';
import Alert from './alert.submit-invoice';
import SubmitInvoiceStore from './store.tab.submit-invoice';

/**
 * @extends React.Component<{store: SubmitInvoiceStore}, {}, {}>
 */
@inject('store')
@observer
class SubmitInvoiceTab extends React.Component {
    componentWillUnmount() {
        this.props.store.clear();
    }

    render() {        
        const { store } = this.props;
        
        const isReadOnly = store.submissionAlert === 'SUCCESS';

        var editFieldOverrides = store.buildInvoiceHeaderFieldOverrides();
        var lineItemOverrides = store.buildLineItemFieldOverrides();

        return <React.Fragment>
        <DocumentTab title="New Invoice" defaultExpanded nopad>
            <DocumentTab.Section title="File Upload">
                <DocumentSubmit receiveUpdates={(({file, status}) => { store.receiveFileUploadUpdate(file, status); })} disabled={isReadOnly} /> 
            </DocumentTab.Section>
            <DocumentTab.Section title="Invoice Header">
                <ErrorBoundary>
                    <EditProperties 
                        document={store.document} 
                        onUpdateDocument={store.receiveDocumentUpdate} 
                        appData={window.__appData}
                        ignoreValidationForProperties={[
                            'c0a7c606-e7f3-e811-822e-d89ef34a256d',
                            '856183ae-e40a-e911-842c-005056820bd7',
                            '866183ae-e40a-e911-842c-005056820bd7',
                            '876183ae-e40a-e911-842c-005056820bd7',
                            '886183ae-e40a-e911-842c-005056820bd7'
                        ]}
                        lookupCollection={toJS(store.lookupOptions)}
                        customValidationRules={[
                            {
                                field: '947c8c8d-7010-e911-842c-005056820bd7',
                                method: 'isEmpty', 
                                validWhen: false, 
                                message: 'Vendor # is required'
                            }
                        ]}
                        isReadOnly={isReadOnly}
                        validatorRef={(ref) => { store.propertiesValidator = ref; }}
                        fieldOverrides={editFieldOverrides}
                        currency={store.currency} />
                </ErrorBoundary>
            </DocumentTab.Section>
            <DocumentTab.Section title="Line Items">
                <ErrorBoundary onErrorCaught={store.onReceivingError}>
                    <LineItems
                        lineItems={toJS(store.document.lineItems)} 
                        onUpdateLineItems={store.receiveLineItemsUpdate} 
                        appData={window.__appData}
                        isReadOnly={isReadOnly}
                        validators={store.lineItemValidators}
                        fieldOverrides={lineItemOverrides}
                        currency={store.currency} />
                </ErrorBoundary>
            </DocumentTab.Section>
            <Alert />
            { !isReadOnly && 
            <Button bsSize="sm" onClick={store.save} bsStyle="primary" style={{ margin: '1px' }} disabled={store.isLoading}>
                Upload
            </Button> 
            }
        </DocumentTab>
    </React.Fragment>
    }
}

export default SubmitInvoiceTab;