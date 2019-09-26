import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { isArray } from 'lodash-es';
import BootstrapConfirm from 'bootstrap-confirm';
import * as OdissOld from './odiss-old';

class ModalHeader extends React.Component {
    constructor(props) {
        super(props);

        this.nextClick = this.nextClick.bind(this);
        this.prevClick = this.prevClick.bind(this);
        this.refreshNavStates = this.updateNavStates.bind(this);

        window.postal.subscribe({
            channel: 'app',
            topic: 'document.open',
            callback: ({ dataId, dataExtra }, envelope) => {
                this.documentId = dataId;

                if (isArray(this.documentId) && this.documentId.length === 1) {
                    this.documentId = this.documentId[0];
                }

                this.updateNavStates();
            }
        });

        this.state = {
            canGoPrev: !!this.prevDocumentId,
            canGoNext: !!this.nextDocumentId,
            showNavWarning: false,
            documentId: null,
            freeze: false
        };
    }

    documentId = null;

    storedNavFunction = () => {}; // Noop initially

    get datagrid() {
        return window.OdissApp && window.OdissApp.TB;
    }

    // Document Ids currently visible in grid
    get availableDocumentIds() {
        if (!this.datagrid) {
            return [];
        }

        return this.datagrid.data().filter(d => d instanceof Array).map(d => d[0]);
    }

    get nextDocumentId() {
        if (isArray(this.documentId)) {
            return null;
        }

        var currentIndex = this.availableDocumentIds.indexOf(this.documentId);

        if (currentIndex >= this.availableDocumentIds.length) {
            return null;
        }

        return this.availableDocumentIds[currentIndex + 1];
    }

    get currentDocumentNum() {
        if (isArray(this.documentId)) {
            return 0;
        }

        var currentIndex = this.availableDocumentIds.indexOf(this.documentId);

        if (currentIndex < 0) {
            return 0;
        }

        return currentIndex + 1;
    }

    get prevDocumentId() {
        if (isArray(this.documentId)) {
            return null;
        }

        var currentIndex = this.availableDocumentIds.indexOf(this.documentId);

        if (currentIndex <= 0) {
            return null;
        }

        return this.availableDocumentIds[currentIndex - 1];
    }

    get documentFrame() {
        return document.getElementById('iViewerBase');
    }

    updateNavStates() {
        this.setState({
            canGoPrev: !!this.prevDocumentId || OdissOld.canPaginatePrevious(),
            canGoNext: !!this.nextDocumentId || OdissOld.canPaginateNext(),
            showNavWarning: false
        });
    }

    navigateTo(documentId) {
        const funcInner = () => {
            OdissOld.submitDocumentViewer(documentId);

            this.documentId = documentId;
            this.updateNavStates();
        };

        if (this.props.isDirty) {
            this.storedNavFunction = funcInner;

            this.setState({
                showNavWarning: true
            });
        }
        else {
            funcInner();
        }
    }

    nextClick(e) {
        e.preventDefault();

        if (this.nextDocumentId) {
            this.navigateTo(this.nextDocumentId);
        }
        else {
            this.setState({ freeze: true });
            OdissOld.paginate('next');

            window.setTimeout(() => {
                const firstIndex = 0;
                this.setState({ freeze: false });
                this.navigateTo(this.availableDocumentIds[firstIndex]);
            }, 500);
        }
    }

    prevClick(e) {
        e.preventDefault();

        if (this.prevDocumentId) {
            this.navigateTo(this.prevDocumentId);
        }
        else {
            this.setState({ freeze: true });
            OdissOld.paginate('previous');

            window.setTimeout(() => {
                const lastIndex = this.datagrid.data().length - 1;
                this.setState({ freeze: false });
                this.navigateTo(this.availableDocumentIds[lastIndex]);
            }, 500);
        }
    }

    render() {
        const boolVisibility = boolValue => boolValue ? 'visible' : 'hidden';

        if (OdissOld.getNumberOfSelectedDocuments() > 1) {
            return null;
        }

        const { isDirty, ...restProps } = this.props;

        return <React.Fragment>          
            <ButtonToolbar {...restProps}>
                <Button bsStyle="primary" onClick={this.prevClick} style={{ visibility: boolVisibility(this.state.canGoPrev), margin: '0 5px' }} disabled={this.state.freeze}>
                    <FontAwesomeIcon icon="long-arrow-alt-left" /> Previous
                </Button>
                <Button bsStyle="primary" onClick={this.nextClick} style={{ visibility: boolVisibility(this.state.canGoNext), margin: '0 5px' }} disabled={this.state.freeze}>
                    Next <FontAwesomeIcon icon="long-arrow-alt-right" />
                </Button> 
               
            </ButtonToolbar>           
          
            <BootstrapConfirm
                show={isDirty && this.state.showNavWarning}
                title="Warning"
                message="You have made changes to the current document. If you don't save your changes first then they will be lost. Are you sure that you want to proceed?"
                yesAction={this.storedNavFunction}
                onClose={() => { this.setState({showNavWarning: false}); }}
             />
        </React.Fragment>
    }
}

export default ModalHeader;