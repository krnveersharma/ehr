import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  setAvailabilityStart,
  setAvailabilityEnd,
  setAvailabilityType,
  setAvailabilityLocation,
  setAvailabilityPractitioner,
  fetchAvailabilityByType,
} from "@/lib/slices/appointmentsSlice";
import { useEffect } from "react";

export default function Filters() {
  const dispatch = useAppDispatch();
  const {
    availabilityStart,
    availabilityEnd,
    availabilityType,
    availabilityLocation,
    availabilityPractitioner,
    locations,
    types,
  } = useAppSelector((s) => s.appointments);

  useEffect(() => {
    const now = new Date();
    const startISO = now.toISOString().slice(0, 16);
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    const endISO = endOfDay.toISOString().slice(0, 16); 

    if (!availabilityStart) dispatch(setAvailabilityStart(startISO));
    if (!availabilityEnd) dispatch(setAvailabilityEnd(endISO));
  }, [dispatch, availabilityStart, availabilityEnd]);


  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
      <div className="flex flex-col">
        <label className="text-sm">
          Start <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={availabilityStart}
          onChange={(e) => dispatch(setAvailabilityStart(e.target.value))}
          className="border rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm">
          End <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={availabilityEnd}
          onChange={(e) => dispatch(setAvailabilityEnd(e.target.value))}
          className="border rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm">
          Type <span className="text-red-500">*</span>
        </label>
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
            <option key={loc.resource.id} value={loc.resource.id}>
              {loc.resource.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm">Practitioner</label>
        <input
          type="text"
          placeholder="Practitioner ID"
          value={availabilityPractitioner || ""}
          onChange={(e) =>
            dispatch(setAvailabilityPractitioner(e.target.value))
          }
          className="border rounded px-2 py-1"
        />
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
                  practitionerId: availabilityPractitioner || undefined,
                })
              );
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
