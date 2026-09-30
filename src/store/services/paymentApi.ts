import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './apiBase.ts';
import { PaymentOrderResponse, VerifyPaymentPayload } from '../../types/index.ts';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery,
  tagTypes: ['Book', 'Purchase'],
  endpoints: (builder) => ({
    createOrder: builder.mutation<
      { success: boolean; data: PaymentOrderResponse },
      { bookId: string }
    >({
      query: (body) => ({
        url: '/payments/create-order',
        method: 'POST',
        body,
      }),
    }),
    verifyPayment: builder.mutation<
      { success: boolean; message: string; orderId: string; bookId: string },
      VerifyPaymentPayload
    >({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Book', 'Purchase'],
    }),
    getSandboxData: builder.mutation<
      {
        success: boolean;
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      },
      {
        gatewayOrderId: string;
        simulateTamper?: boolean;
        simulateFailure?: boolean;
      }
    >({
      query: (body) => ({
        url: '/payments/sandbox-data',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetSandboxDataMutation,
} = paymentApi;
