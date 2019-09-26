import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import $ from 'jquery';
import authCheck from 'odiss-auth-check';
import APFilter from './ap-components/ap-filter';
import VendorName from './ap-components/vendor-name';
import ModalHeader from './ui/docs_prevnext'; //'odiss5-document-viewer-prevnext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLongArrowAltLeft, faLongArrowAltRight, faLock, faUserSecret } from '@fortawesome/free-solid-svg-icons'
import * as usersSvc from './services/api/users';

import './styles/custom-react-table.css'

library.add(faLongArrowAltRight);
library.add(faLongArrowAltLeft);
library.add(faLock);
library.add(faUserSecret);

if (window.__pageName === 'InvoiceManagement') {
    ReactDOM.render(<APFilter />, document.getElementById('status-filter-root'));
}

console.log('rendering status filter');

@observer
class ModalHeaderBase extends React.Component {
    constructor(props) {
        super(props);

        this.state = { isDirty: false }

        top.postal.subscribe({
            channel: 'document-viewer',
            topic: 'document.dirtyStatusChanged',
            callback: ({isDirty}) => {
                this.setState({ isDirty });
            }
        });
    }

    render() {
        return <ModalHeader isDirty={this.state.isDirty} />
    }
}

ReactDOM.render(<ModalHeaderBase />, document.getElementById('react-invoice-header'));

function reactInit() {
    $('div[data-vendorname-react]').each((index, element) => {
        var data = $(element).data('vendorname-react');

        ReactDOM.render(<VendorName {...data} />, element);
    });
}

window.postal.subscribe({
    channel: 'app',
    topic: 'draw.complete',
    callback: reactInit
});

async function initFields() {
    var canViewConfidential = await usersSvc.hasPermission('ViewConfidentialDocuments');

    if (!canViewConfidential) {
        $('#87c382d4-f435-e911-842e-005056820bd7').hide();
    }
}

//initFields();

const urlParams = new URLSearchParams(window.location.search)
if (urlParams.get('search-on-load') === 'true') {
    window.postal.subscribe({
        channel: 'app',
        topic: 'grid.isReady',
        callback: () => {
            window.OdissApp.refreshSearch();
        }
    });
}

$('#tmpForm').submit(function (e) {
    e.preventDefault();

   // authCheck().then(() => {
        e.currentTarget.submit();
    //});
});