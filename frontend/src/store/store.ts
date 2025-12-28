/**
 * Redux store configuration.
 * Combines RTK Query API slice with auth reducer and sets up middleware.
 *
 * @module store/store
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from '../services/api';
import authReducer from '../features/auth/authSlice';

/**
 * Configured Redux store instance.
 * Includes:
 * - RTK Query API slice for data fetching
 * - Auth slice for authentication state
 * - RTK Query middleware for caching and request deduplication
 */
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

/**
 * Enable refetchOnFocus and refetchOnReconnect behaviors.
 * Automatically refetches data when the window regains focus or reconnects to network.
 */
setupListeners(store.dispatch);

/**
 * Type for the store's dispatch function.
 * Use this type when typing dispatch in components.
 */
export type AppDispatch = typeof store.dispatch;
