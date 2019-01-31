import React from 'react';
import { DropdownButton, MenuItem, Modal, Button } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Upload from './upload';
import Store from './bol-action-picker-store';

//import viewerStyles from '../../../../Content/css/viewer.css';

// TODO - Read https://react-bootstrap.github.io/components/dropdowns/

//const BOLActionPicker = ({ ticketNumber }) => (
//    <div>TODO - Ticket Number: {ticketNumber}</div>);

const store = new Store();

class BOLActionPicker extends React.Component {
    constructor(props) {
        super(props);

        //store.loadDocument(props.ticketNumber);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            showDocumentUploader: false
        };
    }

    handleClose() {
        this.setState({ showDocumentUploader: false });
    }

    handleShow() {
        this.setState({ showDocumentUploader: true });
    }

    render() {
        const { ticketNumber, object } = this.props;

        if (object.FileName) {
            return null;
        }

        return <React.Fragment>
            <DropdownButton id={'bol-action-picker-' + ticketNumber} bsSize="sm" title="" pullRight>
                <MenuItem eventKey="1" onClick={this.handleShow}><FontAwesomeIcon icon="cloud-upload-alt" /> Upload</MenuItem>
            </DropdownButton>
            <Modal show={this.state.showDocumentUploader} onHide={this.handleClose} dialogClassName="modal-dialog-full">
                <Modal.Header closeButton closeLabel="Close">
                    <Modal.Title>Upload Bill of Lading</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-content-full-body">
                    <Upload ticketNumber={ticketNumber} object={object} />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.handleClose} bsStyle="danger">Close</Button>
                </Modal.Footer>
            </Modal>
        </React.Fragment>;
    }
}

//const BOLActionPicker = ({ ticketNumber }) => (
//    <DropdownButton id={'bol-action-picker-' + ticketNumber} bsSize="small" title="" pullRight>
//        <MenuItem eventKey="1"><FontAwesomeIcon icon="cloud-upload-alt" /> Upload</MenuItem>
//    </DropdownButton>
//);

export default BOLActionPicker;