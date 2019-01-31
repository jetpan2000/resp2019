import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

const noop = (() => { });

class BootstrapConfirm extends React.Component {
    constructor(props) {
        super(props);

        this.yesAction = this.yesAction.bind(this);
        this.noAction = this.noAction.bind(this);
    }

    yesAction(e) {
        e.preventDefault();

        this.props.yesAction();
    }

    noAction(e) {
        e.preventDefault();

        this.props.onClose();
        this.props.noAction();
    }

    close() {
        this.props.onClose();
    }

    render() {
        const { title, message, children, yesText, noText, show, onClose } = this.props;

        return <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{children || message}</Modal.Body>
            <Modal.Footer>
                <Button onClick={this.noAction}>{noText}</Button>
                <Button bsStyle="primary" onClick={this.yesAction}>{yesText}</Button>
            </Modal.Footer>
        </Modal>
    }
}

BootstrapConfirm.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    yesAction: PropTypes.func.isRequired,
    noAction: PropTypes.func,
    yesText: PropTypes.string,
    noText: PropTypes.string,
    show: PropTypes.bool,
    onClose: PropTypes.func
}

BootstrapConfirm.defaultProps = {
    title: 'Are you sure?',
    message: 'Are you sure that you want to perform this action?',
    noAction: noop,
    yesText: 'Yes',
    noText: 'No',
    show: false,
    onClose: noop
}

export default BootstrapConfirm;