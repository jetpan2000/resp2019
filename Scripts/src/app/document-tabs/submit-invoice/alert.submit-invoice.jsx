import React from 'react';
import { Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AlertHeadlessHeadless from 'odiss-alert-headless';
import { inject, observer } from 'mobx-react';

import ErrorBoundary from '../../error-boundary';

/**
 * @param {{submissionAlert: SubmissionAlert, validationStateFromStore: ValidationState, reactError}} options
 */
const getIconForState = ({submissionAlert, validationStateFromStore, reactError}) => {
    switch (submissionAlert) {
        case 'SUCCESS': return 'check-circle';
        case 'SERVER_ERROR': return 'exclamation-circle';
    }

    if (validationStateFromStore !== 'VALID') {
        return 'exclamation-triangle';
    }

    if (reactError) {
        return 'check-circle';
    }

    return null;
}

const AlertView = inject('store')(observer(({store: { submissionAlert, validationState: validationStateFromStore, reactError }}) =>
    <ErrorBoundary>
        <AlertHeadlessHeadless
            visibleWhen={({successState, validationState}) => successState !== 'NONE' || validationState !== 'VALID' || reactError }
            successState={submissionAlert}
            successWhen={(successState) => successState === 'SUCCESS' && !reactError}
            validationState={validationStateFromStore}
            validWhen={(validationState) => validationState === 'VALID'}
            timeoutSeconds={null}
            messages={{
                success: 'Document has been uploaded.',
                error: () => {
                    if (reactError) {
                        return 'An error has occurred.';
                    }
                    else {
                        return 'Could not upload document. Try again later.';
                    }
                },
                invalid: ({successState, validationState}) => {
                    if (validationState === 'INVALID') {
                        return 'Please check your input';
                    }
                    else if (validationState === 'FILE_MISSING') {
                        return 'You must upload file';
                    }
                }
            }}
        >
            {({ visible, state, text, bsStyle }) => {
                if (!visible || !state) {
                    return null;
                }

                return <Alert bsStyle={bsStyle}>
                    <FontAwesomeIcon icon={getIconForState({submissionAlert, validationStateFromStore, reactError})} /> {text}
                </Alert>
            }}
        </AlertHeadlessHeadless>
    </ErrorBoundary>
));

export default AlertView;