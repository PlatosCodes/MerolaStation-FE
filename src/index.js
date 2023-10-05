import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';


// Using the new createRoot API instead of ReactDOM.render
const root = document.getElementById('root');
const reactRoot = createRoot(root);

reactRoot.render(
    <Provider store={store}>
        <App />
    </Provider>
);
