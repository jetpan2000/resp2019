import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';
import $ from 'jquery';
import { FormControl, Button, Alert } from 'react-bootstrap';
import DocumentViewer from '../../ui/document-viewer';
import DocumentTab from '../../ui/document-tab';
import DocumentTabForm from '../../ui/document-tab-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as documentsApi from '../../services/api/documents';
import ALERT from './alert';

export default class UploadMain extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            file: null,
            activeAlert: ALERT.INFO
        };

        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        // This is a hack, do not recommend doing this

        const node = ReactDOM.findDOMNode(this);
        $(node).closest('.modal-content').addClass('modal-content-full');
    }

    async submit(e) {
        e.preventDefault();

        try {
            await documentsApi.uploadBOL(this.props.object.GUID, this.state.file);

            this.setState({
                activeAlert: ALERT.SUCCESS
            });
        }
        catch (e) {
            this.setState({
                activeAlert: ALERT.ERROR
            });
        }
    }

    onFilesDropped(files) {
        var file = files[0]; // no multiples
        this.setState({ file: file, activeAlert: ALERT.NONE });
    }

    onDropRejected(arg1, arg2, arg3) {
        this.setState({
            file: null,
            activeAlert: ALERT.DROP_REJECT
        });
    }

    renderAlert() {
        const { activeAlert } = this.state;

        if (activeAlert.HIDE) {
            return null;
        }

        return <Alert bsStyle={activeAlert.ALERT_TYPE}>
            <FontAwesomeIcon icon={activeAlert.ICON} /> {activeAlert.MESSAGE}
        </Alert>
    }

    render() {
        const { ticketNumber } = this.props;

        return <DocumentViewer appId={window.__appId} submitUrl={window.__submitUrl} file={this.state.file}>
            <DocumentTab title="Upload" defaultExpanded>
                <Dropzone onDropAccepted={this.onFilesDropped.bind(this)} onDropRejected={this.onDropRejected.bind(this)} multiple={false} accept="application/pdf" maxSize={50 * 1024 * 1024} style={{ textAlign: 'center', verticalAlign: 'middle', lineHeight: '50px', border: '4px', borderStyle: 'dotted' }}>
                    <span style={{ display: 'block', fontSize: '20px' }}>
                        {!this.state.file && 'Click to upload file'}
                        {this.state.file && 'Click to replace file'}
                    </span>
                    <FontAwesomeIcon icon="cloud-upload-alt" size="4x" />
                </Dropzone>
            </DocumentTab>
            <DocumentTab title="Properties" defaultExpanded>
                <DocumentTabForm onSubmit={this.submit}>
                    <DocumentTabForm.Field controlId="bol">
                        <DocumentTabForm.Label>Ticket Number</DocumentTabForm.Label>
                        <DocumentTabForm.Control>
                            <FormControl type="text" placeholder="Ticket Number" defaultValue={ticketNumber} readOnly />
                        </DocumentTabForm.Control>
                    </DocumentTabForm.Field>
                    <DocumentTabForm.Footer>
                        {this.state.file && <Button bsSize="sm" bsStyle="primary" type="submit">Submit</Button>}
                    </DocumentTabForm.Footer>
                </DocumentTabForm>
                {this.renderAlert()}
            </DocumentTab>
        </DocumentViewer>
    }
}