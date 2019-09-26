import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { orderBy } from 'lodash';

import GRID_PROP_TYPES from '../grid-prop-types';

import Grid from './grid';

import GridSearch from './defaults/grid-search';

class OdissGrid extends React.Component {

    constructor(props) {
        super(props);

        this.performSearch = this.performSearch.bind(this);
        this.getData = this.getData.bind(this);

        this.state = {
            searchParameters: {},
            serverData: null,
            serverPagination: null
        };
    }

    async performSearch(parameters) {
        const { serverSideSearch } = this.props;

        if (serverSideSearch) {
            var data = await serverSideSearch.searchFunc(parameters);

            var pagination = null;

            if (serverSideSearch.updatePaginationFromResult) {
                pagination = serverSideSearch.updatePaginationFromResult(data);
            }

            if (serverSideSearch.searchResultTransform) {
                data = serverSideSearch.searchResultTransform(data);
            }

            this.setState({
                serverData: data,
                serverPagination: pagination
            });
        }
        else {
            this.setState({
                searchParameters: parameters
            });
        }
    }

    getData() {
        return this.state.serverData || this.props.getData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        var prevPage = prevState.serverPagination && prevState.serverPagination.page;
        var currentPage = this.state.serverPagination && this.state.serverPagination.page;

        if (prevPage !== currentPage) {
            this.performSearch();
        }
    }

    render() {
        const { data, getData, ...other } = this.props;

        var searchFields = this.props.fields
            .filter(field => !field.visibility || field.visibility.search !== false);

        searchFields = orderBy(searchFields, x => x.order && x.order.search);

        var searchProps = {
            icon: 'search',
            fields: searchFields,
            performSearch: this.performSearch,
            ActionBarComponent: this.props.ActionBarComponent
        };

        return <Router>
            <React.Fragment>
                <div className="sidebar">
                    <Route match="/" exact render={routeProps => (
                        <this.props.SearchComponent {...searchProps} {...routeProps} />
                    )} />
                </div>
                <div className="main">
                    <h1>{this.props.heading}</h1>
                    <Grid {...other} serverPagination={this.state.serverPagination} getData={this.getData} searchParameters={this.state.searchParameters} />
                </div>
            </React.Fragment>
        </Router>
    }
}

OdissGrid.propTypes = GRID_PROP_TYPES;

OdissGrid.defaultProps = {
    SearchComponent: GridSearch
};

export default OdissGrid;