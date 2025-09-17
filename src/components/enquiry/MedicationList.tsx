"use client";
import React, { useEffect, useState } from "react";

interface Props {
  patientId: string;
}

export default function MedicationsModal({ patientId }: Props) {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMed, setNewMed] = useState({ code: "", text: "" });
  const [error, setError] = useState("");

  const fetchMeds = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/modmed/medications?patientId=${patientId}`);
      const result = await resp.json();
      if (result.success) setMedications(result.data.entry?.map((e:any) => e.resource) || []);
      else setError(result.error);
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = async () => {
    if (!newMed.code || !newMed.text) return setError("Enter code & name");
    setLoading(true);
    try {
      const resp = await fetch("/api/modmed/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          medicationCode: newMed.code,
          medicationText: newMed.text,
        }),
      });
      const result = await resp.json();
      if (result.success) {
        setNewMed({ code: "", text: "" });
        fetchMeds();
      } else setError(result.error);
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);


  return (
<div className="bg-white p-6 rounded shadow w-full max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Medications</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <ul className="mb-4">
          {medications.map((med) => (
            <li key={med.id}>
              {med.medicationCodeableConcept?.text} - <span className="font-semibold">{med.status}</span>
            </li>
          ))}
        </ul>

        <div className=" mb-4">
          <div>
          <input
            placeholder="Code (RxNorm)"
            value={newMed.code}
            onChange={(e) => setNewMed({ ...newMed, code: e.target.value })}
            className="border p-1 flex-1"
          />
          </div>
          <div>
          <input
            placeholder="Medication Name"
            value={newMed.text}
            onChange={(e) => setNewMed({ ...newMed, text: e.target.value })}
            className="border p-1 flex-1"
          />
          </div>
          <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={addMedication}>
            Add
          </button>
        </div>

      </div>
  );
}
