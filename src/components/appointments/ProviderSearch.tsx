"use client";
import React from "react";

export default function ProviderSearch({
  label = "Provider",
  providerQuery,
  setProviderQuery,
  providers,
  onSelect,
  onAddClick,
}: {
  label?: string;
  providerQuery: string;
  setProviderQuery: (v: string) => void;
  providers: any[];
  onSelect: (provider: any) => void;
  onAddClick: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <label className="text-sm">{label}</label>
        <button className="text-sm underline" onClick={onAddClick}>+ Add provider</button>
      </div>
      <input
        value={providerQuery}
        onChange={(e) => setProviderQuery(e.target.value)}
        className="border rounded px-2 py-1"
        placeholder="Search provider by name"
      />
      {!!providers.length && (
        <div className="border rounded bg-white max-h-48 overflow-auto">
          {providers.map((p) => (
            <button
              key={p.id}
              className="block w-full text-left px-2 py-1 hover:bg-gray-50"
              onClick={() => onSelect(p)}
            >
              {(p.name?.[0]?.given?.join(" ") || "")} {p.name?.[0]?.family || ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 