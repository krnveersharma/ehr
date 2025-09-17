"use client";
import { useState } from "react";
import { useModMedConfig } from "@/lib/configContext";

export default function ConfigPage() {
  const { config, setConfig, switchEnv } = useModMedConfig();
  const [env, setEnv] = useState<"dev" | "prod">(config.environment);

  const current = config[env] || {
    baseUrl: "",
    firmUrlPrefix: "",
    apiKey: "",
    username: "",
    password: "",
  };

  const [form, setForm] = useState(current);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfig(env, form);
    alert(`Saved ${env.toUpperCase()} credentials`);
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">ModMed API Credentials</h1>


      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(form).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm mb-1">{key}</label>
            <input
              value={value}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="border rounded px-2 py-1 w-full"
              required
            />
          </div>
        ))}
        <button className="bg-black text-white px-4 py-2 rounded">Save {env.toUpperCase()}</button>
      </form>
    </div>
  );
}
