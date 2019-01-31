import React from 'react';
import ReactDOM from 'react-dom';
import AppGrid from './app-grid';

ReactDOM.render(<AppGrid appData={window.__appData} serverState={window.__serverState} />, document.getElementById('react-root'));