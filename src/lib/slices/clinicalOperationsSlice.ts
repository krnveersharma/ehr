import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Vitals {
  bp: string;
  hr: string;
  temp: string;
}

interface ClinicalOperationsState {
  encounter: any | null;
  notes: string;
  vitals: Vitals;
  medications: any[];
  conditions: any[];
  labReports: any[];
  history: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ClinicalOperationsState = {
  encounter: null,
  notes: "",
  vitals: { bp: "", hr: "", temp: "" },
  medications: [],
  conditions: [],
  labReports: [],
  history: [],
  loading: false,
  error: null,
};

const headers = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const fetchEncounter = createAsyncThunk(
  "clinical/fetchEncounter",
  async ({ patientId, token }: { patientId: string; token: string }) => {
    const res = await fetch(`/ema/fhir/v2/Encounter?patient=${patientId}`, { headers: headers(token) });
    const data = await res.json();
    return data.entry?.[0]?.resource || null;
  }
);

export const fetchMedications = createAsyncThunk(
  "clinical/fetchMedications",
  async ({ patientId, token }: { patientId: string; token: string }) => {
    const res = await fetch(`/ema/fhir/v2/MedicationStatement?patient=${patientId}`, { headers: headers(token) });
    const data = await res.json();
    return data.entry?.map((e: any) => e.resource) || [];
  }
);

export const fetchLabReports = createAsyncThunk(
  "clinical/fetchLabReports",
  async ({ patientId, token }: { patientId: string; token: string }) => {
    const res = await fetch(`/ema/fhir/v2/DiagnosticReport?patient=${patientId}`, { headers: headers(token) });
    const data = await res.json();
    return data.entry?.map((e: any) => e.resource) || [];
  }
);

export const fetchHistory = createAsyncThunk(
  "clinical/fetchHistory",
  async ({ patientId, token }: { patientId: string; token: string }) => {
    const res = await fetch(`/ema/fhir/v2/Encounter?patient=${patientId}`, { headers: headers(token) });
    const data = await res.json();
    return data.entry?.map((e: any) => e.resource) || [];
  }
);

const clinicalSlice = createSlice({
  name: "clinical",
  initialState,
  reducers: {
    setNotes(state, action: PayloadAction<string>) {
      state.notes = action.payload;
    },
    setVitals(state, action: PayloadAction<Vitals>) {
      state.vitals = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEncounter.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEncounter.fulfilled, (state, action) => {
        state.loading = false;
        state.encounter = action.payload;
      })
      .addCase(fetchEncounter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch encounter";
      })
      .addCase(fetchMedications.fulfilled, (state, action) => {
        state.medications = action.payload;
      })
      .addCase(fetchLabReports.fulfilled, (state, action) => {
        state.labReports = action.payload;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const { setNotes, setVitals } = clinicalSlice.actions;
export default clinicalSlice.reducer;
