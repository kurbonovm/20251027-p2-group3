/**
 * Core API configuration using Redux Toolkit Query.
 * Provides centralized API setup with automatic caching, request deduplication,
 * and optimistic updates.
 *
 * @module services/api
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../types';

/**
 * Vite environment variables interface.
 */
interface ImportMetaEnv {
  /** Backend API base URL */
  VITE_API_URL?: string;
}

/**
 * Vite import.meta interface.
 */
interface ImportMeta {
  /** Environment variables */
  env: ImportMetaEnv;
}

/**
 * Application build version for cache busting.
 */
const BUILD_VERSION = '1.0.1';

/**
 * Base query configuration with JWT authentication.
 * Automatically attaches Bearer token from Redux auth state to all requests.
 */
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('x-app-version', BUILD_VERSION);
    return headers;
  },
});

/**
 * Main API slice for the application.
 * All feature-specific API endpoints inject their endpoints into this base slice.
 *
 * Tag Types:
 * - Room: Room-related data caching
 * - Reservation: Reservation-related data caching
 * - User: User-related data caching
 * - Payment: Payment/transaction data caching
 * - Admin: Admin statistics and data caching
 * - Preferences: User preferences data caching
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Room', 'Reservation', 'User', 'Payment', 'Admin', 'Preferences'],
  endpoints: () => ({}),
});
