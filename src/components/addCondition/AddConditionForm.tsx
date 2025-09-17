'use client'
import { useState } from "react";

interface ConditionFormData {
  patientId: string;
  clinicalStatus: string;
  categoryCode: string;
  categoryDisplay: string;
  diagnosisCode: string;
  diagnosisDisplay: string;
  onsetDateTime: string;
  recordedDate: string;
}

const conditionCodes = [
  { code: "ACTIVE", display: "Active" },
  { code: "INACTIVE", display: "Inactive" },
  { code: "RESOLVED", display: "Resolved" },
];

const conditionCategories = [
  { code: "DIAGNOSIS", display: "Diagnosis" },
  { code: "PROBLEM", display: "Problem" },
  { code: "SYMPTOM", display: "Symptom" },
];

export default function AddConditionForm({patientId}:{patientId:string}) {
  const [formData, setFormData] = useState<ConditionFormData>({
    patientId: patientId,
    clinicalStatus: "ACTIVE",
    categoryCode: "DIAGNOSIS",
    categoryDisplay: "Diagnosis",
    diagnosisCode: "",
    diagnosisDisplay: "",
    onsetDateTime: "",
    recordedDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const selectedCategory = conditionCategories.find(c => c.code === formData.categoryCode);
    if (selectedCategory) {
      formData.categoryDisplay = selectedCategory.display;
    }

    const selectedStatus = conditionCodes.find(c => c.code === formData.clinicalStatus);
    if (selectedStatus) {
      formData.clinicalStatus = selectedStatus.code;
    }

    try {
      const res = await fetch("/api/modmed/addCondition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Add Condition</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1">Condition Code (Clinical Status)</label>
          <select
            name="clinicalStatus"
            value={formData.clinicalStatus}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            {conditionCodes.map(c => (
              <option key={c.code} value={c.code}>{c.display}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Condition Category</label>
          <select
            name="categoryCode"
            value={formData.categoryCode}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            {conditionCategories.map(c => (
              <option key={c.code} value={c.code}>{c.display}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Diagnosis Code (ICD10)</label>
          <input
            type="text"
            name="diagnosisCode"
            value={formData.diagnosisCode}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="e.g. F41.9"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Diagnosis Display Name</label>
          <input
            type="text"
            name="diagnosisDisplay"
            value={formData.diagnosisDisplay}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="e.g. Anxiety Disorder, Unspecified"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Onset Date</label>
          <input
            type="datetime-local"
            name="onsetDateTime"
            value={formData.onsetDateTime}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Recorded Date</label>
          <input
            type="datetime-local"
            name="recordedDate"
            value={formData.recordedDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Add Condition"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
