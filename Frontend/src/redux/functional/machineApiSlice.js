import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const machineApi = createApi({
  reducerPath: "machineApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL }),
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
