/**
 * Authentication API endpoints.
 * Handles user login, registration, OAuth2 authentication, and profile management.
 *
 * @module features/auth/authApi
 */

import { apiSlice } from '../../services/api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UpdateProfileRequest,
} from '../../types';

/**
 * Authentication API slice with injected endpoints.
 */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Authenticates a user with email and password.
     *
     * @param credentials - User email and password
     * @returns JWT token and user data
     */
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    /**
     * Registers a new user account.
     *
     * @param userData - New user registration data
     * @returns JWT token and user data
     */
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    /**
     * Initiates OAuth2 authentication flow.
     *
     * @param provider - OAuth2 provider name (e.g., 'google', 'okta')
     * @returns Authorization URL for redirect
     */
    oauth2Login: builder.mutation<string, string>({
      query: (provider) => ({
        url: `/auth/oauth2/${provider}`,
        method: 'GET',
      }),
    }),

    /**
     * Fetches the currently authenticated user's data.
     *
     * @returns Current user information
     */
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    /**
     * Updates the authenticated user's profile information.
     *
     * @param userData - Fields to update in the user profile
     * @returns Updated user data
     */
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (userData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

/**
 * Auto-generated React hooks for authentication API endpoints.
 */
export const {
  useLoginMutation,
  useRegisterMutation,
  useOauth2LoginMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} = authApi;
