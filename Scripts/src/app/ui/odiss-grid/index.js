import Main from './jsx/main';
import FIELD_TYPES from '../odiss-field-renderer/field-types';
import LOOKUP_TYPES from '../odiss-field-renderer/lookup-types';
import PIVOT_AGGREGATES from './pivot-aggregates';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortAmountUp, faSortAmountDown, faSort, faSearch, faExchangeAlt } from '@fortawesome/free-solid-svg-icons'

library.add(faSortAmountUp);
library.add(faSortAmountDown);
library.add(faSort);
library.add(faSearch);
library.add(faExchangeAlt);

export default Main;
export { FIELD_TYPES, LOOKUP_TYPES, PIVOT_AGGREGATES };