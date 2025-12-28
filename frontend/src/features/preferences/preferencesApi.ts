/**
 * User Preferences API endpoints.
 * Handles fetching, updating, resetting, and deleting user preferences for personalized experience.
 *
 * @module features/preferences/preferencesApi
 */

import { apiSlice } from '../../services/api';
import type { UserPreferences, UpdatePreferencesRequest } from '../../types';

/**
 * Preferences API slice with injected endpoints.
 */
export const preferencesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches preferences for the current authenticated user.
     *
     * @returns User's preferences
     */
    getMyPreferences: builder.query<UserPreferences, void>({
      query: () => '/preferences',
      providesTags: ['Preferences'],
    }),

    /**
     * Fetches preferences for a specific user (admin only).
     *
     * @param userId - User ID
     * @returns User's preferences
     */
    getUserPreferences: builder.query<UserPreferences, string>({
      query: (userId) => `/preferences/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Preferences', id: userId }],
    }),

    /**
     * Updates preferences for the current authenticated user.
     * Only provided fields will be updated.
     *
     * @param preferences - Partial preferences to update
     * @returns Updated preferences
     */
    updateMyPreferences: builder.mutation<UserPreferences, UpdatePreferencesRequest>({
      query: (preferences) => ({
        url: '/preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['Preferences'],
    }),

    /**
     * Updates preferences for a specific user (admin only).
     * Only provided fields will be updated.
     *
     * @param params - User ID and partial preferences to update
     * @returns Updated preferences
     */
    updateUserPreferences: builder.mutation<
      UserPreferences,
      { userId: string; preferences: UpdatePreferencesRequest }
    >({
      query: ({ userId, preferences }) => ({
        url: `/preferences/${userId}`,
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Preferences', id: userId }],
    }),

    /**
     * Resets preferences to default values for the current authenticated user.
     *
     * @returns Reset preferences with default values
     */
    resetMyPreferences: builder.mutation<UserPreferences, void>({
      query: () => ({
        url: '/preferences/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Preferences'],
    }),

    /**
     * Deletes all preferences for the current authenticated user.
     * User will revert to system defaults.
     */
    deleteMyPreferences: builder.mutation<void, void>({
      query: () => ({
        url: '/preferences',
        method: 'DELETE',
      }),
      invalidatesTags: ['Preferences'],
    }),
  }),
});

/**
 * Auto-generated React hooks for preferences API endpoints.
 */
export const {
  useGetMyPreferencesQuery,
  useGetUserPreferencesQuery,
  useUpdateMyPreferencesMutation,
  useUpdateUserPreferencesMutation,
  useResetMyPreferencesMutation,
  useDeleteMyPreferencesMutation,
} = preferencesApi;
