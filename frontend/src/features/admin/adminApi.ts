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

interface UpdateUserStatusRequest {
  id: string;
  enabled: boolean;
}

interface UpdateReservationStatusRequest {
  id: string;
  status: ReservationStatus;
}

interface DateRangeRequest {
  startDate: string;
  endDate: string;
}

export interface TokenBookingRequest {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhoneNumber?: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  paymentMethodId: string; // Stripe payment method token
}

export interface ManagerBookingRequest {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhoneNumber?: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  cardNumber: string;
  cardExpiryMonth: number;
  cardExpiryYear: number;
  cardCvc: string;
  cardholderName: string;
  billingAddressLine1: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
}

export interface ManagerBookingResponse {
  reservation: Reservation;
  payment: {
    id: string;
    amount: number;
    status: string;
    cardBrand: string;
    cardLast4: string;
  };
  customerId: string;
  message: string;
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
    getDashboardOverview: builder.query<DashboardOverview, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),

    // Users Management
    getAllUsers: builder.query<User[], void>({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUserStatus: builder.mutation<User, UpdateUserStatusRequest>({
      query: ({ id, enabled }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PUT',
        body: { enabled },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Rooms Management
    getAllRoomsAdmin: builder.query<Room[], void>({
      query: () => '/admin/rooms',
      providesTags: ['Room'],
    }),
    getRoomStatistics: builder.query<RoomStatistics, void>({
      query: () => '/admin/rooms/statistics',
      providesTags: ['Room'],
    }),

    // Reservations Management
    getAllReservationsAdmin: builder.query<Reservation[], void>({
      query: () => '/admin/reservations',
      providesTags: ['Reservation'],
    }),
    getReservationsByDateRange: builder.query<Reservation[], DateRangeRequest>({
      query: ({ startDate, endDate }) => ({
        url: '/admin/reservations/date-range',
        params: { startDate, endDate },
      }),
      providesTags: ['Reservation'],
    }),
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
    getReservationStatistics: builder.query<ReservationStatistics, void>({
      query: () => '/admin/reservations/statistics',
      providesTags: ['Reservation'],
    }),

    // Manager-Assisted Booking (Token-Based - SECURE)
    createAssistedBookingToken: builder.mutation<ManagerBookingResponse, TokenBookingRequest>({
      query: (bookingData) => ({
        url: '/admin/bookings/assisted-token',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Reservation', 'Room', 'Admin'],
    }),

    // Manager-Assisted Booking (Legacy - Raw Card Data)
    createAssistedBooking: builder.mutation<ManagerBookingResponse, ManagerBookingRequest>({
      query: (bookingData) => ({
        url: '/admin/bookings/assisted',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Reservation', 'Room', 'Admin'],
    }),
  }),
});

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
  useCreateAssistedBookingMutation,
} = adminApi;
