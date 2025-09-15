"use client";
import React, { useEffect, useState } from "react";
import ProviderSearch from "@/components/appointments/ProviderSearch";
import AddProviderForm from "@/components/appointments/AddProviderForm";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import AppointmentTable from "@/components/appointments/AppointmentTable";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
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
  fetchProviders,
  fetchAppointments,
  cancelAppointment,
  createAppointment,
  createProvider,
  fetchAvailabilityByType,
  setAvailabilityType,
  setAvailabilityStart,
  setAvailabilityEnd,
  setAvailabilityLocation,
  fetchLocations,
  fetchAppointmentTypes
} from "@/lib/slices/appointmentsSlice";

export default function AppointmentsPage() {
  const dispatch = useAppDispatch();
  const {
    date,
    providerQuery,
    providers,
    selectedProviderId,
    patientId,
    appointments,
    loading,
    error,
    bookingOpen,
    slotStart,
    slotEnd,
    bookingPatientId,
    addProviderOpen,
    availability,
    availabilityLoading,
    availabilityType,
    availabilityStart,
    availabilityEnd,
    availabilityLocation,
    locations,
    types
  } = useAppSelector((s) => s.appointments);
  const [slotToBook, setSlotToBook] = useState<any>(null);


  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchLocations());
    dispatch(fetchAppointmentTypes());
  }, [dispatch]);

  useEffect(() => {
    if (!providerQuery) return void dispatch(clearProviders());
    const controller = new AbortController();
    const id = setTimeout(() => {
      dispatch(fetchProviders(providerQuery));
    }, 300);
    return () => { controller.abort(); clearTimeout(id); };
  }, [providerQuery, dispatch]);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Appointments</h1>

      {/* Availability Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
        <div className="flex flex-col">
          <label className="text-sm">Start</label>
          <input
            type="datetime-local"
            value={availabilityStart}
            onChange={(e) => dispatch(setAvailabilityStart(e.target.value))}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">End</label>
          <input
            type="datetime-local"
            value={availabilityEnd}
            onChange={(e) => dispatch(setAvailabilityEnd(e.target.value))}
            className="border rounded px-2 py-1"
          />
        </div>
        
<div className="flex flex-col">
  <label className="text-sm">Appointment Type</label>
  <select
    value={availabilityType}
    onChange={(e) => dispatch(setAvailabilityType(e.target.value))}
    className="border rounded px-2 py-1"
  >
    <option value="">Select type</option>
    {types.map((t) => (
      <option key={t.code} value={t.code}>
        {t.display || t.code}
      </option>
    ))}
  </select>
</div>
        <div className="flex flex-col">
          <label className="text-sm">Location</label>
          <select
            value={availabilityLocation || ""}
            onChange={(e) => dispatch(setAvailabilityLocation(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value="">All locations</option>
            {locations.map((loc: any) => (
              <option key={loc.resource.id} value={loc.resource.id}>{loc.resource.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              if (availabilityType && availabilityStart && availabilityEnd) {
                dispatch(
                  fetchAvailabilityByType({
                    appointmentType: availabilityType,
                    start: availabilityStart,
                    end: availabilityEnd,
                    locationId: availabilityLocation,
                  })
                );
              }
            }}
            className="bg-black text-white px-3 py-2 rounded"
          >
            Check availability
          </button>
        </div>
      </div>

      {/* Availability Table */}
      {availabilityLoading ? (
        <div>Loading availability...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Start</th>
                <th className="p-2 border">End</th>
                <th className="p-2 border">Schedule</th>
              </tr>
            </thead>
            <tbody>
  {availability.length ? availability.map((slot: any) => (
    <tr key={slot.resource.id} className="hover:bg-gray-50">
      <td className="p-2 border">{new Date(slot.resource.start).toLocaleString()}</td>
      <td className="p-2 border">{new Date(slot.resource.end).toLocaleString()}</td>
      <td className="p-2 border flex gap-2 items-center">
        {slot.resource.schedule?.display || ""}
        <button
          className="bg-blue-600 text-white px-2 py-1 rounded"
          onClick={() => setSlotToBook(slot.resource)}
        >
          Schedule
        </button>
      </td>
    </tr>
  )) : (
    <tr><td className="p-3 text-gray-500" colSpan={3}>No slots</td></tr>
  )}
</tbody>
          </table>
        </div>
      )}

      {error && <div className="text-red-600">{error}</div>}

      <div className="flex items-center justify-between">
        <h2 className="font-medium">Existing Appointments</h2>
      </div>

      <AppointmentTable
        loading={loading}
        appointments={appointments}
        onCancel={(id) => { if (confirm("Cancel this appointment?")) { void dispatch(cancelAppointment(id)).then(() => dispatch(fetchAppointments())); } }}
        onReschedule={(a) => {
          dispatch(openBooking());
          dispatch(setSlotStart(a.start));
          dispatch(setSlotEnd(a.end));
          const patient = a.participant?.find((p: any) => (p.actor?.reference || '').startsWith('Patient/'));
          dispatch(setBookingPatientId(patient ? String(patient.actor.reference).split('/')[1] : ""));
        }}
      />

      {/* Booking Modal */}
      {bookingOpen && (
        <div className="border rounded p-4 space-y-3">
          <h2 className="font-medium">{slotStart && slotEnd ? "Reschedule Appointment" : "Book Appointment"}</h2>
          <AppointmentForm
            initialStart={slotStart}
            initialEnd={slotEnd}
            initialPatientId={bookingPatientId}
            practitionerId={selectedProviderId}
            onSubmit={async (resource) => { await dispatch(createAppointment(resource)); await dispatch(fetchAppointments()); }}
            onClose={() => dispatch(closeBooking())}
          />
        </div>
      )}

{slotToBook && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded shadow-lg w-full max-w-lg">
      <h2 className="font-medium mb-3">Book Slot</h2>
      <AppointmentForm
      slot={slotToBook}
        appointmentType= {slotToBook.identifier.find((i:any) => i.system.includes('appointment-type'))?.value}
        locationId= {slotToBook.identifier.find((i:any) => i.system.includes('FI'))?.value}
        practitionerId={slotToBook.identifier.find((i:any) => i.system.includes('PRN'))?.value || ""}
        onSubmit={async (resource) => {
          await dispatch(createAppointment(resource));
          await dispatch(fetchAvailabilityByType({ 
            appointmentType: slotToBook.identifier.find((i:any) => i.system.includes('appointment-type'))?.value, 
            start: availabilityStart, 
            end: availabilityEnd,
            locationId: slotToBook.identifier.find((i:any) => i.system.includes('FI'))?.value,
          }));
          // setSlotToBook(null);
        }}
        onClose={() => setSlotToBook(null)}
      />
    </div>
  </div>
)}

      {/* Add Provider Modal */}
      {addProviderOpen && (
        <div className="border rounded p-4 space-y-3">
          <h2 className="font-medium">Add provider</h2>
          <AddProviderForm onCreate={async (resource) => {
            const result = await dispatch(createProvider(resource));
            if ((result as any).type?.endsWith('fulfilled')) {
              const name = (result as any).payload?.name?.[0]?.family || "";
              dispatch(setProviderQuery(name));
            }
          }} onClose={() => dispatch(closeAddProvider())} />
        </div>
      )}
    </div>
  );
}
