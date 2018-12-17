import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('store')
class ActionBar extends React.Component {

    constructor(props) {
        super(props);

        this.showCreate = this.showCreate.bind(this);
    }

    showCreate(e) {
        const { store } = this.props;
        
        e.preventDefault();

        store.showCreate();
    }

    render() {
        return <div className="list-group">
            {this.props.store.appData.EnableCreate && <a href="#" onClick={this.showCreate} className="list-group-item">
                Create <span className="pull-right glyphicon glyphicon-plus"></span>
            </a>}
        </div>
    }
}

export default ActionBar;