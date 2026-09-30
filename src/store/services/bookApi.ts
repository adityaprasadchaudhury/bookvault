import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './apiBase.ts';
import { Book } from '../../types/index.ts';

export const bookApi = createApi({
  reducerPath: 'bookApi',
  baseQuery,
  tagTypes: ['Book'],
  endpoints: (builder) => ({
    getBooks: builder.query<{ success: boolean; total: number; books: Book[] }, void>({
      query: () => '/books',
      providesTags: ['Book'],
    }),
    getBookById: builder.query<{ success: boolean; book: Book }, string>({
      query: (id) => `/books/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Book', id }],
    }),
  }),
});

export const { useGetBooksQuery, useGetBookByIdQuery } = bookApi;
