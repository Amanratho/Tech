import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authreducers";
import { machineApi } from "./functional/machineApiSlice"; 
import { paymentApi } from "./functional/paymentApiSlice";



const store = configureStore({
  reducer: {
    auth: authReducer, 
    [paymentApi.reducerPath]: paymentApi.reducer,
    [machineApi.reducerPath]: machineApi.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(paymentApi.middleware,machineApi.middleware),
});

export default store;
