import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { searchAvailabilityByType } from "@/lib/appointment";
import { Filter } from "@/interfaces/AppointmentFilter";

export type Provider = any;
export type Appointment = any;

export type AppointmentsState = {
  date: string;
  providerQuery: string;
  providers: Provider[];
  selectedProviderId: string;
  patientId: string;
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  bookingOpen: boolean;
  slotStart: string;
  slotEnd: string;
  bookingPatientId: string;
  availabilityPractitioner: string;
  addProviderOpen: boolean;
  availability: any[];
  availabilityLoading: boolean;
  availabilityType: string;
  availabilityStart: string;
  availabilityEnd: string;
  availabilityLocation: string;
  locations: { id: string; name: string }[];
  types: any[];
};

const initialState: AppointmentsState = {
  date: new Date().toISOString().slice(0, 10),
  providerQuery: "",
  providers: [],
  selectedProviderId: "",
  patientId: "",
  appointments: [],
  loading: false,
  error: null,
  bookingOpen: false,
  slotStart: "",
  slotEnd: "",
  bookingPatientId: "",
  availabilityPractitioner: "",
  addProviderOpen: false,
  availability: [],
  availabilityLoading: false,
  availabilityType: "",
  availabilityStart: "",
  availabilityEnd: "",
  availabilityLocation: "",
  locations: [],
  types: [],
};

export const fetchLocations = createAsyncThunk<any[]>(
  "appointments/fetchLocations",
  async () => {
    const res = await fetch("/api/modmed/location");
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Failed to fetch locations");
    return json.entry || [];
  }
);


export const fetchProviders = createAsyncThunk<Provider[], string>(
  "appointments/fetchProviders",
  async (query: string, { signal }) => {
    if (!query) return [];
    const params = new URLSearchParams();
    params.set("given", query);
    params.set("_count", "10");
    const res = await fetch(`/api/modmed/practitioner/search?${params.toString()}`, { signal });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Failed to load providers");
    return (json.entry?.map((e: any) => e.resource) || []) as Provider[];
  }
);
export const fetchAppointmentTypes = createAsyncThunk<any[]>(
  "appointments/fetchAppointmentTypes",
  async () => {
    const res = await fetch("/api/modmed/appointmentType");
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Failed to fetch appointment types");
    const concepts = json.compose?.include?.[0]?.concept || [];
    return concepts;
  }
);


export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAppointments",
  async (filter: Filter | undefined) => {
    const qs = new URLSearchParams();
    if (filter?.start && filter?.end) {
      qs.set("start", filter.start);
      qs.set("end", filter.end);
    }
    if (filter?.patientId) {
      qs.set("patient", `Patient/${filter.patientId}`);
    }
    if (filter?.practitionerId) {
      qs.set("practitioner", `Practitioner/${filter.practitionerId}`);
    }

    const url = `/api/modmed/appointment${qs.toString() ? "?" + qs.toString() : ""}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
);

export const cancelAppointment = createAsyncThunk<void, string>(
  "appointments/cancelAppointment",
  async (id: string) => {
    const res = await fetch(`/api/modmed/appointment/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "User requested" }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) throw new Error(json.error || "Failed to cancel");
  }
);

export const createAppointment = createAsyncThunk<void, any>(
  "appointments/createAppointment",
  async (resource: any) => {
    const res = await fetch(`/api/modmed/appointment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resource),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Failed to save appointment");
  }
);

export const createProvider = createAsyncThunk<any, any>(
  "appointments/createProvider",
  async (resource: any) => {
    const res = await fetch(`/api/modmed/practitioner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resource),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Failed to create provider");
    return json;
  }
);

export const fetchAvailabilityByType = createAsyncThunk<
  any[],
  { appointmentType: string; start: string; end: string; locationId?: string; practitionerId?: string }
>(
  "appointments/fetchAvailabilityByType",
  async ({ appointmentType, start, end, locationId, practitionerId }) => {
    const bundle = await searchAvailabilityByType({
      appointmentType,
      start,
      end,
      count: 100,
      locationId,
      practitionerId,
    });
    return bundle.entry || [];
  }
);

