import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../config";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Payments"],
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
      providesTags: ["Payments"],
    }),

    updatePayment: builder.mutation({
      query: ({ _id, pendingAmount, paidAmount }) => ({
        url: "/api/update-payment",
        method: "PUT",
        body: { _id, pendingAmount, paidAmount },
      }),
      invalidatesTags: ["Payments"],
    }),

    editRental: builder.mutation({
      query: (body) => ({
        url: "/api/edit-rental",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Payments"],
    }),

    deleteRentals: builder.mutation({
      query: ({ ids }) => ({
        url: "/api/delete-multiple",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Payments"],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useUpdatePaymentMutation,
  useEditRentalMutation,
  useDeleteRentalsMutation,
} = paymentApi;
