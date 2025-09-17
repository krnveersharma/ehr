"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ModMedConfig = {
  baseUrl: string;
  firmUrlPrefix: string;
  apiKey: string;
  username: string;
  password: string;
};

const ConfigContext = createContext<{
  config: ModMedConfig | null;
  setConfig: (cfg: ModMedConfig) => void;
}>({
  config: null,
  setConfig: () => {},
});

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<ModMedConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("modmed_config");
    if (saved) setConfigState(JSON.parse(saved));
  }, []);

  function setConfig(cfg: ModMedConfig) {
    localStorage.setItem("modmed_config", JSON.stringify(cfg));
    setConfigState(cfg);
  }

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useModMedConfig() {
  return useContext(ConfigContext);
}