export const updateAppointment = createAsyncThunk<void, { id: string; data: any }>(
  "appointments/updateAppointment",
  async ({ id, data }) => {
    const res = await fetch(`/api/modmed/appointment/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) throw new Error(json.error || "Failed to update appointment");
  }
);


const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setAvailabilityLocation(state, action: PayloadAction<string>) {
      state.availabilityLocation = action.payload;
    },
    setAvailabilityType(state, action: PayloadAction<string>) {
      state.availabilityType = action.payload;
    },
    setDate(state, action: PayloadAction<string>) { state.date = action.payload; },
    setProviderQuery(state, action: PayloadAction<string>) { state.providerQuery = action.payload; },
    clearProviders(state) { state.providers = []; },
    setSelectedProviderId(state, action: PayloadAction<string>) { state.selectedProviderId = action.payload; },
    setPatientId(state, action: PayloadAction<string>) { state.patientId = action.payload; },
    openBooking(state) { state.bookingOpen = true; },
    closeBooking(state) { state.bookingOpen = false; state.slotStart = ""; state.slotEnd = ""; state.bookingPatientId = ""; },
    setSlotStart(state, action: PayloadAction<string>) { state.slotStart = action.payload; },
    setSlotEnd(state, action: PayloadAction<string>) { state.slotEnd = action.payload; },
    setBookingPatientId(state, action: PayloadAction<string>) { state.bookingPatientId = action.payload; },
    openAddProvider(state) { state.addProviderOpen = true; },
    closeAddProvider(state) { state.addProviderOpen = false; },
    clearError(state) { state.error = null; },
    setAvailabilityStart(state, action: PayloadAction<string>) { state.availabilityStart = action.payload; },
    setAvailabilityEnd(state, action: PayloadAction<string>) { state.availabilityEnd = action.payload; },
    setAvailabilityPractitioner: (s, a: PayloadAction<string>) => { s.availabilityPractitioner = a.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load locations";
      })
      .addCase(fetchAppointmentTypes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAppointmentTypes.fulfilled, (state, action) => { state.loading = false; state.types = action.payload; })
      .addCase(fetchAppointmentTypes.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to load appointment types"; })
      .addCase(fetchProviders.fulfilled, (state, action) => { state.providers = action.payload; })
      .addCase(fetchAppointments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        const bundle = action.payload;
        state.appointments = bundle.entry?.map((e: any) => e.resource) || [];
      }).addCase(fetchAppointments.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to load"; })
      .addCase(cancelAppointment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(cancelAppointment.fulfilled, (state) => { state.loading = false; })
      .addCase(cancelAppointment.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to cancel"; })
      .addCase(createAppointment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createAppointment.fulfilled, (state) => { state.loading = false; state.bookingOpen = false; state.slotStart = ""; state.slotEnd = ""; state.bookingPatientId = ""; })
      .addCase(createAppointment.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to save"; })
      .addCase(createProvider.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProvider.fulfilled, (state, action) => { state.loading = false; state.addProviderOpen = false; state.providerQuery = action.payload?.name?.[0]?.family || ""; })
      .addCase(createProvider.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to create provider"; })
      .addCase(fetchAvailabilityByType.pending, (state) => { state.availabilityLoading = true; state.error = null; state.availability = []; })
      .addCase(fetchAvailabilityByType.fulfilled, (state, action) => { state.availabilityLoading = false; state.availability = action.payload; })
      .addCase(fetchAvailabilityByType.rejected, (state, action) => { state.availabilityLoading = false; state.error = action.error.message || "Failed to load availability"; })
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    .addCase(updateAppointment.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(updateAppointment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to update appointment";
    });

}
});

export const {
  setDate,
  setProviderQuery,
  clearProviders,
  setSelectedProviderId,
  setPatientId,
  openBooking,
  closeBooking,
  setSlotStart,
  setSlotEnd,
  setBookingPatientId,
  openAddProvider,
  closeAddProvider,
  clearError,
  setAvailabilityType,
  setAvailabilityStart,
  setAvailabilityEnd,
  setAvailabilityLocation,
  setAvailabilityPractitioner
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer; 