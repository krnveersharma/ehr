"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
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

  const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function loadConfig() {
    const savedConfig = Cookies.get("modmed_config");
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setForm(parsed);
    } else if (config) {
      setForm(config);
    } else {
      const cfg = await MODMED_CONFIG();
      setForm(cfg);
    }
    setLoading(false);
  }

  loadConfig();
}, [config]);


  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Save to cookie
    Cookies.set("modmed_config", JSON.stringify(form), { expires: 1 }); // 1 day
    // Update context
    setConfig(form);
    alert("Saved API credentials");
  }

  if (loading) {
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
