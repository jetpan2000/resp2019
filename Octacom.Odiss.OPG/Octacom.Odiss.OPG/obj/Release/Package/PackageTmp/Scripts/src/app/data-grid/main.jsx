import React from 'react';
import { inject, observer } from 'mobx-react';
import OdissGrid, { FIELD_TYPES, LOOKUP_TYPES } from '../ui/odiss-grid';

import { mapDynamicItemWithFields } from './helper';

import ActionBar from './actionbar';
import Edit from './edit';

@inject('store')
@observer
class DataGrid extends React.Component {

    constructor(props) {
        super(props);

        this.getData = this.getData.bind(this);
        this.showEditModal = this.showEditModal.bind(this);

        this.initData();
    }

    initData() {
        this.props.store.loadData();
    }

    getData() {
        const { store } = this.props;
        var data = [...store.data];

        return data.map(datum => {
            return mapDynamicItemWithFields(datum, store.fields);
        });
    }

    showEditModal(item, index) {
        this.props.store.showEdit(index);
    }

    render() {
        const { store } = this.props;
        const { appData, serverState, isEditShowing, data } = store;

        store.data.length;
        store.manualRefresh;

        return <React.Fragment>
            <Edit />
            <OdissGrid
                heading={appData.Name}
                rowsPerPage={serverState.rowsPerPage}
                getData={this.getData}
                data={data}
                fields={store.fields}
                openRow={this.showEditModal}
                canOpenRow={appData.EnableUpdate}
                ActionBarComponent={<ActionBar />}
            />     
        </React.Fragment>
    }
}

export default DataGrid;