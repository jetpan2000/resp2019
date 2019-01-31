import { observable, computed, action, toJS } from 'mobx';

import * as plantsApi from './../services/api/plants';
import * as businessLinesApi from './../services/api/business-lines';
import * as regionsApi from './../services/api/regions';
import * as usersApi from './../services/api/users';

const { __serverState } = window;

export default class PlantsStore {
    @observable plants = [];
    @observable businessLines = [];
    @observable regions = [];

    @observable gridExpanded = {};
    @observable editItem = null;
    @observable manualRefresh = {};
    @observable freezeSort = false;
    @observable page = 0;
    @observable sorted = [];
    @observable customColor = 'red';
    @observable modal = null;
    @observable showUpdatedAlert = false;
    @observable showErrorAlert = false;
    @observable customErrorMessage = '';
    @observable canManage = __serverState.canEdit;
    @observable isLoading = false;

    @computed get showModal() {
        return !!this.modal || this.modal === 0;
    }

    @action async loadPlants() {
        var data = await plantsApi.getAll();
        this.plants.replace(data);
    }

    @action async loadBusinessLines() {
        var data = await businessLinesApi.getAll();
        this.businessLines.replace(data);
    }

    @action async loadRegions() {
        var data = await regionsApi.getAll();
        this.regions.replace(data);
    }

    @action async loadPermissions() {
        this.canManage = await usersApi.hasPermission('ManagePlants');
    }

    @action async init() {
        this.loadBusinessLines();
        this.loadRegions();
        this.loadPlants();
        this.loadPermissions();
    }

    @action addNew() {
        this.resetGridExpanded();
        this.page = null;

        this.plants.splice(0, 0, {
            isNew: true
        });

        var newExpandedObject = {};
        newExpandedObject[0] = {};

        this.gridExpanded = newExpandedObject;
        this.freezeSort = true;
    }

    @action editMode(index) {
        var newExpanded = {};
        newExpanded[index] = {};

        this.gridExpanded = newExpanded;
        this.freezeSort = true;
    }

    @action saveEdit() {
        const store = this;

        this.isLoading = true;

        var item = toJS(this.editItem);
        var saveAction = item.isNew ? plantsApi.create : plantsApi.update;

        saveAction(item).then(function (response) {
            item.isNew = false;
            item.id = response.data.id;
            store.editItem.isNew = false;
            store.editItem.id = response.data.id;

            store.resetGridExpanded();
            var existingGridItem = _.find(store.plants, x => x.id === item.id);

            if (existingGridItem) {
                // Merge existing item with the saved item
                _.extend(existingGridItem, item);
            }
            else {
                store.plants.push(item);
            }

            store.manualRefresh = {};
            store.showUpdatedAlert = true;

            setTimeout(() => store.showUpdatedAlert = false, 3000);
        }, function (error) {
            if (error.response.data.exceptionMessage && error.response.data.exceptionMessage.indexOf('UQ_Plant_Number') > -1) {
                store.showErrorAlert = true;
                store.customErrorMessage = `Plant with number ${store.editItem.number} already exists.`;
                setTimeout(() => { store.showErrorAlert = false; store.customErrorMessage = ''; }, 3000);
            }
            else {
                store.showErrorAlert = true;
                setTimeout(() => store.showErrorAlert = false, 3000);
            }
            }).finally(() => {
                store.isLoading = false;
            });
    }

    @action resetGridExpanded() {
        this.gridExpanded = {};
        _.remove(this.plants, x => x.isNew);
        this.freezeSort = false;
    }

    @action openModal(index) {
        this.modal = index;
        this.originalItem = this.plants[index];

        this.editItem = _.clone(this.originalItem);
    }

    @action openModalNew() {
        this.modal = -1;
        this.editItem = { isNew: true };
    }

    @action hideModal() {
        this.modal = null;
        this.editItem = null;
    }
}