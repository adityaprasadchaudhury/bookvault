import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './apiBase.ts';
import { PurchaseItem } from '../../types/index.ts';

export const purchaseApi = createApi({
  reducerPath: 'purchaseApi',
  baseQuery,
  tagTypes: ['Purchase'],
  endpoints: (builder) => ({
    getPurchases: builder.query<{ success: boolean; total: number; purchases: PurchaseItem[] }, void>({
      query: () => '/purchases',
      providesTags: ['Purchase'],
    }),
  }),
});

export const { useGetPurchasesQuery } = purchaseApi;
