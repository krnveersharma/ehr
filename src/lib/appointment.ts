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
  const qs = new URLSearchParams();
  if (params.id) qs.set("id", params.id);
  if (params.family) qs.set("family", params.family);
  if (params.given) qs.set("given", params.given);
  if (params.identifier) qs.set("identifier", params.identifier);
  if (params.email) qs.set("email", params.email);
  if (params.phone) qs.set("phone", params.phone);
  if (params.active) qs.set("active", params.active);
  if (params._count) qs.set("_count", String(params._count));
  if (params.page) qs.set("page", params.page);
  if (params.type) qs.set("type", params.type);

  const res = await fetch(`/api/modmed/practitioner?${qs.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createPractitioner(resource: any): Promise<any> {
  const res = await fetch(`/api/modmed/practitioner`, {
    method: "POST",
    body: JSON.stringify(resource),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchSchedules(params: { actor?: string; date?: string; count?: number }): Promise<any> {
  const qs = new URLSearchParams();
  if (params.actor) qs.set("actor", params.actor);
  if (params.date) qs.set("date", params.date);
  if (params.count) qs.set("_count", String(params.count ?? 50));

  const res = await fetch(`/api/modmed/schedule?${qs.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchSlots(params: { schedule?: string; start?: string; end?: string; status?: string; count?: number }): Promise<any> {
  const qs = new URLSearchParams();
  if (params.schedule) qs.set("schedule", params.schedule);
  if (params.start) qs.set("start", params.start);
  if (params.end) qs.set("end", params.end);
  if (params.status) qs.set("status", params.status);
  if (params.count) qs.set("_count", String(params.count));

  const res = await fetch(`/api/modmed/slot?${qs.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchAppointments(params: { date?: string; practitionerId?: string; patientId?: string; count?: number; status?: string }): Promise<any> {
  const qs = new URLSearchParams();
  if (params.date) qs.set("date", params.date);
  if (params.practitionerId) qs.set("practitionerId", params.practitionerId);
  if (params.patientId) qs.set("patientId", params.patientId);
  if (params.status) qs.set("status", params.status);
  if (params.count) qs.set("_count", String(params.count));

  const res = await fetch(`/api/modmed/appointment?${qs.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createAppointment(resource: any): Promise<any> {
  const res = await fetch(`/api/modmed/appointment`, {
    method: "POST",
    body: JSON.stringify(resource),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateAppointment(id: string, resource: any): Promise<any> {
  const res = await fetch(`/api/modmed/appointment?id=${id}`, {
    method: "PUT",
    body: JSON.stringify(resource),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function cancelAppointment(id: string): Promise<any> {
  const res = await fetch(`/api/modmed/appointment?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "cancelled" }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchAvailabilityByType(params: {
  appointmentType: string;
  start: string;
  end: string;
  count?: number;
  locationId?: string;
  practitionerId?: string;
}): Promise<any> {
  const qs = new URLSearchParams();
  qs.set("appointmentType", params.appointmentType);
  qs.set("start", params.start);
  qs.set("end", params.end);
  if (params.count) qs.set("count", String(params.count));

  if (params.locationId) {
    const locationIdentifier = `http://www.hl7.org/fhir/v2/0203/index.html#v2-0203-FI|${params.locationId}`;
    qs.append("identifier", encodeURIComponent(locationIdentifier));
  }

  if (params.practitionerId) {
    const practitionerIdentifier = `http://www.hl7.org/fhir/v2/0203/index.html#v2-0203-PRN|${params.practitionerId}`;
    qs.append("identifier", encodeURIComponent(practitionerIdentifier));
  }

  const res = await fetch(`/api/modmed/slot?${qs.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}