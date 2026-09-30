import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index.ts';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

export const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || localStorage.getItem('bv_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
