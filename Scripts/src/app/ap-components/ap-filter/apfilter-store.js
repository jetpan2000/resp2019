import { observable, action } from 'mobx';
import * as documentsApi from '../../services/api/documents';
import $ from 'jquery';
import { searchDocumentGrid } from '../../helpers/odiss-old';

class APFilterStore {

    constructor() {
        this.refresh();

        top.postal.subscribe({
            channel: 'document-viewer',
            topic: 'document.loaded',
            callback: ({document, history, allowedActions}) => {
                this.refresh()
            }
        });

        top.postal.subscribe({
            channel: 'document-viewer',
            topic: 'document.uploaded',
            callback: ({document}) => {
                this.refresh()
            }
        });
    }

    @observable documentStatusSummary = [];
    @observable exceptionCount = undefined;

    get exceptionsUrl() {
        return window.__exceptionsUrl + '?search-on-load=true';
    }

    @action async loadData() {

        console.log('loading status' );
        this.documentStatusSummary = await documentsApi.getDocumentStatusSummary();
        this.exceptionCount = await documentsApi.getExceptionCount();
    }

    @action initiateStatusFilterSearch(statusCode) {
        $('select[title="Invoice Status"]').val(statusCode);
        searchDocumentGrid();
    }

    refresh() {
        this.loadData();
      //  searchDocumentGrid();
    }
}

export default APFilterStore;