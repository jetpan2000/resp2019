import React from 'react';
import classNames from 'classnames';
import ReactTable, { ReactTableDefaults } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { keys, toLower, isEqual } from 'lodash';
import matcher from 'matcher';
import Sticky from 'react-stickynode';

import { orderBy } from 'lodash';

import 'react-table/react-table.css';
import '../../../styles/custom-react-table.css';

import PROP_TYPES from '../grid-prop-types';
import FIELD_TYPES from '../field-types';

const masterLookup = (masterList, identifier, valueAccessor, idAccessor = x => x.id) => {
    var masterItem = _.find(masterList, x => idAccessor(x) === identifier);

    if (!masterItem) {
        return null;
    }

    return valueAccessor(masterItem);
};

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

const ThComponent = ({ children, toggleSort, className, ...others }) => {
    var icon = 'exchange-alt';
    var rotation = 90;
    var isSorted = false;

    if (className.indexOf('sort-desc') > -1) {
        icon = 'sort-amount-up';
        rotation = null;
        isSorted = true;
    }
    else if (className.indexOf('sort-asc') > -1) {
        icon = 'sort-amount-down';
        rotation = null;
        isSorted = true;
    }

    const HeaderText = () => <React.Fragment>
        <div style={{ display: 'inline-block', width: 'calc(100% - 30px)', textAlign: 'left' }}>
            {children[0].props.children}
        </div>
        <div style={{ display: 'inline-block' }}>
            <FontAwesomeIcon className={classNames({ 'sort-icon': true, 'is-sorted': isSorted })} onClick={toggleSort} icon={icon} rotation={rotation} size="lg" />
        </div>
    </React.Fragment>;

    return <div className="rt-th rt-resizable-header" {...others}>
        <HeaderText />
        {children[1]}
    </div>
};

class Grid extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            sorted: []
        };

        if (props.serverSideSearch) {
            console.warn('WARNING - Server side searching is NOT supported yet!');
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!isEqual(this.props.searchParameters, prevProps.searchParameters)) {
            this.setState({ page: 0 });
        }
    }

    buildSearchParameters() {
        return {};
    }

    getData() {
        if (this.props.serverSideSearch) {
            return this.props.getData(this.buildSearchParameters());
        }
        else {
            return this.props.getData();
        }
    }

    getDisplayValueForField(field, value) {
        if (field.dataType === FIELD_TYPES.BOOLEAN_YESNO) {
            return value ? 'Yes' : 'No';
        }

        if (!field.lookupType) {
            return value;
        }

        return masterLookup(field.lookupCollection, value, item => item[field.lookupText], item => item[field.lookupValue]);
    }

    getColumns(data) {
        var fields = this.props.fields
            .filter(field => !field.visibility || field.visibility.grid !== false);

        fields = orderBy(fields, x => x.order && x.order.grid);

        return fields.map(field => {
            var column = {
                id: field.name,
                Header: field.text,
                accessor: field.valueAccessor || field.name
            };

            if (field.customElement) {
                column.Cell = field.customElement;
            }
            else if (field.entryDetails && this.props.canOpenRow) {
                column.Cell = ({ value, index }) => {

                    const onClick = (e) => {
                        e.preventDefault();

                        var row = data[index];

                        this.props.openRow(row, index);
                    }

                    return <div>
                        <a href="#" className="link-open-document" onClick={onClick}>{this.getDisplayValueForField(field, value)}</a>
                    </div>
                }
            }
            else {
                column.Cell = ({ value }) => (<div>{this.getDisplayValueForField(field, value)}</div>)
            }

            switch (field.dataType) {
                case FIELD_TYPES.STRING: {
                    column.filterMethod = (filter, row) => toLower(row[filter.id]).indexOf(toLower(filter.value)) > -1 || matcher.isMatch(row[filter.id], filter.value);
                }
            }

            return column;
        });
    }

    renderTotals(data) {
        // TODO - retrieve info from server
        return null;
    }

    getFiltered() {
        const { searchParameters } = this.props;

        var paramKeys = keys(searchParameters);

        var mapped = paramKeys.map(key => {
            return {
                id: key,
                value: searchParameters[key]
            }
        });

        return mapped;
    }

    render() {
        if (!this.props.serverSideSearch) {
            this.props.searchParameters;
        }

        var data = this.getData();

        return <div>
            {this.renderTotals()}
            <ReactTable
                sortable={true}
                filtered={this.getFiltered()}
                defaultSorted={[{ id: 'number', desc: false }]}
                defaultSortMethod={this.sort}
                defaultPageSize={this.props.rowsPerPage}
                //pageSize={Math.min(this.props.rowsPerPage, Math.max(data.length, 10))} // show at least 10 records but otherwise up to this.props.rowsPerPage
                data={data}
                columns={this.getColumns(data)}
                page={this.state.page}
                sorted={this.state.sorted}
                onPageChange={(pageIndex) => { this.setState({ page: pageIndex }) }}
                onSortedChange={(sorted) => { this.setState({ sorted: sorted }) }}
                className='-striped'
                PaginationComponent={Pagination}
                ThComponent={ThComponent}
                TheadComponent={(props) => (
                    <Sticky top="nav">
                        <ReactTableDefaults.TheadComponent {...props} />
                    </Sticky>
                )}
                TrGroupComponent={(args) => {
                    const { rowIndex, ...props } = args;

                    if (rowIndex === undefined || rowIndex > data.length) {
                        return null;
                    }

                    return <ReactTableDefaults.TrGroupComponent {...props} />;
                }}
                getTrGroupProps={(state, rowInfo, column) => {
                    var props = ReactTableDefaults.getTrGroupProps;

                    var index = rowInfo && rowInfo.row && rowInfo.row._index;
                    props.rowIndex = index;

                    return props;
                }}
                NoDataComponent={() => null}
            //style={{ maxHeight: this.props.gridHeight }}
            />
        </div>;
    }
}

Grid.propTypes = PROP_TYPES;

Grid.defaultProps = {
    openRow: (row) => {
        console.log(row); // TODO
    }
}

export default Grid;