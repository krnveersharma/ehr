import { formatReadableDateTime } from "@/app/utils/humanReadableDate";

export default function AvailabilityTable({ availability, loading, onSchedule }: any) {
  if (loading) return <div>Loading availability...</div>;

  return (
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
              <td className="p-2 border">{formatReadableDateTime(slot.resource.start)}</td>
              <td className="p-2 border">{formatReadableDateTime(slot.resource.end)}</td>
              <td className="p-2 border flex gap-2 items-center">
                <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={() => onSchedule(slot.resource)}>
                  Schedule
                </button>
              </td>
            </tr>
          )) : <tr><td colSpan={3} className="p-3 text-gray-500">No slots</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
