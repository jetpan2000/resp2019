import React from 'react';
import { inject, observer } from 'mobx-react';

import { Button } from 'react-bootstrap';

@inject('store')
@observer
class InvoiceEditActionBar extends React.Component {
    constructor (props) {
        super(props);
    }

    actionOnClick(action, e) {
        e.preventDefault();

        action.func();
    }

    render() {
        if (this.props.store.appData.EnableItemlinesUpdate === false) {
            return "";
        }

        return <div style={{ marginTop: '10px' }}>
            { this.props.store.actions.map(action => (
                <Button 
                    key={action.props.key} 
                    bsSize="sm" 
                    onClick={this.actionOnClick.bind(this, action)} 
                    bsStyle={action.props.bsStyle}
                    style={{ margin: '1px' }}
                >{action.name}</Button>
            )) }
        </div>
    }
}

export default InvoiceEditActionBar;