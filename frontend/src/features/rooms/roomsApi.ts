/**
 * Rooms API endpoints.
 * Handles fetching, creating, updating, and deleting hotel rooms.
 *
 * @module features/rooms/roomsApi
 */

import { apiSlice } from '../../services/api';
import type {
  Room,
  RoomQueryParams,
  AvailableRoomsQuery,
  CreateRoomRequest,
  UpdateRoomRequest,
  RoomAvailabilityDTO,
} from '../../types';

/**
 * Rooms API slice with injected endpoints.
 */
export const roomsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches all rooms with optional filtering.
     *
     * @param params - Optional query parameters for filtering rooms
     * @returns Array of rooms matching the filters
     */
    getRooms: builder.query<Room[], RoomQueryParams | void>({
      query: (params) => ({
        url: '/rooms',
        params,
      }),
      providesTags: ['Room'],
    }),

    /**
     * Fetches a single room by ID.
     *
     * @param id - Room ID
     * @returns Room data
     */
    getRoomById: builder.query<Room, string>({
      query: (id) => `/rooms/${id}`,
      providesTags: (result, error, id) => [{ type: 'Room', id }],
    }),

    /**
     * Fetches rooms available for booking in a given date range.
     *
     * @param query - Date range and guest count parameters
     * @returns Array of available rooms
     */
    getAvailableRooms: builder.query<Room[], AvailableRoomsQuery>({
      query: ({ startDate, endDate, guests }) => ({
        url: '/rooms/available',
        params: { checkInDate: startDate, checkOutDate: endDate, guests },
      }),
      providesTags: ['Room'],
    }),

    /**
     * Fetches all rooms with availability status.
     * Shows ALL rooms with their availability status for the requested dates.
     * If no dates provided, shows rooms with general occupancy status.
     *
     * @param query - Optional date range and guest count parameters
     * @returns Array of rooms with availability information
     */
    getRoomsWithAvailability: builder.query<
      RoomAvailabilityDTO[],
      { checkInDate?: string; checkOutDate?: string; guests?: number } | void
    >({
      query: (params) => ({
        url: '/rooms/with-availability',
        params,
      }),
      providesTags: ['Room'],
    }),

    /**
     * Creates a new room (admin only).
     *
     * @param roomData - New room data
     * @returns Created room
     */
    createRoom: builder.mutation<Room, CreateRoomRequest>({
      query: (roomData) => ({
        url: '/rooms',
        method: 'POST',
        body: roomData,
      }),
      invalidatesTags: ['Room'],
    }),

    /**
     * Updates an existing room (admin only).
     *
     * @param updateData - Room ID and fields to update
     * @returns Updated room data
     */
    updateRoom: builder.mutation<Room, UpdateRoomRequest>({
      query: ({ id, ...roomData }) => ({
        url: `/rooms/${id}`,
        method: 'PUT',
        body: roomData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Room', id }],
    }),

    /**
     * Deletes a room (admin only).
     *
     * @param id - Room ID to delete
     */
    deleteRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),
  }),
});

/**
 * Auto-generated React hooks for rooms API endpoints.
 */
export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useGetAvailableRoomsQuery,
  useGetRoomsWithAvailabilityQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomsApi;
