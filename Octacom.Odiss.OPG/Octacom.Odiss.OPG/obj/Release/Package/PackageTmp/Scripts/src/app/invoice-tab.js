import React from 'react';
import ReactDOM from 'react-dom';
import InvoiceTab from './document-tabs/invoice';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

library.add(faPlus);
library.add(faTimes);
library.add(faCheckCircle);
library.add(faExclamationCircle);

ReactDOM.render(<InvoiceTab />, document.getElementById('react-invoice-tab-root'));