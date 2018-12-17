import React from 'react';
import { Alert, FormControl, Button } from 'react-bootstrap';
import { observer, Provider } from 'mobx-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isEqual, extend } from 'lodash';
import DocumentTab, { EditProperties } from '../../ui/document-tab';
import BootstrapConfirm from '../../ui/bootstrap-confirm';
import Store from './store';
import LineItems from './line-items';
import ActionBar from './edit-action-bar';
import { ClipLoader as Spinner } from 'react-spinners';

var store = new Store();
store.loadLookupOptions();
store.loadDocument(window.__invoiceTabState.documentId);

@observer
class DocumentTabMain extends React.Component {
    constructor(props) {
        super(props);

        this.receiveDocumentUpdate = this.receiveDocumentUpdate.bind(this);
    }

    receiveDocumentUpdate(updatedProperties) {
        extend(store.document, updatedProperties);
    }

    renderAlert() {
        const { activeAlert } = store;

        if (!activeAlert || activeAlert.HIDE) {
            return null;
        }

        return <Alert bsStyle={activeAlert.ALERT_TYPE}>
            <FontAwesomeIcon icon={activeAlert.ICON} /> {activeAlert.MESSAGE}
        </Alert>
    }

    render() {
        return <Provider store={store}>
            <DocumentTab title="Item Lines">
                { store.document && <React.Fragment>
                    { /*<EditProperties document={store.document} onUpdateDocument={this.receiveDocumentUpdate} appData={window.__appData} /> */}
                    <LineItems />
                    {this.renderAlert()}
                        <ActionBar />
                </React.Fragment> }
            </DocumentTab>
        </Provider>
    }
}

export default DocumentTabMain;