import $ from 'jquery';
import { setTimeout } from 'timers';
import React from 'react';
import ReactDOM from 'react-dom';

import Picker from './bol-actions/picker';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle, faCloudUploadAlt, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

library.add(faQuestionCircle);
library.add(faCloudUploadAlt);
library.add(faCheckCircle);
library.add(faExclamationCircle);

$(document).ready(() => {

    function reactInit() {
        $('div[data-react-ticket-no]').each((index, element) => {
            var value = $(element).data('react-ticket-no');
            var object = $(element).data('react-object');

            ReactDOM.render(<Picker ticketNumber={value} object={object} />, element);
        });
    }

    window.postal.subscribe({
        channel: 'app',
        topic: 'draw.complete',
        callback: reactInit
    });
});