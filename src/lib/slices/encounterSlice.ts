import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fhirFetch } from "../fhir";

interface EncounterState {
  practitionerId: string;
  upcomingVisits: any[];
  selectedEncounter: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: EncounterState = {
  practitionerId: "",
  upcomingVisits: [],
  selectedEncounter: null,
  loading: false,
  error: null,
};

export const fetchUpcomingVisits = createAsyncThunk(
  "encounter/fetchUpcomingVisits",
  async () => {
    const res = await fetch(`/api/modmed/enquiry`);
    const data = await res.json();
    console.log("data is: ",data)
    return data.visits;
  }
);

const encounterSlice = createSlice({
  name: "encounter",
  initialState,
  reducers: {
    setPractitionerId(state, action: PayloadAction<string>) {
      state.practitionerId = action.payload;
    },
    setSelectedEncounter(state, action: PayloadAction<any>) {
      state.selectedEncounter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingVisits.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUpcomingVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingVisits = action.payload;
      })
      .addCase(fetchUpcomingVisits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch visits";
      });
  },
});

export const { setPractitionerId, setSelectedEncounter } = encounterSlice.actions;
export default encounterSlice.reducer;
