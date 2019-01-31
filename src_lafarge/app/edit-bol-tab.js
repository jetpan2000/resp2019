import React from 'react';
import ReactDOM from 'react-dom';

import EditBOLTab from './document-tabs/edit-bol/tab';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

library.add(faQuestionCircle);
library.add(faCheckCircle);
library.add(faExclamationCircle);

ReactDOM.render(<EditBOLTab />, document.getElementById('react-edit-bool-tab-root'));