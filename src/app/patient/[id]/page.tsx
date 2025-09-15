"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import PatientDetails from "@/components/PatientDetails";

export default function PatientDetailsPage() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/modmed/patient/${id}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Failed to load");
        setData(json);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="p-4">Loading patient details...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data || !data.patient) return <div className="p-4">No patient found</div>;

  return (
    <div className="p-4">
      <PatientDetails data={data} onRefresh={load} patientId={id!} />
    </div>
  );
}
