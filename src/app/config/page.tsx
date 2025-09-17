"use client";
import { useState, useEffect } from "react";
import { useModMedConfig } from "@/lib/configContext";
import { MODMED_CONFIG } from "@/lib/config";

export default function ConfigPage() {
  const { config, setConfig } = useModMedConfig();

  const [form, setForm] = useState({
    baseUrl: "",
    firmUrlPrefix: "",
    apiKey: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    // Simulate fetching from localStorage
    const savedConfig = localStorage.getItem("modmed_config");
    if (savedConfig) {
      setForm(JSON.parse(savedConfig));
    } else {
      setForm(MODMED_CONFIG);
    }
    setLoading(false); // Set loading to false once config is ready
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfig(form);
    localStorage.setItem("modmed_config", JSON.stringify(form));
    alert("Saved API credentials");
  }

  if (loading) {
    // Render nothing or a spinner until config is loaded
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">ModMed API Credentials</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(form).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm mb-1 capitalize">{key}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="border rounded px-2 py-1 w-full"
              required
            />
          </div>
        ))}
        <button className="bg-black text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
