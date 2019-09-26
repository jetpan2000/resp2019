import { toJS } from 'mobx';
import InvoiceStore from './store';
import { buildInvoiceHeaderFieldOverrides, buildLineItemFieldOverrides, buildInvoiceHeaderValidations, buildLineItemValidations } from '../field-overrides'

export default class FieldOverrideBuilder {
    /** @param {InvoiceStore} store */
    constructor (store) {
        this.store = store;
    }

    buildInvoiceHeaderFieldOverrides() {
        const { store } = this;
        const { applicationIdentifier } = store;

        return [...buildInvoiceHeaderFieldOverrides({
            applicationIdentifier,
            getPlant: () => store.plant,
            getVendor: () => store.vendor,
            getCanUserViewConfidentialDocuments: () => store.userCanViewConfidentialDocument,
            getCurrency: () => store.currency,
            debitCreditProps: {
                getIsCredit: () => store.document && store.document.isCredit,
                setIsCredit: (value) => { store.document.isCredit = value; },
                setDebitCreditString: (value) => { store.document.debitCredit = value; }
            }
        }), {
            name: '947c8c8d-7010-e911-842c-005056822bd7|947c8c8d-7010-e911-842c-005056820bd7|947c8c8d-7010-e911-842c-005056820bd6|9ae6cd34-5b13-e911-842c-005056820bd7|1207f4d9-e7f3-e811-822e-d89ef34a207d|da9923ec-b5db-4c22-80de-2d049e54145f|1207f4d9-e7f3-e811-822e-d89ef34a256d|1207f4d9-e7f3-e811-822e-d89ef34a254d',
            onSelectCallback: (selectedVendor) => {
                store.vendor = selectedVendor;
            }
        }];
    }
    
    buildInvoiceHeaderValidations() {
        const { store } = this;

        return buildInvoiceHeaderValidations({
            getDocument: () => store.document
        });
    }
    
    buildLineItemValidations() {
        const { store } = this;

        return buildLineItemValidations({ 
            getGlCodeOptions: () => toJS(store.allowedGlCodes)
        });
    }
    
    buildLineItemFieldOverrides() {
        const { store } = this;

        return buildLineItemFieldOverrides({
            getGlCodeOptions: () => toJS(store.glCodeOptions),
            getPartNumberOptions: () => toJS(store.partNumberOptions),
            getCurrency: () => store.currency
        });
    }
}