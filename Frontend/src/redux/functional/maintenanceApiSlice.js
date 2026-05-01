import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../config";

export const maintenanceApi = createApi({
  reducerPath: "maintenanceApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Maintenance"],
  endpoints: (builder) => ({
    getMaintenanceByMachine: builder.query({
      query: (machineId) => `/api/maintenance/${machineId}`,
      providesTags: (result, error, machineId) => [
        { type: "Maintenance", id: machineId },
      ],
    }),

    addMaintenance: builder.mutation({
      query: (body) => ({
        url: "/api/add-maintenance",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { machineId }) => [
        { type: "Maintenance", id: machineId },
      ],
    }),

    deleteMaintenance: builder.mutation({
      query: (id) => ({
        url: `/api/delete-maintenance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Maintenance"],
    }),
  }),
});

export const {
  useGetMaintenanceByMachineQuery,
  useAddMaintenanceMutation,
  useDeleteMaintenanceMutation,
} = maintenanceApi;
