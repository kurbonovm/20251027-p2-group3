/**
 * Application entry point.
 * Sets up Redux store provider, React strict mode, and renders the root App component.
 *
 * @module main
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './index.css';
import App from './App.jsx';

/**
 * Initialize and render the React application.
 * Wraps the app with Redux Provider and StrictMode for development checks.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
