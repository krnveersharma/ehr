import { fhirFetch } from "./fhir";

export async function searchPractitioners(params: {
  family?: string;
  given?: string;
  id?: string;
  identifier?: string;
  email?: string;
  phone?: string;
  active?: string;
  _count?: number;
  page?: string;
  type?: string;
}): Promise<any> {
  if (params.id) {
    const res = await fhirFetch(`/Practitioner`);
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    const practitioner = JSON.parse(text);
    return { resourceType: "Bundle", entry: [{ resource: practitioner }] };
  }

  const qs = new URLSearchParams();

  if (params.family) qs.set("family", params.family);
  if (params.given) qs.set("given", params.given);
  if (params.identifier) qs.set("identifier", params.identifier);
  if (params.email) qs.set("email", params.email);
  if (params.phone) qs.set("phone", params.phone);
  if (params.active) qs.set("active", params.active);
  if (params._count) qs.set("_count", String(Math.min(100, params._count)));
  if (params.page) qs.set("page", params.page);
  if (params.type) qs.set("type", params.type);

  const res = await fhirFetch(`/Practitioner?${qs.toString()}`);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}


export async function searchSchedules(params: { actor?: string; date?: string; count?: number }): Promise<any> {
  const qs = new URLSearchParams();
  if (params.actor) qs.set("actor", params.actor);
  if (params.date) qs.set("date", params.date);
  if (params.count) qs.set("_count", String(Math.min(50, params.count)));
  const res = await fhirFetch(`/Schedule?${qs.toString()}`);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

export async function searchSlots(params: { schedule?: string; start?: string; end?: string; status?: string; count?: number }): Promise<any> {
  const qs = new URLSearchParams();
  if (params.schedule) qs.set("schedule", params.schedule);
  if (params.start) qs.set("start", params.start);
  if (params.end) qs.set("end", params.end);
  if (params.status) qs.set("status", params.status);
  if (params.count) qs.set("_count", String(Math.min(50, params.count)));
  const res = await fhirFetch(`/Slot?${qs.toString()}`);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

export async function searchAppointments(params: { date?: string; practitionerId?: string; patientId?: string; count?: number; status?: string }): Promise<any> {
  const qs = new URLSearchParams();
  if (params.date) qs.set("date", params.date);
  if (params.practitionerId) qs.set("practitioner", `Practitioner/${params.practitionerId}`);
  if (params.patientId) qs.set("patient", `Patient/${params.patientId}`);
  if (params.status) qs.set("status", params.status);
  if (params.count) qs.set("_count", String(Math.min(50, params.count)));
  const res = await fhirFetch(`/Appointment?${qs.toString()}`);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

export async function createAppointment(resource: any): Promise<any> {
  const res = await fhirFetch(`/Appointment`, { method: "POST", body: JSON.stringify(resource) });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

export async function updateAppointment(id: string, resource: any): Promise<any> {
  const res = await fhirFetch(`/Appointment/${id}`, { method: "PUT", body: JSON.stringify(resource) });
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

export async function cancelAppointment(id: string, reason?: string): Promise<any> {
  const patch = [
    { op: "replace", path: "/status", value: "cancelled" },
  ];
  const res = await fhirFetch(`/Appointment/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json-patch+json" }, body: JSON.stringify(patch) });
  if (res.ok) {
    try { return await res.json(); } catch { return { ok: true }; }
  }
  const text = await res.text();
  throw new Error(text);
} 