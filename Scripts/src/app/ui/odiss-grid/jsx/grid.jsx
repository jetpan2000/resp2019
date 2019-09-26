import React from 'react';
import classNames from 'classnames';
import ReactTable, { ReactTableDefaults } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { keys, toLower, isEqual, find } from 'lodash';
import matcher from 'matcher';
import Sticky from 'react-stickynode';

import { orderBy } from 'lodash';

import 'react-table/react-table.css';
import '../../../styles/custom-react-table.css';

import PROP_TYPES from '../grid-prop-types';
import FIELD_TYPES from '../../odiss-field-renderer/field-types';
import PIVOT_AGGREGATES, { getAggregateFunction, aggregateFirstValue } from '../pivot-aggregates';
import { formatDate } from '../../../utilities/datetime-formatter';

const stickyFix = () => {
    window.scrollBy(0, 1);
}

const pageTop = () => {
    window.scroll(0, 0);
}

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

const ThComponent = ({ children, toggleSort, className, sortable, ...others }) => {
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

    const HeaderText = () => sortable ? <React.Fragment>
        <div style={{ display: 'inline-block', width: 'calc(100% - 30px)', textAlign: 'left' }}>
            {children[0].props.children}
        </div>
        <div style={{ display: 'inline-block' }}>
            <FontAwesomeIcon className={classNames({ 'sort-icon': true, 'is-sorted': isSorted })} onClick={toggleSort} icon={icon} rotation={rotation} size="lg" />
        </div>
    </React.Fragment> : <React.Fragment>{children[0].props.children}</React.Fragment>;

    return <div className="rt-th rt-resizable-header" {...others}>
        <HeaderText />
        {children[1]}
    </div>
};

class Grid extends React.Component {

    constructor(props) {
        super(props);

        var sorted = orderBy(this.props.fields.filter(field => field.sort), field => field.sort.priority).map(field => {
            return {
                id: field.name,
                desc: field.sort.order === 'desc'
            };
        });

        this.state = {
            page: 0,
            sorted: sorted
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

        if (field.dataType === FIELD_TYPES.DATE && value) {
            return formatDate(value);
        }

        if (!field.lookupType) {
            return value;
        }

        return masterLookup(field.lookupCollection, value, item => item[field.lookupText], item => item[field.lookupValue]);
    }

    getColumns(data) {
        var fields = this.props.fields;

        fields = orderBy(fields, x => x.order && x.order.grid);

        return fields.map(field => {
            var column = {
                id: field.name,
                Header: field.text,
                accessor: field.valueAccessor || field.name,
                show: !field.visibility || field.visibility.grid !== false,
                sortable: field.sortable
            };

            if (field.customElement) {
                column.Cell = field.customElement;
            }
            else if (field.entryDetails && this.props.canOpenRow) {
                column.Cell = cellData => {
                    const { value, index } = cellData;

                    if (!cellData.groupedByPivot) {
                        cellData.pivoted = false;
                    }

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
                    column.filterMethod = (filter, row) => { 
                        var rowMatches = (currentRow) => {
                            var rowValue = currentRow[filter.id];
                            if (filter.value.isBlank) {
                                return rowValue === '' || rowValue === null || rowValue === undefined;
                            }

                            return toLower(rowValue).indexOf(toLower(filter.value)) > -1 || matcher.isMatch(rowValue, filter.value);
                        }

                        var subRowsMatching = (row._subRows && row._subRows.filter(rowMatches)) || [];

                        // Attempt to auto-expand found items.. leave it out for now. Too time consuming to implement efficiently.
                        // if (subRowsMatching.length > 1) {
                        //     this.setState(prevState => ({
                        //         expanded: {
                        //             ...prevState.expanded,
                        //             // ...subRowsMatching.map(subRow = {

                        //             // })
                        //         }
                        //     }));
                        // }

                        return rowMatches(row) || subRowsMatching.length > 0;
                    }
                }
            }

            column.Aggregated = ({value, subRows}) => {
                var val = value;

                if (field.pivotAggregateValue) {
                    // Apply sorting first
                    var values = subRows.map(row => row[field.name]);

                    val = getAggregateFunction(field.pivotAggregateValue)(values);
                }

                return <span>{this.getDisplayValueForField(field, val)}</span>;
            }

            column.aggregate = (values) => {
                var val = values;

                var sortEntry = this.state.sorted && find(this.state.sorted, x => x.id === field.name);

                if (sortEntry) {
                    const { defaultSortMethod } = ReactTableDefaults;
                    val.sort((a, b) => {
                        return !sortEntry.desc ? defaultSortMethod(a, b) : defaultSortMethod(b, a);
                    });
                }

                return getAggregateFunction(field.pivotAggregateValue)(val);
            };

            return column;
        });
    }

    getPivotBy() {
        var fields = this.props.fields;

        fields = orderBy(fields, x => x.order && x.order.grid);

        return fields.filter(f => f.isPivot).map(f => f.name);
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
                defaultPageSize={this.props.rowsPerPage}
                data={data}
                columns={this.getColumns(data)}
                page={this.state.page}
                sorted={this.state.sorted}
                expanded={this.state.expanded}
                onPageChange={(pageIndex) => { this.setState({ page: pageIndex }, pageTop) }}
                onSortedChange={(sorted) => { this.setState({ sorted: sorted }, stickyFix) }}
                onExpandedChange={(column, e, isTouch) => { this.setState({expanded: column}, stickyFix)}}
                className='-striped'
                PaginationComponent={Pagination}
                ThComponent={ThComponent}
                TheadComponent={(props) => (
                    <Sticky top="nav">
                        <ReactTableDefaults.TheadComponent {...props} />
                    </Sticky>
                )}
                TrGroupComponent={(args) => {
                    const { rowIndex, groupedByPivot, ...props } = args;

                    if ((rowIndex === undefined || rowIndex > data.length) && !groupedByPivot) {
                        return null;
                    }

                    return <ReactTableDefaults.TrGroupComponent {...props} />;
                }}
                getTrGroupProps={(state, rowInfo, column, instance) => {
                    var props = ReactTableDefaults.getTrGroupProps(state, rowInfo, column, instance);

                    var index = rowInfo && rowInfo.row && rowInfo.row._index;
                    props.rowIndex = index;
                    props.groupedByPivot = rowInfo && rowInfo.groupedByPivot;

                    return props;
                }}
                getTheadThProps={(state, rowInfo, column, instance) => {
                    return { 
                        sortable: column.sortable === undefined ? true : !! column.sortable, 
                        ...ReactTableDefaults.getTheadThProps(state, rowInfo, column, instance) 
                    };
                }}
                pivotBy={this.getPivotBy()}
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