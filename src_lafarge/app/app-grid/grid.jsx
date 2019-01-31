import React from 'react';
import { orderBy } from 'lodash';
import OdissGrid, { FIELD_TYPES, LOOKUP_TYPES } from '../ui/odiss-grid';
import * as documentSvc from '../services/api/documents';

class AppGrid extends React.Component {

    constructor(props) {
        super(props);

        this.performSearch = this.performSearch.bind(this);
        this.searchResultTransform = this.searchResultTransform.bind(this);
        this.buildParameters = this.buildParameters.bind(this);
        this.updatePaginationFromResult = this.updatePaginationFromResult.bind(this);
        this.onPageChange = this.onPageChange.bind(this);

        this.fields = this.props.appData.Fields.map(field => {
            return {
                name: field.ID,
                text: field.Name,
                dataType: FIELD_TYPES.STRING,
                visibility: {
                    search: !field.NotVisibleFilter,
                    grid: !field.NotVisibleList
                },
                order: {
                    search: field.FilterOrder,
                    grid: field.ResultOrder
                }
            }
        });

        this.state = {
            currentPage: 1,
            pageSize: 50 // This is only a placeholder for now. Server settings override this for the time being
        };
    }

    getData() {
        return []; // TODO
    }

    performSearch(fields) {
        var appId = this.props.appData.ID;
        var parameters = this.buildParameters(fields);

        return documentSvc.search(appId, parameters, this.state.currentPage, this.state.pageSize);
    }

    searchResultTransform(result) {
        var fields = this.fields;
        fields = fields.filter(x => !x.visibility || x.visibility.grid);
        fields = orderBy(fields, x => x.order && x.order.grid);

        return result.data.map(item => {
            var obj = {};

            fields.forEach((field, index) => {
                obj[field.name] = item[index + 1];
            });

            return obj;
        });
    }

    updatePaginationFromResult(result) {
        return {
            total: result.recordsTotal,
            filtered: result.recordsFiltered,
            pages: result.recordsTotal / this.state.pageSize + 1,
            page: this.state.currentPage
        }
    }

    onPageChange(pageNumber) {
        this.setState({
            page: pageNumber
        });
    }

    buildParameters(fields) {
        var parameters = {};

        for (var property in fields) {
            parameters[property] = {
                value: fields[property]
            };
        }

        return parameters;
    }

    render() {
        const { appData } = this.props;

        return <OdissGrid
            heading={appData.Name}
            rowsPerPage={__serverState.rowsPerPage}
            getData={this.getData}
            data={[]}
            fields={this.fields}
            serverSideSearch={{
                searchFunc: this.performSearch,
                searchResultTransform: this.searchResultTransform,
                updatePaginationFromResult: this.updatePaginationFromResult,
                buildParameters: this.buildParameters,
                onPageChange: this.onPageChange
            }}
        />
    }
}

export default AppGrid;