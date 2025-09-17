"use client";
import React, { useState, useEffect } from "react";

interface Props {
  encounterId: string;
  initialNotes?: string;
  onSave: (notes: string) => void;
}

export default function ClinicalNotesModal({ encounterId, initialNotes = "", onSave }: Props) {
  const [localNotes, setLocalNotes] = useState(initialNotes);

  useEffect(() => {
    setLocalNotes(initialNotes);
  }, [initialNotes, encounterId]);

  const handleSave = () => {
    onSave(localNotes);
  };

  return (
    <div className="bg-white w-full h-full rounded-lg shadow-lg p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-4">
        Take Notes - Encounter {encounterId}
      </h2>
      <textarea
        className="border w-full flex-1 p-2 rounded mb-4 resize-none"
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        placeholder="Enter clinical notes here..."
      />
      <div className="flex justify-end gap-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>

  );
}
