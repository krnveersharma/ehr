"use client";
import React, { useMemo, useState } from "react";

type PatientBundle = {
  patient: any;
  conditions: any[];
  allergies: any[];
  medications: any[];
  immunizations: any[];
};

export default function PatientDetails({ data, onRefresh, patientId }: { data: PatientBundle; onRefresh: () => void; patientId: string; }) {
  const [tab, setTab] = useState("demo");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fullName = useMemo(() => {
    const n = data.patient?.name?.[0];
    return `${(n?.given || []).join(" ")} ${n?.family || ""}`.trim();
  }, [data.patient]);

  async function saveDemographics(updates: any) {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/modmed/patient/${patientId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to update");
      onRefresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{fullName || "Patient"}</h1>
        <p className="text-gray-600">DOB: {data.patient?.birthDate} • Gender: {data.patient?.gender}</p>
      </div>

      <div className="border-b">
        <nav className="flex gap-4 text-sm">
          {[
            ["demo", "Demographics"],
            ["cond", "Conditions"],
            ["alg", "Allergies"],
            ["med", "Medications"],
          ].map(([key, label]) => (
            <button key={key} className={`px-2 py-2 ${tab === key ? "border-b-2 border-black" : "text-gray-600"}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </nav>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {tab === "demo" && (
        <DemographicsForm patient={data.patient} onSave={saveDemographics} saving={saving} />
      )}

      {tab === "cond" && (
        <ul className="list-disc pl-6">
          {data.conditions.map((c) => (
            <li key={c.resource.id}>{c.resource.code?.text || "Unnamed Condition"}</li>
          ))}
          {!data.conditions.length && <li className="text-gray-500 list-none">No recorded conditions</li>}
        </ul>
      )}

      {tab === "alg" && (
        <ul className="list-disc pl-6">
          {data.allergies.map((a) => (
            <li key={a.resource.id}>{a.resource.code?.text || "Unnamed Allergy"}</li>
          ))}
          {!data.allergies.length && <li className="text-gray-500 list-none">No recorded allergies</li>}
        </ul>
      )}

      {tab === "med" && (
        <ul className="list-disc pl-6">
          {data.medications.map((m) => (
            <li key={m.resource.id}>{m.resource.medicationCodeableConcept?.text || "Medication"}</li>
          ))}
          {!data.medications.length && <li className="text-gray-500 list-none">No medications</li>}
        </ul>
      )}

      {tab === "imm" && (
        <ul className="list-disc pl-6">
          {data.immunizations.map((im) => (
            <li key={im.resource.id}>{im.resource.vaccineCode?.text || "Immunization"}</li>
          ))}
          {!data.immunizations.length && <li className="text-gray-500 list-none">No immunizations</li>}
        </ul>
      )}
    </div>
  );
}

function DemographicsForm({ patient, onSave, saving }: { patient: any; onSave: (updates: any) => void; saving: boolean; }) {
  const [phone, setPhone] = useState(patient?.telecom?.find((t: any) => t.system === "phone")?.value || "");
  const [email, setEmail] = useState(patient?.telecom?.find((t: any) => t.system === "email")?.value || "");
  const [address, setAddress] = useState<string>(patient?.address?.[0]?.line?.[0] || "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updates: any = {};
    if (phone || email) {
      const telecom: any[] = [];
      if (phone) telecom.push({ system: "phone", value: phone });
      if (email) telecom.push({ system: "email", value: email });
      updates.telecom = telecom;
    }
    if (address) {
      updates.address = [{ line: [address], city: patient?.address?.[0]?.city, state: patient?.address?.[0]?.state, postalCode: patient?.address?.[0]?.postalCode }];
    }
    onSave(updates);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-lg">
      <div>
        <label className="text-sm">Phone</label>
        <input className="border rounded px-2 py-1 w-full" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="text-sm">Email</label>
        <input className="border rounded px-2 py-1 w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="text-sm">Address</label>
        <input className="border rounded px-2 py-1 w-full" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <button type="submit" disabled={saving} className="bg-black text-white px-3 py-2 rounded">
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
} 