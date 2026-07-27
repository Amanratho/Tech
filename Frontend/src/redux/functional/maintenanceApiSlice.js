import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../config";

export const maintenanceApi = createApi({
  reducerPath: "maintenanceApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Maintenance", "Machine"],
  endpoints: (builder) => ({
    getMaintenanceByMachine: builder.query({
      query: (machineId) => ({
        url: `/api/maintenance/${machineId}`,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }),
      providesTags: (result, error, machineId) => [
        { type: "Maintenance", id: machineId },
        { type: "Maintenance", id: "LIST" },
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
        { type: "Maintenance", id: "LIST" },
        { type: "Machine" },
      ],
    }),

    deleteMaintenance: builder.mutation({
      query: ({ id }) => ({
        url: `/api/delete-maintenance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { machineId }) => [
        { type: "Maintenance", id: machineId },
        { type: "Maintenance", id: "LIST" },
        { type: "Machine" },
      ],
    }),
  }),
});

export const {
  useGetMaintenanceByMachineQuery,
  useAddMaintenanceMutation,
  useDeleteMaintenanceMutation,
} = maintenanceApi;
