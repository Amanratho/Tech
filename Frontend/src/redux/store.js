import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authreducers";
import { machineApi } from "./functional/machineApiSlice"; 
import { paymentApi } from "./functional/paymentApiSlice";
import { maintenanceApi } from "./functional/maintenanceApiSlice";



const store = configureStore({
  reducer: {
    auth: authReducer, 
    [paymentApi.reducerPath]: paymentApi.reducer,
    [machineApi.reducerPath]: machineApi.reducer, 
    [maintenanceApi.reducerPath]: maintenanceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(paymentApi.middleware, machineApi.middleware, maintenanceApi.middleware),
});

export default store;
