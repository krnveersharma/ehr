import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import appointmentsReducer from "./slices/appointmentsSlice";
import patientsReducer from "./slices/patientsSlice";
import appointmentFilterReducer from "./slices/appointmentFIlterSlice";

export const store = configureStore({
  reducer: {
    appointments: appointmentsReducer,
    patients: patientsReducer,
    appointmentFilter: appointmentFilterReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 