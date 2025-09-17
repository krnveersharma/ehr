export type ModMedConfig = {
  baseUrl: string;
  firmUrlPrefix: string;
  apiKey: string;
  username: string;
  password: string;
};

const ENV_FALLBACK: ModMedConfig = {
  baseUrl: process.env.NEXT_PUBLIC_MODMED_BASE_URL || "",
  firmUrlPrefix: process.env.NEXT_PUBLIC_MODMED_FIRM_PREFIX || "",
  apiKey: process.env.NEXT_PUBLIC_MODMED_API_KEY || "",
  username: process.env.NEXT_PUBLIC_MODMED_USERNAME || "",
  password: process.env.NEXT_PUBLIC_MODMED_PASSWORD || "",
};

export function getActiveConfig(): ModMedConfig {
  if (typeof window === "undefined") return ENV_FALLBACK;

  const raw = localStorage.getItem("modmed_env_config");
  if (!raw) return ENV_FALLBACK;

  const parsed = JSON.parse(raw);
  const env = parsed.environment || "dev";
  return parsed[env] || ENV_FALLBACK;
}

export const MODMED_CONFIG = {
  baseUrl: getActiveConfig().baseUrl,
  firmUrlPrefix: getActiveConfig().firmUrlPrefix,
  apiKey: getActiveConfig().apiKey,
  username: getActiveConfig().username,
  password: getActiveConfig().password ,
} as const;

export function getFhirBase(): string {
  const cfg = getActiveConfig();
  return `${cfg.baseUrl}/${cfg.firmUrlPrefix}/ema/fhir/v2`;
}
