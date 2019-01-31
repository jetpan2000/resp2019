import $ from 'jquery';

export function voidDocumentPostAction() {
    $('#headingEditProperties, #panEditProperties').remove();
    $('#headingNotes, #panNotes').remove();
    $('#headingEmail, #panEmail').remove();
    $('#react-edit-bool-tab-root').remove();
    $('#frmDocuments').submit();
}