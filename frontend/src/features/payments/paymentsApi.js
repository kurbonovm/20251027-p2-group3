import { apiSlice } from '../../services/api';

export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: (paymentData) => ({
        url: '/payments/create-intent',
        method: 'POST',
        body: paymentData,
      }),
    }),
    confirmPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/payments/confirm',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment', 'Reservation'],
    }),
    getPaymentHistory: builder.query({
      query: () => '/payments/history',
      providesTags: ['Payment'],
    }),
    getPaymentById: builder.query({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),
    processRefund: builder.mutation({
      query: ({ paymentId, amount }) => ({
        url: `/payments/${paymentId}/refund`,
        method: 'POST',
        body: { amount },
      }),
      invalidatesTags: ['Payment'],
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useGetPaymentHistoryQuery,
  useGetPaymentByIdQuery,
  useProcessRefundMutation,
} = paymentsApi;
