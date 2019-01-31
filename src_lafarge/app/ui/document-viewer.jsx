import React from 'react';
import $ from 'jquery';
import { Col } from 'react-bootstrap';
import propTypes from 'prop-types';
import { toBase64 } from '../utilities/file';

import './document-viewer.scss';

class DocumentViewer extends React.Component {

    async componentDidUpdate(prevProps, prevState) {
        if (this.props.file) {
            // Submit iframe with file
            this.refs.documentFrame;

            var base64 = await toBase64(this.props.file);

            var form = $(`<form action="${this.props.submitUrl}" method="post" target="documentFrame"></form>`);
            form.append($('<input type="hidden" name="base64" />').val(base64));
            form.appendTo(window.document.body);
            form.submit();
        }
    }

    render() {
        return (<div
            className="container-fluid document-viewer"
            style={{ width: '100%', height: '100%', padding: '0px', margin: '0px' }}>
            <div className="row" style={{ width: '100%', height: '100%', padding: '0px', margin: '0px' }}>
                <Col sm={4} md={3} lg={2} className="sidebar">
                    {this.props.children}
                </Col>
                <Col
                    sm={8}
                    md={9}
                    lg={10}
                    style={{ padding: '0px', overflow: 'hidden', height: '100%' }}>
                    <iframe name="documentFrame" frameBorder="0" style={{ overflow: 'hidden', height: '100%', width: '100%' }} height="100%" width="100%" />
                </Col>
            </div>
        </div>);
    }
}

DocumentViewer.propTypes = {
    appId: propTypes.string,
    file: propTypes.instanceOf(File),
    submitUrl: propTypes.string.isRequired
    //setDocument: propTypes.func.isRequired
}

DocumentViewer.defaultProps = {
    //setDocuments: () => { } // noop
};

export default DocumentViewer;