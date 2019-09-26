import React from 'react';
import { Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AlertHeadlessHeadless from 'odiss-alert-headless';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import alert from './alert';

const AlertView = inject('store')(observer(({store: { activeAlert, validationResults: validationState, errorMessage, validationMessage }}) => 
    <AlertHeadlessHeadless
        visibleWhen={({successState, validationState}) => successState != alert.NONE}
        successState={toJS(activeAlert)}
        successWhen={(activeAlert) => [ alert.SUCCESS.CODE, alert.VALIDATION_ERROR.CODE, alert.NONE.CODE ].indexOf(activeAlert.CODE) > -1}
        validationState={validationState}
        validWhen={(validationState) => activeAlert.CODE === alert.SUCCESS.CODE || (validationState.every(x => x === true) && activeAlert.CODE !== alert.VALIDATION_ERROR.CODE)}
        timeoutSeconds={null}
        messages={{
            success: alert.SUCCESS.MESSAGE,
            error: () => { 
                return `${alert.ERROR.MESSAGE} ${errorMessage}`;
            },
            invalid: ({successState, validationState}) => {
                return validationMessage || alert.VALIDATION_ERROR.MESSAGE;
            }
        }}
    >
        {({ visible, state, text, bsStyle }) => {
            if (!visible || !state || activeAlert.HIDE) {
                return null;
            }

            return <Alert bsStyle={bsStyle}>
                <FontAwesomeIcon icon={activeAlert.ICON} /> {text}
            </Alert>
        }}
    </AlertHeadlessHeadless>
));

export default AlertView;