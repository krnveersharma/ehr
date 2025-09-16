import { useAppDispatch, useAppSelector } from "@/lib/store";
import { setAvailabilityStart, setAvailabilityEnd, setAvailabilityType, setAvailabilityLocation, fetchAvailabilityByType } from "@/lib/slices/appointmentsSlice";

export default function Filters() {
  const dispatch = useAppDispatch();
  const { availabilityStart, availabilityEnd, availabilityType, availabilityLocation, locations, types } = useAppSelector((s) => s.appointments);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
      <div className="flex flex-col">
        <label className="text-sm">Start</label>
        <input type="datetime-local" value={availabilityStart} onChange={(e) => dispatch(setAvailabilityStart(e.target.value))} className="border rounded px-2 py-1" />
      </div>
      <div className="flex flex-col">
        <label className="text-sm">End</label>
        <input type="datetime-local" value={availabilityEnd} onChange={(e) => dispatch(setAvailabilityEnd(e.target.value))} className="border rounded px-2 py-1" />
      </div>
      <div className="flex flex-col">
        <label className="text-sm">Type</label>
        <select value={availabilityType} onChange={(e) => dispatch(setAvailabilityType(e.target.value))} className="border rounded px-2 py-1">
          <option value="">Select type</option>
          {types.map((t) => <option key={t.code} value={t.code}>{t.display || t.code}</option>)}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm">Location</label>
        <select value={availabilityLocation || ""} onChange={(e) => dispatch(setAvailabilityLocation(e.target.value))} className="border rounded px-2 py-1">
          <option value="">All locations</option>
          {locations.map((loc: any) => <option key={loc.resource.id} value={loc.resource.id}>{loc.resource.name}</option>)}
        </select>
      </div>
      <div className="flex items-end">
        <button
          onClick={() => {
            if (availabilityType && availabilityStart && availabilityEnd) {
              dispatch(fetchAvailabilityByType({ appointmentType: availabilityType, start: availabilityStart, end: availabilityEnd, locationId: availabilityLocation }));
            }
          }}
          className="bg-black text-white px-3 py-2 rounded"
        >
          Check
        </button>
      </div>
    </div>
  );
}
