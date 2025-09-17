"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { fetchUpcomingVisits } from "@/lib/slices/encounterSlice";
import { formatReadableDateTime } from "../utils/humanReadableDate";
import { useRouter } from "next/navigation";

export default function EncounterPage() {
    const dispatch = useAppDispatch();
    const { upcomingVisits, loading, selectedEncounter } = useAppSelector((state: any) => state.encounter);
    const router = useRouter()


    useEffect(() => {
        dispatch(fetchUpcomingVisits());
    }, [dispatch]);
    const handleClick = (visit: any) => {
        const practitionerId=visit.participant?.[0]?.individual.reference.split("/").pop()
        const patientId = visit.subject.reference.split("/").pop()
        router.push(`/encounter/${visit.id}?patientId=${patientId}&practitionerId=${practitionerId}`)
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Encounters</h1>

            <div className="overflow-x-auto">
                <h2 className="text-xl font-semibold mt-4 mb-2">Upcoming Visits</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border">Encounter ID</th>
                                <th className="px-4 py-2 border">Patient</th>
                                <th className="px-4 py-2 border">Practitioner</th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border">Class</th>
                                <th className="px-4 py-2 border">Type</th>
                                <th className="px-4 py-2 border">Start</th>
                                <th className="px-4 py-2 border">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingVisits?.map((visit: any) => (
                                <tr key={visit.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleClick(visit)}>
                                    <td className="px-4 py-2 border">{visit.id}</td>
                                    <td className="px-4 py-2 border">{visit.subject?.display || "Unknown"}</td>
                                    <td className="px-4 py-2 border">
                                        {visit.participant?.map((p: any) => p.individual?.display).join(", ") || "Unknown"}
                                    </td>
                                    <td className="px-4 py-2 border">{visit.status}</td>
                                    <td className="px-4 py-2 border">{visit.class?.display || "-"}</td>
                                    <td className="px-4 py-2 border">
                                        {visit.type?.map((t: any) => t.coding?.map((c: any) => c.display).join(", ")).join(", ") || "-"}
                                    </td>
                                    <td className="px-4 py-2 border">{formatReadableDateTime(visit.period?.start)}</td>
                                    <td className="px-4 py-2 border">{formatReadableDateTime(visit.meta?.lastUpdated)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
