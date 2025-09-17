"use client";
import React, { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchPatients, setListFilters } from "@/lib/slices/patientsSlice";

export default function PatientList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { bundle, loading, error, filters } = useAppSelector((s) => s.patients.list as any);

  useEffect(() => {
    const count = Number(searchParams.get("count") || 10);
    const pageUrl = searchParams.get("pageUrl") || undefined;
    const name = searchParams.get("name") || undefined;
    const id = searchParams.get("id") || undefined;
    const birthDate = searchParams.get("birthdate") || undefined;
    dispatch(setListFilters({ count, pageUrl, name, id, birthDate }));
  }, [searchParams, dispatch]);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch, filters]);

  const entries = bundle?.entry || [];

  const nextLink = useMemo(() => bundle?.link?.find((l: any) => l.relation === "next")?.url, [bundle]);
  const prevLink = useMemo(() => bundle?.link?.find((l: any) => l.relation === "previous")?.url, [bundle]);

  function setFilters(next: Record<string, string | number | undefined>) {
    const sp = new URLSearchParams();
    sp.set("count", String(next.count ?? filters.count));
    if (next.name ?? filters.name) sp.set("name", String(next.name ?? filters.name));
    if (next.id ?? filters.id) sp.set("id", String(next.id ?? filters.id));
    if (next.birthdate ?? filters.birthDate) sp.set("birthdate", String(next.birthdate ?? filters.birthDate));
    if (next.pageUrl) sp.set("pageUrl", String(next.pageUrl));
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
            value={filters.count}
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
          <label className="text-sm">ID</label>
          <input name="id" defaultValue={filters.id || ""} className="border rounded px-2 py-1" placeholder="FHIR Patient id" />
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