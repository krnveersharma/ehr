import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PatientBundle = any;
export type PatientDetailsBundle = {
  patient: any;
  conditions: any[];
  allergies: any[];
  medications: any[];
  immunizations: any[];
};

export type PatientsState = {
  list: {
    bundle: PatientBundle | null;
    loading: boolean;
    error: string | null;
    filters: { count: number; pageUrl?: string; name?: string; id?: string; birthDate?: string };
  };
  details: {
    [id: string]: {
      data: PatientDetailsBundle | null;
      loading: boolean;
      error: string | null;
      tab: string;
      saving: boolean;
    };
  };
};

const initialState: PatientsState = {
  list: {
    bundle: null,
    loading: false,
    error: null,
    filters: { count: 10 },
  },
  details: {},
};

export const fetchPatients = createAsyncThunk<PatientBundle, void, { state: { patients: PatientsState } }>(
  "patients/fetchPatients",
  async (_, { getState }) => {
    const { filters } = getState().patients.list;
    const body: any = { count: filters.count, pageUrl: filters.pageUrl };
    if (filters.name) body.name = filters.name;
    if (filters.id) body.id = filters.id;
    if (filters.birthDate) body.birthDate = filters.birthDate;
    const res = await fetch(`/api/modmed/patient`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Failed to load patients");
    return json;
  }
);

export const fetchPatientDetails = createAsyncThunk<
  { id: string; data: { data: PatientDetailsBundle } },
  string
>(
  "patients/fetchPatientDetails",
  async (id: string) => {
    const res = await fetch(`/api/modmed/patient/${id}`);
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Failed to load");
    return { id, data: json };
  }
);


export const updatePatientDemographics = createAsyncThunk<{ id: string }, { id: string; updates: any }>(
  "patients/updatePatientDemographics",
  async ({ id, updates }) => {
    const res = await fetch(`/api/modmed/patient/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Failed to update");
    return { id };
  }
);

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    setListFilters(state, action: PayloadAction<Partial<PatientsState["list"]["filters"]>>) {
      state.list.filters = { ...state.list.filters, ...action.payload } as PatientsState["list"]["filters"];
    },
    setPatientTab(state, action: PayloadAction<{ id: string; tab: string }>) {
      const { id, tab } = action.payload;
      if (!state.details[id]) state.details[id] = { data: null, loading: false, error: null, tab: tab, saving: false };
      state.details[id].tab = tab;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => { state.list.loading = true; state.list.error = null; })
      .addCase(fetchPatients.fulfilled, (state, action) => { state.list.loading = false; state.list.bundle = action.payload; })
      .addCase(fetchPatients.rejected, (state, action) => { state.list.loading = false; state.list.error = action.error.message || "Failed to load patients"; })

      .addCase(fetchPatientDetails.pending, (state, action) => {
        const id = action.meta.arg;
        if (!state.details[id]) state.details[id] = { data: null, loading: false, error: null, tab: "demo", saving: false };
        state.details[id].loading = true;
        state.details[id].error = null;
      })
      .addCase(fetchPatientDetails.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        if (!state.details[id]) state.details[id] = { data: null, loading: false, error: null, tab: "demo", saving: false };
        state.details[id].loading = false;
        state.details[id].data = data.data;
      })
      .addCase(fetchPatientDetails.rejected, (state, action) => {
        const id = action.meta.arg;
        if (!state.details[id]) state.details[id] = { data: null, loading: false, error: null, tab: "demo", saving: false };
        state.details[id].loading = false;
        state.details[id].error = action.error.message || "Failed to load";
      })

      .addCase(updatePatientDemographics.pending, (state, action) => {
        const id = action.meta.arg.id;
        if (!state.details[id]) state.details[id] = { data: null, loading: false, error: null, tab: "demo", saving: false };
        state.details[id].saving = true;
        state.details[id].error = null;
      })
      .addCase(updatePatientDemographics.fulfilled, (state, action) => {
        const id = action.payload.id;
        if (!state.details[id]) state.details[id] = { data: null, loading: false, error: null, tab: "demo", saving: false };
        state.details[id].saving = false;
      })
      .addCase(updatePatientDemographics.rejected, (state, action) => {
        const id = action.meta.arg.id;
        if (!state.details[id]) state.details[id] = { data: null, loading: false, error: null, tab: "demo", saving: false };
        state.details[id].saving = false;
        state.details[id].error = action.error.message || "Failed to update";
      });
  }
});

export const { setListFilters, setPatientTab } = patientsSlice.actions;
export default patientsSlice.reducer; 