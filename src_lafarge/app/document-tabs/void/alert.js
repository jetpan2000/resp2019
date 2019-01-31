const ALERT = {
    NONE: {
        HIDE: true,
        MESSAGE: '',
        ICON: '',
        ALERT_TYPE: ''
    },
    INFO: {
        MESSAGE: 'Explain why this document is being archived.',
        ICON: 'question-circle',
        ALERT_TYPE: 'info'
    },
    SUCCESS: {
        MESSAGE: 'This document has been successfully moved to the Archive tab.',
        ICON: 'check-circle',
        ALERT_TYPE: 'success'
    },
    VALIDATION_ERROR: {
        MESSAGE: 'Please check your input',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'danger'
    },
    ERROR: {
        MESSAGE: 'Error archiving this document. Try again later.',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'danger'
    }
};

export default ALERT;