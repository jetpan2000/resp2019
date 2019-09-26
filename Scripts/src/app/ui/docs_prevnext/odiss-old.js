import $ from 'jquery';

// Document Viewer
const FORM_JQUERY = $('#tmpForm');
const HID_DOC_JQUERY = $('#hidDoc');
const HID_EXTRA_JQUERY = $('#hidExtra');

export function submitDocumentViewer(documentId) {
    HID_DOC_JQUERY.val(documentId);
    FORM_JQUERY.submit();
}

export function changeDocumentInViewer(url) {
    window.OdissViewerBase.loadCustomViewer(url, '{}');
}

export function changeDocumentToOriginalInViewer() {
    window.OdissViewerBase.reloadOriginalViewer();
}

export function searchDocumentGrid() {
    const currentPage = getCurrentPage();;
    window.OdissApp.refreshSearch();

    paginate(currentPage);
}

export function getCurrentPage() {
    return window.OdissApp.TB.page();
}

export function canPaginateNext() {
    const { page, pages } = window.OdissApp.TB.page.info() || {};

    return page < pages - 1;
}

export function canPaginatePrevious() {
    const { page } = window.OdissApp.TB.page.info() || {};

    return page > 0;
}

/** @param {Number|'first'|'next'|'previous'|'last'} page */
export function paginate(page) {
    window.OdissApp.TB.page(page).draw('page');
}

export function getNumberOfSelectedDocuments() {
    return $(".checkBoxColumn > input:checked").length;
}