import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: (uid) => ({
        url: "/api/rentals",
        method: "POST",
        body: { uid },
      }),
      transformResponse: (response) => {
        
        return response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      },
    }),

    updatePayment: builder.mutation({
      query: ({ _id, pendingAmount, paidAmount }) => ({
        url: "/api/update-payment",
        method: "PUT",
        body: { _id, pendingAmount, paidAmount },
      }),
    }),
  }),
});

export const { useGetPaymentsQuery, useUpdatePaymentMutation } = paymentApi;
