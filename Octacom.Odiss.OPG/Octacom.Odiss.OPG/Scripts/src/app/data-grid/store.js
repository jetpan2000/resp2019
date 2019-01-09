import { observable, computed, action, toJS, configure } from 'mobx';

import { extend, find, camelCase } from 'lodash';

import ALERT from './alert';
import EDIT_MODE from './edit-mode';
import { mapDynamicItemWithFields, mapFieldsWithDynamicItem, getFieldType, getLookupType, mapFieldForOdissGrid } from './helper';

import * as appGridSvc from '../services/api/app-grid';
import { LOOKUP_TYPES } from '../ui/odiss-grid';

// configure({
//     enforceActions: 'always'
// });

export default class DataGridStore {
    @observable isEditShowing = false;
    @observable editMode = EDIT_MODE.CREATE;
    @observable editItem = null;
    @observable data = [];
    @observable activeAlert = ALERT.NONE;
    @observable manualRefresh = {};
    @observable isLoading = false;
    @observable showDeleteConfirmDialog = false;
    @observable lookupOptions = observable.map();

    appData = window.__appData;
    serverState = window.__serverState;

    @action
    async loadData() {
        var fieldsNeedingLookup = this.appData.Fields.filter(field => field.Type === 5);

        await Promise.all(fieldsNeedingLookup.map(async (field) => {
            try {
                var lookupCollection = await appGridSvc.getLookupOptions(field);
                this.lookupOptions.set(field.ID, lookupCollection);
            }
            catch (e) {
                this.lookupOptions.set(field.ID, []);
            }
        }));

        var gridData = await appGridSvc.getAll(this.appData.ID);
        this.data.replace(gridData);
    }

    @computed
    get fields() {
        return this.appData.Fields.map(field => mapFieldForOdissGrid(field, toJS(this.lookupOptions.get(field.ID))));
    }

    @action setAlert(alert) {
        this.activeAlert = alert;
    }

    @action
    showCreate() {
        this.editMode = EDIT_MODE.CREATE;
        this.isEditShowing = true;
        this.editItem = mapDynamicItemWithFields({}, this.fields);
    }

    @action
    showEdit(index) {
        this.editMode = EDIT_MODE.UPDATE;
        this.isEditShowing = true;

        var item = this.data[index];
        this.editItem = mapDynamicItemWithFields(item, this.fields);
    }

    @action
    hideEdit() {
        this.isEditShowing = false;
        this.reset();
    }

    @action
    async saveEdit() {
        var saveAction = this.editMode === EDIT_MODE.UPDATE
            ? appGridSvc.update
            : appGridSvc.create;

        var key = find(this.fields, x => x.mapTo === 'Id') || find(this.fields, x => x.entryDetails);

        try {
            this.isLoading = true;
            var item = toJS(this.editItem);
            var result = await saveAction(item, this.appData.ID);
            this.setAlert(ALERT.SUCCESS);

            var camelCaseKey = camelCase(key.mapTo);
            var existingGridItem = find(this.data, x => x[camelCaseKey] === item[key.name]);
            var mapped = mapFieldsWithDynamicItem(item, this.fields);

            if (existingGridItem) {
                // Merge existing item with the saved item
                extend(existingGridItem, mapped);
            }
            else {
                mapped[camelCaseKey] = result.data[camelCaseKey];
                this.data.push(mapped);
            }

            this.manualRefresh = {};
        }
        catch (e) {
            this.setAlert(ALERT.ERROR);
        }
        finally {
            this.isLoading = false;
        }
    }

    @action
    async delete() {
        var key = find(this.fields, x => x.mapTo === 'Id') || find(this.fields, x => x.entryDetails);

        try {
            this.isLoading = true;
            var item = toJS(this.editItem);
            var existingGridItem = find(this.data, x => x[camelCase(key.mapTo)] === item[key.name]);
            await appGridSvc.remove(item[key.name], this.appData.ID);

            this.setAlert(ALERT.SUCCESS);
            this.isEditShowing = false;
            this.showDeleteConfirmDialog = false;

            this.data.remove(existingGridItem);
        }
        catch (e) {
            this.setAlert(ALERT.ERROR);
        }
        finally {
            this.isLoading = false;
        }
    }

    @action
    reset() {
        this.isEditShowing = false;
        this.setAlert(ALERT.NONE);
        this.editItem = null;
    }
}