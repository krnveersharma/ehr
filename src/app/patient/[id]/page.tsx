"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import PatientDetails from "@/components/PatientDetails";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchPatientDetails, setPatientTab, updatePatientDemographics } from "@/lib/slices/patientsSlice";

export default function PatientDetailsPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop()!;
  const dispatch = useAppDispatch();
  const details = useAppSelector((s) => s.patients.details[id] || { data: null, loading: true, error: null, tab: "demo", saving: false });

  useEffect(() => {
    if (id) dispatch(fetchPatientDetails(id));
  }, [id, dispatch]);

  if (details.loading) return <div className="p-4">Loading patient details...</div>;
  if (details.error) return <div className="p-4 text-red-600">{details.error}</div>;
  if (!details.data || !details.data.patient) return <div className="p-4">No patient found</div>;

  return (
    <div className="p-4">
      <PatientDetails
        data={details.data}
        onRefresh={() => dispatch(fetchPatientDetails(id))}
        patientId={id}
      />
    </div>
  );
}
