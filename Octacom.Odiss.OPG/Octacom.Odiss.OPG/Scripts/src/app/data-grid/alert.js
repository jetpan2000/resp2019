const ALERT = {
    NONE: {
        HIDE: true,
        MESSAGE: '',
        ICON: '',
        ALERT_TYPE: ''
    },
    SUCCESS: {
        MESSAGE: 'Save completed.',
        ICON: 'check-circle',
        ALERT_TYPE: 'success'
    },
    ERROR: {
        MESSAGE: 'Error while saving changes. Try again later.',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'danger'
    }
};

export default ALERT;