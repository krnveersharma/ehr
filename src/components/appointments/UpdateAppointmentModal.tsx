import { useState } from "react";

export default function UpdateAppointmentModal({ appointment, onSubmit, onClose }: any) {
  const [start, setStart] = useState(appointment.start);
  const [end, setEnd] = useState(appointment.end);
  const [status, setStatus] = useState(appointment.status || "booked");
  const [description, setDescription] = useState(appointment.description || "");
  const [isNewPatient, setIsNewPatient] = useState(
    appointment.supportingInformation?.[0]?.identifier?.value === "true"
  );

  const handleSave = () => {
    const minutesDuration = Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) / 60000
    );

    const data = {
      ...appointment,
      start,
      end,
      minutesDuration,
      status,
      description,
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold">Update Appointment</h2>

        <div className="space-y-2">
          <label className="block text-sm">Start</label>
          <input type="datetime-local" value={start.slice(0,16)} onChange={e => setStart(e.target.value)} className="border px-2 py-1 w-full" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm">End</label>
          <input type="datetime-local" value={end.slice(0,16)} onChange={e => setEnd(e.target.value)} className="border px-2 py-1 w-full" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="border px-2 py-1 w-full">
            <option value="pending">Pending</option>
            <option value="booked">Confirmed</option>
            <option value="arrived">Arrived</option>
            <option value="fulfilled">Checked-out</option>
            <option value="cancelled">Cancelled</option>
            <option value="noshow">No Show</option>
            <option value="checked-in">Checked-in</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm">Reason for Visit</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="border px-2 py-1 w-full" />
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" checked={isNewPatient} onChange={e => setIsNewPatient(e.target.checked)} />
          <label className="text-sm">New Patient</label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} className="px-3 py-2 bg-black text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
