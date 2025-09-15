"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientSearch() {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const params = new URLSearchParams();
      if (name) params.set("name", name);
      if (id) params.set("id", id);
      if (identifier) params.set("identifier", identifier);
      const res = await fetch(`/api/modmed/patient/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Search failed");
      setResults(data.entry || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={onSearch} className="flex gap-3 items-end flex-wrap">
        <div className="flex flex-col">
          <label className="text-sm">Name</label>
          <input className="border rounded px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smith" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">ID</label>
          <input className="border rounded px-2 py-1" value={id} onChange={(e) => setId(e.target.value)} placeholder="FHIR Patient id" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Identifier</label>
          <input className="border rounded px-2 py-1" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="MRN or other" />
        </div>
        <button type="submit" disabled={loading} className="bg-black text-white px-3 py-2 rounded">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div className="text-red-600 mt-2">{error}</div>}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">DOB</th>
              <th className="p-2 border">Gender</th>
            </tr>
          </thead>
          <tbody>
            {results.map((p: any) => (
              <tr key={p.resource.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/patient/${p.resource.id}`)}>
                <td className="p-2 border">{p.resource?.name?.[0]?.given?.join(" ")} {p.resource?.name?.[0]?.family}</td>
                <td className="p-2 border">{p.resource?.birthDate}</td>
                <td className="p-2 border">{p.resource?.gender}</td>
              </tr>
            ))}
            {!results.length && !loading && (
              <tr>
                <td className="p-2 border text-gray-500" colSpan={3}>No results</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 