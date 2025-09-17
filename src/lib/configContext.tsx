"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ModMedConfig = {
  baseUrl: string;
  firmUrlPrefix: string;
  apiKey: string;
  username: string;
  password: string;
};

type StoredConfig = {
  environment: "dev" | "prod";
  dev: ModMedConfig | null;
  prod: ModMedConfig | null;
};

const ConfigContext = createContext<{
  config: StoredConfig;
  setConfig: (env: "dev" | "prod", cfg: ModMedConfig) => void;
  switchEnv: (env: "dev" | "prod") => void;
}>({
  config: { environment: "dev", dev: null, prod: null },
  setConfig: () => {},
  switchEnv: () => {},
});

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<StoredConfig>({
    environment: "dev",
    dev: null,
    prod: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem("modmed_env_config");
    if (saved) setConfigState(JSON.parse(saved));
  }, []);

  function setConfig(env: "dev" | "prod", cfg: ModMedConfig) {
    const next = { ...config, [env]: cfg };
    localStorage.setItem("modmed_env_config", JSON.stringify(next));
    setConfigState(next);
  }

  function switchEnv(env: "dev" | "prod") {
    const next = { ...config, environment: env };
    localStorage.setItem("modmed_env_config", JSON.stringify(next));
    setConfigState(next);
  }

  return (
    <ConfigContext.Provider value={{ config, setConfig, switchEnv }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useModMedConfig() {
  return useContext(ConfigContext);
}
