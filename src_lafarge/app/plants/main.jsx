import * as React from 'react';
import { Provider, observer } from 'mobx-react';

import Store from './store';
import Grid from './grid';
import Grid2 from './grid2';
import OdissGrid from '../ui/odiss-grid';

const store = new Store();
store.init();

@observer
export default class Main extends React.Component {

    render() {
        return <Provider store={store}>
            <Grid2 />
            { /* <OdissGrid /> */}
        </Provider>
    }

}