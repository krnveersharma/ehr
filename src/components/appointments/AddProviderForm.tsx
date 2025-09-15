"use client";
import React, { useState } from "react";

export default function AddProviderForm({ onCreate, onClose }: { onCreate: (resource: any) => Promise<void> | void; onClose: () => void; }) {
  const [given, setGiven] = useState("");
  const [family, setFamily] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const resource: any = {
      resourceType: "Practitioner",
      name: [ { given: given ? given.split(" ") : undefined, family: family || undefined } ],
    };
    const telecom: any[] = [];
    if (phone) telecom.push({ system: "phone", value: phone });
    if (email) telecom.push({ system: "email", value: email });
    if (telecom.length) resource.telecom = telecom;
    await onCreate(resource);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="flex flex-col">
          <label className="text-sm">Given name(s)</label>
          <input className="border rounded px-2 py-1" value={given} onChange={(e) => setGiven(e.target.value)} placeholder="e.g. John A" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Family name</label>
          <input className="border rounded px-2 py-1" value={family} onChange={(e) => setFamily(e.target.value)} placeholder="e.g. Smith" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Phone</label>
          <input className="border rounded px-2 py-1" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Email</label>
          <input className="border rounded px-2 py-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" className="bg-black text-white px-3 py-2 rounded">Create</button>
        <button type="button" className="px-3 py-2 border rounded" onClick={onClose}>Close</button>
      </div>
    </form>
  );
} 