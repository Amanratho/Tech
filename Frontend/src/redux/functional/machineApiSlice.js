import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../config";

export const machineApi = createApi({
  reducerPath: "machineApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getMachines: builder.query({
      query: (uid) => ({
        url: "/api/machines",
        method: "POST",
        body: { uid },
      }),
    }),
  }),
});

export const { useGetMachinesQuery } = machineApi;
