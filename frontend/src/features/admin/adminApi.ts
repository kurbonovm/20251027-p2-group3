/**
 * Admin API endpoints.
 * Provides administrative operations for managing users, rooms, reservations,
 * and accessing dashboard statistics. Also includes assisted booking features.
 *
 * @module features/admin/adminApi
 */

import { apiSlice } from '../../services/api';
import type {
  User,
  Room,
  Reservation,
  DashboardOverview,
  RoomStatistics,
  ReservationStatistics,
  ReservationStatus,
} from '../../types';

/**
 * Request payload for updating a user's enabled/disabled status.
 */
interface UpdateUserStatusRequest {
  /** User ID */
  id: string;
  /** Whether the user account is enabled */
  enabled: boolean;
}

/**
 * Request payload for updating a reservation's status.
 */
interface UpdateReservationStatusRequest {
  /** Reservation ID */
  id: string;
  /** New reservation status */
  status: ReservationStatus;
}

/**
 * Request payload for date range queries.
 */
interface DateRangeRequest {
  /** Start date in ISO 8601 format */
  startDate: string;
  /** End date in ISO 8601 format */
  endDate: string;
}

/**
 * Request payload for creating an assisted booking with Stripe payment token.
 * Used when manager collects payment information directly.
 */
export interface TokenBookingRequest {
  /** Customer's email address */
  customerEmail: string;
  /** Customer's first name */
  customerFirstName: string;
  /** Customer's last name */
  customerLastName: string;
  /** Customer's phone number (optional) */
  customerPhoneNumber?: string;
  /** Room ID to book */
  roomId: string;
  /** Check-in date in ISO 8601 format */
  checkInDate: string;
  /** Check-out date in ISO 8601 format */
  checkOutDate: string;
  /** Number of guests */
  numberOfGuests: number;
  /** Special requests or notes (optional) */
  specialRequests?: string;
  /** Stripe payment method ID/token */
  paymentMethodId: string;
}

/**
 * Response from token-based assisted booking containing reservation and payment details.
 */
export interface ManagerBookingResponse {
  /** Created reservation */
  reservation: Reservation;
  /** Payment details */
  payment: {
    /** Payment ID */
    id: string;
    /** Payment amount */
    amount: number;
    /** Payment status */
    status: string;
    /** Card brand (e.g., Visa, Mastercard) */
    cardBrand: string;
    /** Last 4 digits of card */
    cardLast4: string;
  };
  /** Stripe customer ID */
  customerId: string;
  /** Success message */
  message: string;
}

/**
 * Request payload for creating a reservation with payment link.
 * Customer receives link to complete payment themselves (PCI compliant).
 */
export interface PaymentLinkBookingRequest {
  /** Customer's email address */
  customerEmail: string;
  /** Customer's first name */
  customerFirstName: string;
  /** Customer's last name */
  customerLastName: string;
  /** Customer's phone number (optional) */
  customerPhoneNumber?: string;
  /** Room ID to book */
  roomId: string;
  /** Check-in date in ISO 8601 format */
  checkInDate: string;
  /** Check-out date in ISO 8601 format */
  checkOutDate: string;
  /** Number of guests */
  numberOfGuests: number;
  /** Special requests or notes (optional) */
  specialRequests?: string;
}

/**
 * Response from payment link booking containing reservation and payment URL.
 */
export interface PaymentLinkBookingResponse {
  /** Created reservation (PENDING status) */
  reservation: Reservation;
  /** Public payment link for customer */
  paymentLink: string;
  /** Success message */
  message: string;
}

/**
 * Admin API slice with injected endpoints.
 */
