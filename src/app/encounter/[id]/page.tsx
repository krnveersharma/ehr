"use client";
import ClinicalNotesModal from "@/components/enquiry/ClinicalNotesModal";
import MedicationsModal from "@/components/enquiry/MedicationList";
import VitalSignsModal from "@/components/enquiry/VitalSignsModal";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Document {
  id: string;
  filename: string;
  url: string;
  date: string;
}

const EncounterOperations = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const encounterId = params.id as string;
  const patientId = searchParams.get("patientId");
  const practitionerId = searchParams.get("practitionerId");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    if (!patientId) return;

    const fetchDocuments = async () => {
      setLoadingDocs(true);
      try {
        const res = await fetch(`/api/modmed/encounter/lab-results?patientId=${patientId}`);
        const data = await res.json();
        if (data.documents) {
          const docs = data.documents.map((d: any) => ({
            id: d.resource.id,
            filename: d.resource.identifier?.[0]?.value || "Unknown",
            url: d.resource.content?.[0]?.attachment?.url || "#",
            date: d.resource.date || "",
          }));
          setDocuments(docs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDocuments();
  }, [patientId]);

  return (
    <>
      <div className="grid grid-cols-[70%_30%] w-screen h-[80vh] overflow-hidden">
        <div className="border-r overflow-y-auto min-w-0">
          <ClinicalNotesModal
            encounterId={encounterId}
            initialNotes=""
            onSave={async (localNotes) => {
              await fetch("/api/modmed/encounter/record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  encounterId,
                  patientId,
                  practitionerId,
                  summary: localNotes,
                  topic: "Note",
                }),
              });
            }}
          />
        </div>

        <div className="overflow-y-auto min-w-0">
          <div className="space-y-6 p-4">
            <VitalSignsModal
              encounterId={encounterId}
              onSave={async (vitals) => {
                await fetch("/api/modmed/encounter/record", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    encounterId,
                    patientId,
                    practitionerId,
                    summary: vitals,
                    topic: "Vitals",
                  }),
                });
              }}
            />
            <MedicationsModal patientId={patientId || ""} />
          </div>
        </div>
      </div>

      {/* Document list below the grid */}
      <div className="p-4 border-t">
        <h2 className="text-lg font-semibold mb-2">Patient Documents</h2>
        {loadingDocs ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="flex justify-between items-center border p-2 rounded">
                <span>{doc.filename}</span>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default EncounterOperations;
