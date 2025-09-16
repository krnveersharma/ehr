"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  fetchProviders,
  clearProviders,
  fetchAppointments,
  fetchLocations,
  fetchAppointmentTypes,
  cancelAppointment,
  createAppointment,
  openBooking,
  closeBooking,
  setSlotStart,
  setSlotEnd,
  setBookingPatientId,
  createProvider,
  closeAddProvider,
  setProviderQuery
} from "@/lib/slices/appointmentsSlice";

import Filters from "@/components/appointments/Filters";
import AvailabilityTable from "@/components/appointments/AvailabilityTable";
import ExistingAppointments from "@/components/appointments/ExistingAppointments";
import BookingModal from "@/components/appointments/BookingModal";
import AddProviderModal from "@/components/appointments/AddProviderModal";

export default function AppointmentsPage() {
  const dispatch = useAppDispatch();
  const {
    providerQuery,
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
    types,
    selectedProviderId
  } = useAppSelector((s) => s.appointments);

  const [slotToBook, setSlotToBook] = useState<any>(null);

  useEffect(() => {
    // dispatch(fetchAppointments());
    dispatch(fetchLocations());
    dispatch(fetchAppointmentTypes());
  }, [dispatch]);

  useEffect(() => {
    if (!providerQuery) return void dispatch(clearProviders());
    const id = setTimeout(() => dispatch(fetchProviders(providerQuery)), 300);
    return () => clearTimeout(id);
  }, [providerQuery, dispatch]);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Appointments</h1>

      <Filters />

      <AvailabilityTable
        availability={availability}
        loading={availabilityLoading}
        onSchedule={(slot: any) => setSlotToBook(slot)}
      />

      {error && <div className="text-red-600">{error}</div>}
      <ExistingAppointments
        appointments={appointments}
        loading={loading}
        onCancel={(id) => {
          if (confirm("Cancel this appointment?")) {
            void dispatch(cancelAppointment(id)).then(() => dispatch(fetchAppointments()));
          }
        }}
        onReschedule={(a) => {
          dispatch(openBooking());
          dispatch(setSlotStart(a.start));
          dispatch(setSlotEnd(a.end));
          const patient = a.participant?.find((p: any) =>
            (p.actor?.reference || '').startsWith('Patient/')
          );
          dispatch(setBookingPatientId(patient ? String(patient.actor.reference).split('/')[1] : ""));
        }}
        onFilter={(filter) => {
          dispatch(fetchAppointments(filter));
        }}
      />


      {bookingOpen && (
        <BookingModal
          initialStart={slotStart}
          initialEnd={slotEnd}
          initialPatientId={bookingPatientId}
          practitionerId={selectedProviderId}
          onSubmit={async (resource: any) => {
            await dispatch(createAppointment(resource));
            await dispatch(fetchAppointments());
          }}
          onClose={() => dispatch(closeBooking())}
        />
      )}

      {slotToBook && (
        <BookingModal
          slot={slotToBook}
          appointmentType={slotToBook.identifier.find((i: any) => i.system.includes("appointment-type"))?.value}
          locationId={slotToBook.identifier.find((i: any) => i.system.includes("FI"))?.value}
          practitionerId={slotToBook.identifier.find((i: any) => i.system.includes("PRN"))?.value || ""}
          onSubmit={async (resource: any) => {
            await dispatch(createAppointment(resource));
            await dispatch(fetchAppointments());
          }}
          onClose={() => setSlotToBook(null)}
        />
      )}

      {addProviderOpen && (
        <AddProviderModal
          onCreate={async (resource: any) => {
            const result = await dispatch(createProvider(resource));
            if ((result as any).type?.endsWith('fulfilled')) {
              const name = (result as any).payload?.name?.[0]?.family || "";
              dispatch(setProviderQuery(name));
            }
          }}
          onClose={() => dispatch(closeAddProvider())}
        />
      )}
    </div>
  );
}
