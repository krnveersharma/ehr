import { useState } from "react";
import AppointmentTable from "./AppointmentTable";
import { Filter } from "@/interfaces/AppointmentFilter";

interface ExistingAppointmentsProps {
  appointments: any[];
  loading: boolean;
  onCancel: (id: string) => void;
  onReschedule: (appointment: any) => void;
  onFilter: (filter: Filter) => void;
}

export default function ExistingAppointments({
  appointments,
  loading,
  onCancel,
  onReschedule,
  onFilter,
}: ExistingAppointmentsProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [patientId, setPatientId] = useState("");
  const [practitionerId, setPractitionerId] = useState("");

  const handleSearch = () => {
    const filter: Filter = {};

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

    onFilter(filter);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-medium">Existing Appointments</h2>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm">Start Date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">End Date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Patient ID</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Patient/123 or 123"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Practitioner ID</label>
          <input
            type="text"
            value={practitionerId}
            onChange={(e) => setPractitionerId(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Practitioner/456 or 456"
          />
        </div>
        <div>
          <button
            onClick={handleSearch}
            className="bg-black text-white px-3 py-2 rounded w-full"
          >
            Search
          </button>
        </div>
      </div>

      <AppointmentTable
        loading={loading}
        appointments={appointments}
        onCancel={onCancel}
        onReschedule={onReschedule}
      />
    </div>
  );
}
