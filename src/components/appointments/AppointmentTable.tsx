"use client";
import { formatReadableDateTime } from "@/app/utils/humanReadableDate";
import React from "react";

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
                  <button className="px-2 py-1 border rounded mr-2" onClick={() => onReschedule(a)}>Update</button>
                  <button className="px-2 py-1 border rounded" onClick={() => onCancel(a.id)}>Cancel</button>
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
  );
} 