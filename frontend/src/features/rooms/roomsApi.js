import { apiSlice } from '../../services/api';

export const roomsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: (params) => ({
        url: '/rooms',
        params,
      }),
      providesTags: ['Room'],
    }),
    getRoomById: builder.query({
      query: (id) => `/rooms/${id}`,
      providesTags: (result, error, id) => [{ type: 'Room', id }],
    }),
    getAvailableRooms: builder.query({
      query: ({ startDate, endDate, guests }) => ({
        url: '/rooms/available',
        params: { startDate, endDate, guests },
      }),
      providesTags: ['Room'],
    }),
    createRoom: builder.mutation({
      query: (roomData) => ({
        url: '/rooms',
        method: 'POST',
        body: roomData,
      }),
      invalidatesTags: ['Room'],
    }),
    updateRoom: builder.mutation({
      query: ({ id, ...roomData }) => ({
        url: `/rooms/${id}`,
        method: 'PUT',
        body: roomData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Room', id }],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useGetAvailableRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomsApi;
