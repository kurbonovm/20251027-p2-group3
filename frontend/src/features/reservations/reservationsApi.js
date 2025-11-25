import { apiSlice } from '../../services/api';

export const reservationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReservations: builder.query({
      query: (params) => ({
        url: '/reservations',
        params,
      }),
      providesTags: ['Reservation'],
    }),
    getReservationById: builder.query({
      query: (id) => `/reservations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Reservation', id }],
    }),
    getUserReservations: builder.query({
      query: () => '/reservations/my-reservations',
      providesTags: ['Reservation'],
    }),
    createReservation: builder.mutation({
      query: (reservationData) => ({
        url: '/reservations',
        method: 'POST',
        body: reservationData,
      }),
      invalidatesTags: ['Reservation', 'Room'],
    }),
    updateReservation: builder.mutation({
      query: ({ id, ...reservationData }) => ({
        url: `/reservations/${id}`,
        method: 'PUT',
        body: reservationData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Reservation', id },
        'Room',
      ],
    }),
    cancelReservation: builder.mutation({
      query: (id) => ({
        url: `/reservations/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Reservation', id },
        'Room',
      ],
    }),
  }),
});

export const {
  useGetReservationsQuery,
  useGetReservationByIdQuery,
  useGetUserReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useCancelReservationMutation,
} = reservationsApi;
