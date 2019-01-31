const ALERT = {
    NONE: {
        HIDE: true,
        MESSAGE: '',
        ICON: '',
        ALERT_TYPE: ''
    },
    INFO: {
        MESSAGE: 'Upload a file by dropping in the box or click the box to select the file on your computer.',
        ICON: 'question-circle',
        ALERT_TYPE: 'info'
    },
    SUCCESS: {
        MESSAGE: 'Bill of Lading has been successfully uploaded.',
        ICON: 'check-circle',
        ALERT_TYPE: 'success'
    },
    ERROR: {
        MESSAGE: 'Error while uploading Bill of Lading. Try again later.',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'danger'
    },
    DROP_REJECT: {
        MESSAGE: 'File not allowed. Please ensure that the file format is PDF and that it is not larger than 50 MB.',
        ICON: 'exclamation-circle',
        ALERT_TYPE: 'danger'
    }
};

export default ALERT;