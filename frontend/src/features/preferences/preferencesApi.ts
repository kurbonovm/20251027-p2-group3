import { apiSlice } from '../../services/api';
import type { UserPreferences, UpdatePreferencesRequest } from '../../types';

export const preferencesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyPreferences: builder.query<UserPreferences, void>({
      query: () => '/preferences',
      providesTags: ['Preferences'],
    }),
    getUserPreferences: builder.query<UserPreferences, string>({
      query: (userId) => `/preferences/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Preferences', id: userId }],
    }),
    updateMyPreferences: builder.mutation<UserPreferences, UpdatePreferencesRequest>({
      query: (preferences) => ({
        url: '/preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['Preferences'],
    }),
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
    resetMyPreferences: builder.mutation<UserPreferences, void>({
      query: () => ({
        url: '/preferences/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Preferences'],
    }),
    deleteMyPreferences: builder.mutation<void, void>({
      query: () => ({
        url: '/preferences',
        method: 'DELETE',
      }),
      invalidatesTags: ['Preferences'],
    }),
  }),
});

export const {
  useGetMyPreferencesQuery,
  useGetUserPreferencesQuery,
  useUpdateMyPreferencesMutation,
  useUpdateUserPreferencesMutation,
  useResetMyPreferencesMutation,
  useDeleteMyPreferencesMutation,
} = preferencesApi;
