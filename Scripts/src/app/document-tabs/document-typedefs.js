/**
 * Document Invoice
 * @typedef DocumentInvoice
 * @property {Date} captureDate
 * @property {Guid} guid
 * @property {String} fileName
 * @property {Boolean} isConfidential
 * @property {Number} gsthst
 * @property {Number} pstqst
 * @property {Array<DocumentInvoiceLineItem>} lineItems
 */

/**
 * Document Invoice Line Item
 * @typedef DocumentInvoiceLineItem
 * @property {Number} quantity
 * @property {Number} unitPrice
 * @property {Number} totalAmount
 */

/**
 * Currency
 * @typedef Currency
 * @property {string} code - Two digit currency code (CA for Canada, US for USA, etc.)
 * @property {string} description
 * @property {string} name - Name of the currency
 * @property {Number} order - Number to indicate the order to display the currency (for ordered lists)
 * @property {string} symbol - Currency Symbol ('$' for dollars)
 */

/**
 * @typedef Plant
 * @property {string} companyCode
 * @property {string} postalCode
 */

/**
 * @typedef Vendor
 * @property {string} vendorNumber
 */

/**
 * @typedef BuildInvoiceHeaderFieldOverrideParameters
 * @property {() => Plant} getPlant
 * @property {() => Vendor} getVendor
 * @property {() => Currency} getCurrency
 * @property {() => boolean} getCanUserViewConfidentialDocuments
 * @property {DebitCreditProps} debitCreditProps
 * @property {string} applicationIdentifier
 */

/**
 * @typedef BuildLineItemFieldOverrideParameters
 * @property {() => Array} getGlCodeOptions
 * @property {() => Array} getPartNumberOptions
 * @property {() => Currency} getCurrency
 */

/**
 * @typedef BuildInvoiceHeaderValidationsParameters
 * @property {() => DocumentInvoice} getDocument
 */

 /**
 * @typedef BuildLineItemValidationsParameters
 * @property {() => Array} getGlCodeOptions
 */

/**
 * @typedef DebitCreditProps
 * @property {() => boolean} getIsCredit
 * @property {(value: boolean) => void} setIsCredit
 * @property {(value: string) => void} setDebitCreditString
 */