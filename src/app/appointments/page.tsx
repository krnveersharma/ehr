"use client";
import React, { useEffect, useState } from "react";

export default function AppointmentsPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [providerQuery, setProviderQuery] = useState("");
  const [patientId, setPatientId] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced provider search using supported 'family' parameter
  useEffect(() => {
    if (!providerQuery) return setProviders([]);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const query = new URLSearchParams();
        query.set("given", providerQuery);
        query.set("_count", "10");
        const res = await fetch(`/api/modmed/practitioner/search?${query.toString()}`, { signal: controller.signal });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Failed to load providers");
        setProviders(json.entry?.map((e: any) => e.resource) || []);
      } catch (e: any) {
        if (e.name !== "AbortError") console.error(e);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [providerQuery]);

  async function loadAppointments() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date); // Adjust if eq format required
      if (selectedProviderId) params.set("practitionerId", selectedProviderId);
      if (patientId) params.set("patientId", patientId);
      params.set("_count", "50");
      const res = await fetch(`/api/modmed/appointment?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to load appointments");
      setAppointments((json.entry || []).map((e: any) => e.resource));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function cancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    setLoading(true);
    setError(null);
    try {
      // Validate PATCH support and payload with ModMed API specs
      const res = await fetch(`/api/modmed/appointment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "User requested" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) throw new Error(json.error || "Failed to cancel");
      await loadAppointments();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const [bookingOpen, setBookingOpen] = useState(false);
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [bookingPatientId, setBookingPatientId] = useState("");

  async function openSlotPicker() {
    if (!selectedProviderId || !date) return;
    setBookingOpen(true);
    // In real UI, fetch available slots for provider/date; user picks start/end
  }

  async function book() {
    if (!selectedProviderId || !bookingPatientId || !slotStart || !slotEnd) {
      setError("Provider, patient, start and end are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resource = {
        resourceType: "Appointment",
        status: "booked",
        start: new Date(slotStart).toISOString(),
        end: new Date(slotEnd).toISOString(),
        participant: [
          { actor: { reference: `Practitioner/${selectedProviderId}` }, status: "accepted" },
          { actor: { reference: `Patient/${bookingPatientId}` }, status: "accepted" },
        ],
      };
      const res = await fetch(`/api/modmed/appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resource),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to book");
      setBookingOpen(false);
      setSlotStart("");
      setSlotEnd("");
      setBookingPatientId("");
      await loadAppointments();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Appointments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="flex flex-col">
          <label className="text-sm">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>

        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm">Provider</label>
          <input
            value={providerQuery}
            onChange={(e) => setProviderQuery(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Search provider by last name"
          />
          {!!providers.length && (
            <div className="border rounded bg-white max-h-48 overflow-auto">
              {providers.map((p) => (
                <button
                  key={p.id}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-50"
                  onClick={() => {
                    setSelectedProviderId(p.id);
                    setProviderQuery(
                      `${p.name?.[0]?.given?.join(" ") || ""} ${p.name?.[0]?.family || ""}`.trim()
                    );
                    setProviders([]);
                  }}
                >
                  {(p.name?.[0]?.given?.join(" ") || "")} {p.name?.[0]?.family || ""}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm">Patient ID</label>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Patient/{id}"
          />
        </div>

        <div className="flex items-end">
          <button onClick={loadAppointments} className="bg-black text-white px-3 py-2 rounded">
            Search
          </button>
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="flex justify-end">
        <button onClick={openSlotPicker} className="px-3 py-2 border rounded">
          Book new
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Start</th>
              <th className="p-2 border">End</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : appointments.length ? (
              appointments.map((a: any) => (
                <tr key={a.id}>
                  <td className="p-2 border">{a.start}</td>
                  <td className="p-2 border">{a.end}</td>
                  <td className="p-2 border">{a.status}</td>
                  <td className="p-2 border">
                    <button
                      className="px-2 py-1 border rounded mr-2"
                      onClick={() => {
                        setBookingOpen(true);
                        setSlotStart(a.start);
                        setSlotEnd(a.end);
                        const patient = a.participant?.find((p: any) =>
                          (p.actor?.reference || "").startsWith("Patient/")
                        );
                        setBookingPatientId(patient ? String(patient.actor.reference).split("/")[1] : "");
                      }}
                    >
                      Reschedule
                    </button>
                    <button className="px-2 py-1 border rounded" onClick={() => cancel(a.id)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-gray-500" colSpan={4}>
                  No appointments
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {bookingOpen && (
        <div className="border rounded p-4 space-y-3">
          <h2 className="font-medium">{slotStart && slotEnd ? "Reschedule Appointment" : "Book Appointment"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="flex flex-col">
              <label className="text-sm">Start</label>
              <input
                type="datetime-local"
                value={slotStart}
                onChange={(e) => setSlotStart(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm">End</label>
              <input
                type="datetime-local"
                value={slotEnd}
                onChange={(e) => setSlotEnd(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm">Patient ID</label>
              <input
                value={bookingPatientId}
                onChange={(e) => setBookingPatientId(e.target.value)}
                className="border rounded px-2 py-1"
                placeholder="Patient id"
              />
            </div>
            <div className="flex items-end gap-2">
              <button className="bg-black text-white px-3 py-2 rounded" onClick={book}>
                {slotStart && slotEnd ? "Save" : "Book"}
              </button>
              <button className="px-3 py-2 border rounded" onClick={() => setBookingOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
