/**
 * Payments API endpoints.
 * Handles Stripe payment intents, payment confirmations, refunds, and transaction history.
 *
 * @module features/payments/paymentsApi
 */

import { apiSlice } from '../../services/api';
import type {
  Transaction,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  PaymentIntentResponse,
  RefundRequest,
} from '../../types';

/**
 * Payments API slice with injected endpoints.
 */
export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Creates a Stripe payment intent for authenticated users.
     * Returns client secret for completing payment on frontend.
     *
     * @param paymentData - Reservation ID and payment amount
     * @returns Payment intent response with client secret
     */
    createPaymentIntent: builder.mutation<PaymentIntentResponse, CreatePaymentIntentRequest>({
      query: (paymentData) => ({
        url: '/payments/create-intent',
        method: 'POST',
        body: paymentData,
      }),
    }),

    /**
     * Creates a Stripe payment intent for public payment links (assisted bookings).
     * Allows payment without authentication via unique token.
     *
     * @param paymentData - Reservation ID and payment amount
     * @returns Payment intent response with client secret
     */
    createPaymentIntentPublic: builder.mutation<PaymentIntentResponse, CreatePaymentIntentRequest>({
      query: (paymentData) => ({
        url: '/payments/create-intent-public',
        method: 'POST',
        body: paymentData,
      }),
    }),

    /**
     * Confirms a payment after successful Stripe payment completion.
     * Updates reservation status and creates transaction record.
     *
     * @param paymentData - Payment intent ID and reservation ID
     * @returns Created transaction record
     */
    confirmPayment: builder.mutation<Transaction, ConfirmPaymentRequest>({
      query: (paymentData) => ({
        url: '/payments/confirm',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment', { type: 'Reservation', id: 'LIST' }],
    }),

    /**
     * Fetches payment history for the current authenticated user.
     *
     * @returns Array of user's transactions
     */
    getPaymentHistory: builder.query<Transaction[], void>({
      query: () => '/payments/history',
      providesTags: ['Payment'],
    }),

    /**
     * Fetches all payments in the system (admin only).
     *
     * @returns Array of all transactions
     */
    getAllPayments: builder.query<Transaction[], void>({
      query: () => '/payments/all',
      providesTags: ['Payment'],
    }),

    /**
     * Fetches a single payment transaction by ID.
     *
     * @param id - Transaction ID
     * @returns Transaction data
     */
    getPaymentById: builder.query<Transaction, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),

    /**
     * Processes a refund for a payment (admin only).
     * Can refund full or partial amount.
     *
     * @param refundData - Payment ID and optional refund amount
     * @returns Updated transaction with refund status
     */
    processRefund: builder.mutation<Transaction, RefundRequest>({
      query: ({ paymentId, amount }) => ({
        url: `/payments/${paymentId}/refund`,
        method: 'POST',
        body: { amount },
      }),
      invalidatesTags: ['Payment'],
    }),
  }),
});

/**
 * Auto-generated React hooks for payments API endpoints.
 */
export const {
  useCreatePaymentIntentMutation,
  useCreatePaymentIntentPublicMutation,
  useConfirmPaymentMutation,
  useGetPaymentHistoryQuery,
  useGetAllPaymentsQuery,
  useGetPaymentByIdQuery,
  useProcessRefundMutation,
} = paymentsApi;
