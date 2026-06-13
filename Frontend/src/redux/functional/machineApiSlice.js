import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../config";

export const machineApi = createApi({
  reducerPath: "machineApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Machine"],
  endpoints: (builder) => ({
    getMachines: builder.query({
      query: ({ uid, includeArchived = false }) => ({
        url: `/api/machines${includeArchived ? '?includeArchived=true' : ''}`,
        method: "POST",
        body: { uid },
      }),
      providesTags: ["Machine"],
    }),
  }),
});

export const { useGetMachinesQuery } = machineApi;
