import React from 'react';
import { observer, inject } from 'mobx-react';

const ExceptionWidget = inject('store')(observer(({store}) => {
    if (store.exceptionCount === undefined || store.exceptionCount == -1) {
        return null;
    }

    return <div className="exceptions-widget">
       
            <h5>Exceptions</h5>
            <h3>{ store.exceptionCount }</h3>
       
    </div>
}));

export default ExceptionWidget;