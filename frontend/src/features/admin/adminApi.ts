import { apiSlice } from '../../services/api';
import type {
  User,
  Room,
  Reservation,
  DashboardOverview,
  RoomStatistics,
  ReservationStatistics,
  ReservationStatus,
  CreateUserRequest,
  TodaysPulseEvent,
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

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
    getDashboardOverview: builder.query<DashboardOverview, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),

    // Users Management
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (userData) => ({
        url: '/admin/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
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
    createRoom: builder.mutation<Room, Partial<Room>>({
      query: (room) => ({
        url: '/rooms',
        method: 'POST',
        body: room,
      }),
      invalidatesTags: ['Room', 'Admin'],
    }),
    updateRoom: builder.mutation<Room, { id: string; room: Partial<Room> }>({
      query: ({ id, room }) => ({
        url: `/rooms/${id}`,
        method: 'PUT',
        body: room,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Room', id },
        'Room',
        'Admin',
      ],
      // Optimistic update for immediate UI feedback
      onQueryStarted: async ({ id, room: updateData }, { dispatch, queryFulfilled }) => {
        // Optimistically update the cache
        const patchResult = dispatch(
          adminApi.util.updateQueryData('getAllRoomsAdmin', undefined, (draft) => {
            const roomIndex = draft.findIndex((r) => r.id === id);
            if (roomIndex !== -1) {
              draft[roomIndex] = { ...draft[roomIndex], ...updateData };
            }
          })
        );

        // Also update room statistics cache
        dispatch(
          adminApi.util.updateQueryData('getRoomStatistics', undefined, (draft) => {
            // Statistics will be recalculated when invalidated
          })
        );

        try {
          // Wait for the server response
          const { data: updatedRoom } = await queryFulfilled;
          
          // Update with the actual server response
          dispatch(
            adminApi.util.updateQueryData('getAllRoomsAdmin', undefined, (draft) => {
              const roomIndex = draft.findIndex((r) => r.id === id);
              if (roomIndex !== -1) {
                draft[roomIndex] = updatedRoom;
              }
            })
          );
        } catch {
          // If the update fails, revert the optimistic update
          patchResult.undo();
        }
      },
    }),
    deleteRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room', 'Admin'],
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
    getTodaysPulse: builder.query<TodaysPulseEvent[], void>({
      query: () => '/admin/reservations/todays-pulse',
      providesTags: ['Reservation'],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetDashboardOverviewQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetAllRoomsAdminQuery,
  useGetRoomStatisticsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetAllReservationsAdminQuery,
  useGetReservationsByDateRangeQuery,
  useUpdateReservationStatusMutation,
  useGetReservationStatisticsQuery,
  useGetTodaysPulseQuery,
} = adminApi;