export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches dashboard overview statistics.
     * Includes total rooms, occupancy rate, active reservations, users, and revenue.
     *
     * @returns Dashboard statistics
     */
    getDashboardOverview: builder.query<DashboardOverview, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),

    /**
     * Fetches all users in the system.
     *
     * @returns Array of all users
     */
    getAllUsers: builder.query<User[], void>({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),

    /**
     * Fetches a specific user by ID.
     *
     * @param id - User ID
     * @returns User data
     */
    getUserById: builder.query<User, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    /**
     * Enables or disables a user account.
     *
     * @param request - User ID and enabled status
     * @returns Updated user data
     */
    updateUserStatus: builder.mutation<User, UpdateUserStatusRequest>({
      query: ({ id, enabled }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PUT',
        body: { enabled },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),

    /**
     * Deletes a user from the system.
     *
     * @param id - User ID to delete
     */
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Fetches all rooms with admin-level details.
     *
     * @returns Array of all rooms
     */
    getAllRoomsAdmin: builder.query<Room[], void>({
      query: () => '/admin/rooms',
      providesTags: ['Room'],
    }),

    /**
     * Fetches aggregated room statistics.
     * Includes occupancy rates and room breakdown by type.
     *
     * @returns Room statistics
     */
    getRoomStatistics: builder.query<RoomStatistics, void>({
      query: () => '/admin/rooms/statistics',
      providesTags: ['Room'],
    }),

    /**
     * Fetches all reservations in the system.
     *
     * @returns Array of all reservations
     */
    getAllReservationsAdmin: builder.query<Reservation[], void>({
      query: () => '/admin/reservations',
      providesTags: ['Reservation'],
    }),

    /**
     * Fetches reservations within a specific date range.
     *
     * @param request - Start and end date range
     * @returns Array of reservations in the date range
     */
    getReservationsByDateRange: builder.query<Reservation[], DateRangeRequest>({
      query: ({ startDate, endDate }) => ({
        url: '/admin/reservations/date-range',
        params: { startDate, endDate },
      }),
      providesTags: ['Reservation'],
    }),

    /**
     * Updates a reservation's status (e.g., PENDING to CONFIRMED).
     *
     * @param request - Reservation ID and new status
     * @returns Updated reservation
     */
    updateReservationStatus: builder.mutation<Reservation, UpdateReservationStatusRequest>({
      query: ({ id, status }) => ({
        url: `/admin/reservations/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Reservation', id },
        'Reservation',
        'Room',
      ],
    }),

    /**
     * Fetches aggregated reservation statistics.
     * Includes total reservations, breakdown by status, and total revenue.
     *
     * @returns Reservation statistics
     */
    getReservationStatistics: builder.query<ReservationStatistics, void>({
      query: () => '/admin/reservations/statistics',
      providesTags: ['Reservation'],
    }),

    /**
     * Creates an assisted booking with immediate payment using Stripe token.
     * Manager collects payment information and processes booking in one step.
     *
     * @param bookingData - Booking details and Stripe payment method ID
     * @returns Reservation and payment confirmation
     */
    createAssistedBookingToken: builder.mutation<ManagerBookingResponse, TokenBookingRequest>({
      query: (bookingData) => ({
        url: '/admin/bookings/assisted-token',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Reservation', 'Room', 'Admin'],
    }),

    /**
     * Creates a reservation and generates a payment link for the customer.
     * PCI-compliant approach where customer completes payment themselves.
     *
     * @param bookingData - Booking details without payment information
     * @returns Reservation and public payment link
     */
    createReservationWithPaymentLink: builder.mutation<PaymentLinkBookingResponse, PaymentLinkBookingRequest>({
      query: (bookingData) => ({
        url: '/admin/reservations/create-with-payment-link',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Reservation', 'Room', 'Admin'],
    }),
  }),
});

/**
 * Auto-generated React hooks for admin API endpoints.
 */
export const {
  useGetDashboardOverviewQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetAllRoomsAdminQuery,
  useGetRoomStatisticsQuery,
  useGetAllReservationsAdminQuery,
  useGetReservationsByDateRangeQuery,
  useUpdateReservationStatusMutation,
  useGetReservationStatisticsQuery,
  useCreateAssistedBookingTokenMutation,
  useCreateReservationWithPaymentLinkMutation,
} = adminApi;
