"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PatientListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bundle, setBundle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const count = Number(searchParams.get("count") || 10);
  const pageUrl = searchParams.get("pageUrl") || undefined;
  const name = searchParams.get("name") || "";
  const id = searchParams.get("id") || "";
  const birthDate = searchParams.get("birthdate") || "";

  useEffect(() => {
    setLoading(true);
    setError(null);
    const body: any = { count, pageUrl };
    if (name) body.name = name;
    if (id) body.id = id;
    if (birthDate) body.birthDate = birthDate;

    fetch(`/api/modmed/patient`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Failed to load patients");
        setBundle(json);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [count, pageUrl, name, id, birthDate]);

  const entries = bundle?.entry || [];

  const nextLink = useMemo(() => bundle?.link?.find((l: any) => l.relation === "next")?.url, [bundle]);
  const prevLink = useMemo(() => bundle?.link?.find((l: any) => l.relation === "previous")?.url, [bundle]);

  function setFilters(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    sp.set("count", String(next.count || count));
    if (next.name ?? name) sp.set("name", (next.name ?? name)!);
    if (next.id ?? id) sp.set("id", (next.id ?? id)!);
    if (next.birthdate ?? birthDate) sp.set("birthdate", (next.birthdate ?? birthDate)!);
    if (next.pageUrl) sp.set("pageUrl", next.pageUrl);
    router.push(`/patient?${sp.toString()}`);
  }

  function goTo(url?: string | null) {
    if (!url) return;
    setFilters({ pageUrl: url });
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm">Page size</label>
          <select
            value={count}
            onChange={(e) => setFilters({ count: e.target.value })}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const fd = new FormData(form);
          const nextName = String(fd.get("name") || "");
          const nextId = String(fd.get("id") || "");
          const nextBirth = String(fd.get("birthdate") || "");
          setFilters({ name: nextName || undefined, id: nextId || undefined, birthdate: nextBirth || undefined, pageUrl: undefined });
        }}
        className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3"
      >
        <div className="flex flex-col">
          <label className="text-sm">Name</label>
          <input name="name" defaultValue={name} className="border rounded px-2 py-1" placeholder="e.g. Smith" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">ID</label>
          <input name="id" defaultValue={id} className="border rounded px-2 py-1" placeholder="FHIR Patient id" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Birth date</label>
          <input type="date" name="birthdate" defaultValue={birthDate} className="border rounded px-2 py-1" />
        </div>
        <div className="flex items-end">
          <button type="submit" className="bg-black text-white px-3 py-2 rounded">Search</button>
        </div>
      </form>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">DOB</th>
              <th className="p-2 border">Gender</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={3}>Loading...</td></tr>
            ) : entries.length ? (
              entries.map((p: any) => (
                <tr
                  key={p.resource.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/patient/${p.resource.id}`)}
                >
                  <td className="p-2 border">{p.resource?.name?.[0]?.given?.join(" ")} {p.resource?.name?.[0]?.family}</td>
                  <td className="p-2 border">{p.resource?.birthDate}</td>
                  <td className="p-2 border">{p.resource?.gender}</td>
                </tr>
              ))
            ) : (
              <tr><td className="p-3 text-gray-500" colSpan={3}>No patients</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => goTo(prevLink)} disabled={!prevLink}>Previous</button>
        <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => goTo(nextLink)} disabled={!nextLink}>Next</button>
      </div>
    </div>
  );
} 