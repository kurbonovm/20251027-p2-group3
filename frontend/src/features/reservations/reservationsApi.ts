/**
 * Reservations API endpoints.
 * Handles creating, updating, cancelling, and fetching hotel reservations.
 *
 * @module features/reservations/reservationsApi
 */

import { apiSlice } from '../../services/api';
import type {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
  CancellationRequest,
  CancellationResponse,
  RefundCalculation,
} from '../../types';

/**
 * Reservations API slice with injected endpoints.
 */
export const reservationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches all reservations with optional filtering (admin only).
     *
     * @param params - Optional query parameters for filtering
     * @returns Array of reservations
     */
    getReservations: builder.query<Reservation[], Record<string, any> | void>({
      query: (params) => ({
        url: '/reservations',
        params,
      }),
      providesTags: ['Reservation'],
    }),

    /**
     * Fetches a single reservation by ID.
     *
     * @param id - Reservation ID
     * @returns Reservation data
     */
    getReservationById: builder.query<Reservation, string>({
      query: (id) => `/reservations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Reservation', id }],
    }),

    /**
     * Fetches all reservations for the current authenticated user.
     * Cache is disabled to ensure fresh data on each fetch.
     *
     * @returns Array of user's reservations
     */
    getUserReservations: builder.query<Reservation[], void>({
      query: () => '/reservations/my-reservations',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Reservation' as const, id })),
              { type: 'Reservation' as const, id: 'LIST' },
            ]
          : [{ type: 'Reservation' as const, id: 'LIST' }],
      keepUnusedDataFor: 0,
    }),

    /**
     * Creates a new reservation.
     *
     * @param reservationData - Reservation details including room, dates, and guest count
     * @returns Created reservation
     */
    createReservation: builder.mutation<Reservation, CreateReservationRequest>({
      query: (reservationData) => ({
        url: '/reservations',
        method: 'POST',
        body: reservationData,
      }),
      invalidatesTags: [{ type: 'Reservation', id: 'LIST' }, 'Room'],
    }),

    /**
     * Updates an existing reservation (admin only).
     *
     * @param updateData - Reservation ID and fields to update
     * @returns Updated reservation
     */
    updateReservation: builder.mutation<Reservation, UpdateReservationRequest>({
      query: ({ id, ...reservationData }) => ({
        url: `/reservations/${id}`,
        method: 'PUT',
        body: reservationData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Reservation', id },
        { type: 'Reservation', id: 'LIST' },
        'Room',
      ],
    }),

    /**
     * Cancels a reservation without processing refund (quick cancel for unpaid PENDING reservations).
     *
     * @param id - Reservation ID to cancel
     * @returns Cancelled reservation
     */
    cancelReservation: builder.mutation<Reservation, string>({
      query: (id) => ({
        url: `/reservations/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Reservation', id },
        { type: 'Reservation', id: 'LIST' },
        'Room',
      ],
    }),

    /**
     * Previews the refund calculation for a reservation cancellation.
     * Shows how much will be refunded based on cancellation policy and timing.
     *
     * @param id - Reservation ID
     * @returns Refund calculation details
     */
    getCancellationPreview: builder.query<RefundCalculation, string>({
      query: (id) => `/reservations/${id}/cancellation-preview`,
    }),

    /**
     * Cancels a reservation and processes refund according to cancellation policy.
     *
     * @param params - Reservation ID and cancellation request details
     * @returns Cancellation response with refund details
     */
    cancelWithRefund: builder.mutation<CancellationResponse, { id: string; request: CancellationRequest }>({
      query: ({ id, request }) => ({
        url: `/reservations/${id}/cancel-with-refund`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Reservation', id },
        { type: 'Reservation', id: 'LIST' },
        'Room',
      ],
    }),
  }),
});

/**
 * Auto-generated React hooks for reservations API endpoints.
 */
export const {
  useGetReservationsQuery,
  useGetReservationByIdQuery,
  useGetUserReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationMutation,
  useCancelReservationMutation,
  useGetCancellationPreviewQuery,
  useCancelWithRefundMutation,
} = reservationsApi;
