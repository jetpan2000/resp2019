import { observable, action, toJS } from 'mobx';
import * as documentSvc from '../services/api/documents';
import * as usersApi from '../services/api/users';


export default class BOLActionPickerStore {
    @observable document = null;

    @action async loadDocument(documentId) {
        document = await documentSvc.getById(documentId);
    }
}