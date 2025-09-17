"use client";
import React, { useState, useEffect } from "react";

interface Props {
  encounterId: string;
  onSave: (vitals: Record<string, any>) => void;
}

export default function VitalSignsModal({
  encounterId,
  onSave,
}: Props) {
  const [vitals, setVitals] = useState({
    heartRate: "",
    systolicBP: "",
    diastolicBP: "",
    respiratoryRate: "",
    temperature: "",
    oxygenSaturation: "",
  });


  const handleChange = (field: string, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(vitals);
  };


  return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Record Vital Signs - Encounter {encounterId}</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <label className="flex-1">Heart Rate (bpm)
              <input
                type="number"
                className="border w-full p-1 rounded"
                value={vitals.heartRate}
                onChange={(e) => handleChange("heartRate", e.target.value)}
              />
            </label>
            <label className="flex-1">Respiratory Rate
              <input
                type="number"
                className="border w-full p-1 rounded"
                value={vitals.respiratoryRate}
                onChange={(e) => handleChange("respiratoryRate", e.target.value)}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <label className="flex-1">Systolic BP
              <input
                type="number"
                className="border w-full p-1 rounded"
                value={vitals.systolicBP}
                onChange={(e) => handleChange("systolicBP", e.target.value)}
              />
            </label>
            <label className="flex-1">Diastolic BP
              <input
                type="number"
                className="border w-full p-1 rounded"
                value={vitals.diastolicBP}
                onChange={(e) => handleChange("diastolicBP", e.target.value)}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <label className="flex-1">Temperature (°C)
              <input
                type="number"
                className="border w-full p-1 rounded"
                value={vitals.temperature}
                onChange={(e) => handleChange("temperature", e.target.value)}
              />
            </label>
            <label className="flex-1">Oxygen Saturation (%)
              <input
                type="number"
                className="border w-full p-1 rounded"
                value={vitals.oxygenSaturation}
                onChange={(e) => handleChange("oxygenSaturation", e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
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
