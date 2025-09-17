"use client";
import React, { useState } from "react";
import { json } from "stream/consumers";

export default function AppointmentForm({
  initialPatientId = "",
  slot,
  appointmentType,
  locationId,
  practitionerId,
  onSubmit,
  onClose,
}: {
  initialPatientId?: string;
  appointmentType: string;
  locationId: string;
  practitionerId:string;
  slot: {
    start: string;
    end: string;
    practitionerId: string;
    locationId: string;
    appointmentType: string;
  };
  onSubmit: (resource: any) => Promise<void> | void;
  onClose: () => void;
}) {
  const [patientId, setPatientId] = useState(initialPatientId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!patientId) {
      alert("Patient ID is required");
      return;
    }

    const resource = {
      resourceType: "Appointment",
      status: "booked",
      appointmentType: {
        coding: [
          {
            system: "https://stage.ema-api.com/ema-dev/firm/entpmsandbox393/ema/fhir/v2/ValueSet/appointment-type",
            code: appointmentType,
          },
        ],
        text: appointmentType,
      },
      start: slot.start,
      end: slot.end,
      minutesDuration: Math.ceil((new Date(slot.end).getTime() - new Date(slot.start).getTime()) / 60000),
      participant: [
        { actor: { reference: `Location/${locationId}` } },
        { actor: { reference: `Practitioner/${practitionerId}` } },
        { actor: { reference: `Patient/${patientId}` } },
      ],
    };
    await onSubmit(resource);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-col">
        <label className="text-sm">Patient ID</label>
        <input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="Enter Patient ID"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-black text-white px-3 py-2 rounded">
          Book
        </button>
        <button type="button" className="px-3 py-2 border rounded" onClick={onClose}>
          Close
        </button>
      </div>
    </form>
  );
}
