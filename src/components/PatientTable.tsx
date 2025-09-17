"use client";
import { fhirFetch } from "@/lib/fhir";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function PatientTable() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fhirFetch("/api/modmed/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setPatients([]);
      } else {
        setPatients(data.entry || []);
      }
    } catch (err) {
      setError("Failed to fetch patients");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };


  const handleRowClick = (id: string) => (event: React.MouseEvent<HTMLTableRowElement>): void => {
    event.preventDefault();
    router.push(`/patient/${id}`);
  };
  return (
    <div>
      <button onClick={fetchPatients} disabled={loading}>
        {loading ? "Loading..." : "Fetch Patients"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>DOB</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p: any) => (
            <tr key={p.resource.id} onClick={handleRowClick(p.resource.id)}>
              <td>
                {p.resource?.name?.[0]?.given?.join(" ")} {p.resource?.name?.[0]?.family}
              </td>
              <td>{p.resource?.birthDate}</td>
              <td>{p.resource?.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
