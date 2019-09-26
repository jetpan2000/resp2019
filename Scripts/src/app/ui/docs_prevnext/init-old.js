import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';
import ModalHeader from './modal-header';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLongArrowAltLeft, faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons'

library.add(faLongArrowAltRight);
library.add(faLongArrowAltLeft);

const initOld = () => {
    const header = $('#modDocument').find('.modal-header');
    var reactRoot = header.find('#react-invoice-header');

    if (reactRoot.length === 0) {
        header.find('h4').attr('style', 'display: inline-block; width: 325px')
        header.append('<div id="react-invoice-header" style="display:inline-block; width: 300px; margin-left: calc(50% - 325px - 100px);">')

        reactRoot = header.find('#react-invoice-header');
    }

    render(<ModalHeader />, reactRoot[0]);
};

export default initOld;