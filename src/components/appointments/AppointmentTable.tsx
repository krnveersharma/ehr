"use client";
import { formatReadableDateTime } from "@/app/utils/humanReadableDate";
import React, { useState } from "react";
import UpdateAppointmentModal from "./UpdateAppointmentModal";
import { updateAppointment } from "@/lib/slices/appointmentsSlice";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppDispatch } from "@/lib/store";
import { applyAppointmentFilter } from "@/lib/slices/appointmentFIlterSlice";

export default function AppointmentTable({
  loading,
  appointments,
  onReschedule,
  onCancel,
}: {
  loading: boolean;
  appointments: any[];
  onReschedule: (appt: any) => void;
  onCancel: (id: string) => void;
}) {
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const dispatch = useAppDispatch()

  const onSubmit=async(data: { id: string, data: any })=>{
    await dispatch(updateAppointment({ id: data.id, data }))
    dispatch(applyAppointmentFilter());
  }
  
    const handleCancel = (appointment:any) => {
    const minutesDuration = Math.ceil(
      (new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) / 60000
    );
    const isNewPatient=appointment.supportingInformation?.[0]?.identifier?.value === "true"

    const data = {
      ...appointment,
      start:appointment.start,
      end:appointment.end,
      minutesDuration,
      status:"cancelled",
      description:appointment.description,
      supportingInformation: [
        {
          identifier: {
            system: "NEW_PATIENT",
            value: isNewPatient ? "true" : "false",
          },
          display: `New Patient: ${isNewPatient}`,
        },
      ],
    };

    onSubmit(data);
  };


  return (
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
                <td className="p-2 border">{formatReadableDateTime(a.start)}</td>
                <td className="p-2 border">{formatReadableDateTime(a.end)}</td>
                <td className="p-2 border">{a.status}</td>
                <td className="p-2 border">
                  <button className="px-2 py-1 border rounded mr-2" onClick={() => setSelectedAppointment(a)}>Update</button>
                  <button className="px-2 py-1 border rounded" onClick={()=>handleCancel(a)}>Cancel</button>
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
      {selectedAppointment && (
        <UpdateAppointmentModal
          appointment={selectedAppointment}
          onSubmit={onSubmit}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
} 