import React from 'react';
import ReactDOM from 'react-dom';

import Main from './plants/main';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortAmountUp, faSortAmountDown, faSort, faSearch, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'

library.add(faSortAmountUp);
library.add(faSortAmountDown);
library.add(faSort);
library.add(faSearch);
library.add(faExchangeAlt);

ReactDOM.render(React.createElement(Main), document.getElementById('react-root'));