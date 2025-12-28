/**
 * Authentication Redux slice.
 * Manages user authentication state including login, logout, and credential persistence.
 *
 * @module features/auth/authSlice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, RootState } from '../../types';

/**
 * Safely retrieves and parses user data from localStorage.
 *
 * @returns Parsed user object or null if not found or invalid
 */
const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Initial authentication state, hydrated from localStorage if available.
 */
const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
};

/**
 * Payload for setting user credentials.
 */
interface SetCredentialsPayload {
  /** User data to store */
  user: User;
  /** JWT authentication token */
  token: string;
}

/**
 * Authentication slice managing user login state.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Sets user credentials after successful login.
     * Persists user data and token to localStorage.
     *
     * @param state - Current auth state
     * @param action - Action containing user and token
     */
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    /**
     * Clears user credentials on logout.
     * Removes all auth data from state and localStorage.
     *
     * @param state - Current auth state
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

/**
 * Exported action creators.
 */
export const { setCredentials, logout } = authSlice.actions;

/**
 * Auth reducer for Redux store.
 */
export default authSlice.reducer;

/**
 * Selector to get the current authenticated user.
 *
 * @param state - Root Redux state
 * @returns Current user or null
 */
export const selectCurrentUser = (state: RootState) => state.auth.user;

/**
 * Selector to check if user is authenticated.
 *
 * @param state - Root Redux state
 * @returns Whether user is authenticated
 */
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
