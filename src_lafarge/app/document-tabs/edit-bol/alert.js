const ALERT = {
    NONE: {
        HIDE: true,
        MESSAGE: '',
        ICON: '',
        ALERT_TYPE: ''
    },
    VERIFY_FAILED: {
        MESSAGE: 'Verification failed: {0}',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'warning'
    },
    VERIFY_SUCCESS: {
        MESSAGE: 'Verification successful.',
        ICON: 'check-circle',
        ALERT_TYPE: 'success'
    },
    VERIFY_ERROR: {
        MESSAGE: 'Error verifying this document. Try again later.',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'danger'
    },
    UPDATE_SUCCESS: {
        MESSAGE: 'This document has been updated.',
        ICON: 'check-circle',
        ALERT_TYPE: 'success'
    },
    UPDATE_ERROR: {
        MESSAGE: 'Error updating this document. Try again later.',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'danger'
    },
    GENERIC_ERROR: {
        MESSAGE: 'Error: {0}',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'danger'
    },
    UPDATE_TICKET_NUMBER_WARNING: {
        MESSAGE: 'Warning. Changing to this ticket number and/or plant number will result in no data link for this document. Are you sure that you wish to proceed?',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'warning',
        PROCEED: true
    }
};

export default ALERT;