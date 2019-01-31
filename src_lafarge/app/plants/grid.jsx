import React from 'react';
import { inject, observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import classNames from 'classnames';
import _ from 'lodash';
import ReactTable, { ReactTableDefaults } from 'react-table';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import 'react-table/react-table.css';
import './../styles/custom-react-table.css';

import EditRow from './editor';

const editRow = (row) => {
    return <EditRow rowIndex={row.index} />;
};

const ObservedCell = observer(({ value }) => {
    return <div>{value}</div>;
});

const Pagination = ({ canNext, canPrevious, page, pages, onPageChange }) => {

    const onChange = (pageToChangeTo, e) => {
        e.preventDefault();

        onPageChange(pageToChangeTo);
    }

    const onChangePrev = (e) => {
        e.preventDefault();

        if (!canPrevious) {
            return;
        }

        onChange(page - 1, e);
    }

    const onChangeNext = (e) => {
        e.preventDefault();

        if (!canNext) {
            return;
        }

        onChange(page + 1, e);
    }

    return <div className="pull-right">
        <div className="dataTables_paginate paging_simple_numbers">
            <ul className="pagination">
                <li className={classNames({ 'paginate_button': true, 'previous': true, 'disabled': !canPrevious })}>
                    <a href="#" onClick={onChangePrev}>Previous</a>
                </li>
                {_.range(0, pages).map(p => (<li key={'page-' + p} className={classNames({ "paginate_button": true, 'active': page === p })}>
                    <a href="#" onClick={onChange.bind(this, p)}>{p + 1}</a>
                </li>))}
                <li className={classNames({ 'paginate_button': true, 'previous': true, 'disabled': !canNext })}>
                    <a href="#" onClick={onChangeNext}>Next</a>
                </li>
            </ul>
        </div>
    </div>
};

const ThComponent = inject('store')(observer(({ children, toggleSort, store }) => {
    var First = children[0];

    return <div className="rt-th rt-resizable-header">
        <div className="rt-resizable-header-content">
            <span style={{ float: 'left' }}>{First}</span>
            <FontAwesomeIcon onClick={toggleSort} icon="sort" style={{ float: 'right' }} />
        </div>
    </div>
}));

const masterLookup = (masterList, identifier, valueAccessor, idAccessor = x => x.id) => {
    var masterItem = _.find(masterList, x => idAccessor(x) === identifier);

    if (!masterItem) {
        return null;
    }

    return valueAccessor(masterItem);
};

@inject('store')
@observer
export default class Grid extends React.Component {

    // Overrides

    // Added features

    addNew() {
        const { store } = this.props;
        store.openModalNew();
    }

    sort(a, b, desc) {
        if (!a && desc) {
            return Number.POSITIVE_INFINITY;
        }
        else if (!a && !desc) {
            return Number.NEGATIVE_INFINITY;
        }

        return ReactTableDefaults.defaultSortMethod(a, b, desc);
    }

    // Render

    render() {
        const { store } = this.props;
        store.manualRefresh;
        const data = [...store.plants];

        const NumberCell = ({ value, index }) => {

            if (!store.canManage) {
                return <div>{value}</div>;
            }

            const onClick = (e) => {
                e.preventDefault();
                store.openModal(index);
            }

            return <div>
                <a href="#" className="link-open-document" onClick={onClick}>{value}</a>
            </div>;
        };

        const columns = [
            { Header: 'Number', Cell: NumberCell, accessor: 'number' },
            { Header: 'Name', Cell: <ObservedCell />, accessor: 'name' },
            { Header: 'Business Line', Cell: <ObservedCell />, id: 'businessLineID', accessor: item => masterLookup(store.businessLines, item.businessLineID, x => x.name) || item.businessLineName },
            { Header: 'Region', Cell: <ObservedCell />, id: 'regionID', accessor: item => masterLookup(store.regions, item.regionID, x => x.name) || item.regionName },
            { Header: 'Active', Cell: <ObservedCell />, id: 'isActive', accessor: x => x.isActive ? 'Yes' : 'No' },
        ];

        return <div style={{ maxWidth: '1200px' }}>
            {store.canManage && <Button type="button" bsStyle="primary" onClick={this.addNew.bind(this)}>
                <span className="glyphicon glyphicon-plus" aria-hidden="true"></span> &nbsp;
                Create
            </Button>}
            <EditRow />
            <ReactTable
                sortable={true}
                defaultSorted={[{ id: 'number', desc: false }]}
                defaultSortMethod={this.sort}
                defaultPageSize={15}
                data={data}
                columns={columns}
                page={store.page}
                sorted={store.sorted}
                onPageChange={(pageIndex) => { store.page = pageIndex; }}
                onSortedChange={(sorted) => { store.sorted = sorted; }}
                className='-striped'
                PaginationComponent={Pagination}
                ThComponent={ThComponent}
            />
            <DevTools />
        </div>;
    }

}