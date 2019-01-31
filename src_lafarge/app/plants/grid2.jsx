import React from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';
import DevTools from 'mobx-react-devtools';
import _ from 'lodash';

import OdissGrid, { FIELD_TYPES, LOOKUP_TYPES } from '../ui/odiss-grid';

import EditRow from './editor';

const { __serverState } = window;

@inject('store')
@observer
export default class Grid extends React.Component {

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.showEditModal = this.showEditModal.bind(this);
    }

    getData(searchParameters) {
        return [...this.props.store.plants];
    }

    showNewModal(e) {
        e.preventDefault();
        this.props.store.openModalNew();
    }

    showEditModal(plant, index) {
        this.props.store.openModal(index);
    }

    // Render

    render() {
        const { store } = this.props;

        const fields = [
            { name: 'number', text: 'Number', dataType: FIELD_TYPES.STRING, entryDetails: true },
            { name: 'name', text: 'Name', dataType: FIELD_TYPES.STRING },
            { name: 'businessLineID', text: 'Business Line', dataType: FIELD_TYPES.GUID, lookupCollection: toJS(store.businessLines), lookupValue: 'id', lookupText: 'description', lookupType: LOOKUP_TYPES.DROPDOWN },
            { name: 'regionID', text: 'Region', dataType: FIELD_TYPES.GUID, lookupCollection: toJS(store.regions), lookupText: 'name', lookupValue: 'id', lookupType: LOOKUP_TYPES.DROPDOWN },
            { name: 'isActive', text: 'Active', dataType: FIELD_TYPES.BOOLEAN_YESNO }
        ];

        store.plants.length;
        store.manualRefresh;

        const ActionBar = () => (<div className="list-group">
            <a href="#" onClick={this.showNewModal.bind(this)} className="list-group-item">
                Create <span className="pull-right glyphicon glyphicon-plus"></span>
            </a>
        </div>)

        return <React.Fragment>
            <EditRow />
            <OdissGrid
                heading="Plants"
                getData={this.getData}
                openRow={this.showEditModal}
                data={store.plants}
                fields={fields}
                rowsPerPage={__serverState.rowsPerPage}
                canOpenRow={__serverState.canEdit}
                ActionBarComponent={store.canManage && <ActionBar />}
            />
        </React.Fragment>;
    }

}