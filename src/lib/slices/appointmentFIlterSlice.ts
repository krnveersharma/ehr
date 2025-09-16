import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { fetchAppointments } from "./appointmentsSlice";

interface AppointmentFilterState {
  start: string;
  end: string;
  patientId: string;
  practitionerId: string;
}

const initialState: AppointmentFilterState = {
  start: "",
  end: "",
  patientId: "",
  practitionerId: "",
};

export const applyAppointmentFilter = createAsyncThunk<void, void, { state: RootState }>(
  "appointmentFilter/apply",
  async (_, { dispatch, getState }) => {
    const { start, end, patientId, practitionerId } = getState().appointmentFilter;

    const filter: any = {};
    if (start && end) {
      filter.start = new Date(`${start}T00:00:00`).toISOString();
      filter.end = new Date(`${end}T23:59:59`).toISOString();
    }
    if (patientId) {
      filter.patientId = patientId.startsWith("Patient/")
        ? patientId.split("/")[1]
        : patientId;
    }
    if (practitionerId) {
      filter.practitionerId = practitionerId.startsWith("Practitioner/")
        ? practitionerId.split("/")[1]
        : practitionerId;
    }

    await dispatch(fetchAppointments(filter));
  }
);

const appointmentFilterSlice = createSlice({
  name: "appointmentFilter",
  initialState,
  reducers: {
    setStart: (state, action: PayloadAction<string>) => {
      state.start = action.payload;
    },
    setEnd: (state, action: PayloadAction<string>) => {
      state.end = action.payload;
    },
    setPatientId: (state, action: PayloadAction<string>) => {
      state.patientId = action.payload;
    },
    setPractitionerId: (state, action: PayloadAction<string>) => {
      state.practitionerId = action.payload;
    },
  },
});

export const {
  setStart,
  setEnd,
  setPatientId,
  setPractitionerId,
} = appointmentFilterSlice.actions;

export default appointmentFilterSlice.reducer;
