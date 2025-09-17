"use server"
import { ModMedConfig } from "./configContext";
import { cookies } from "next/headers";

const ENV_FALLBACK: ModMedConfig = {
  baseUrl: process.env.NEXT_PUBLIC_MODMED_BASE_URL || "",
  firmUrlPrefix: process.env.NEXT_PUBLIC_MODMED_FIRM_PREFIX || "",
  apiKey: process.env.NEXT_PUBLIC_MODMED_API_KEY || "",
  username: process.env.NEXT_PUBLIC_MODMED_USERNAME || "",
  password: process.env.NEXT_PUBLIC_MODMED_PASSWORD || "",
};


export async function getActiveConfig(): Promise<ModMedConfig> {
  if (typeof window === "undefined") {
    const cookieStore = await cookies(); 
    const raw = cookieStore.get("modmed_config")?.value;
    if (!raw) return ENV_FALLBACK;

    try {
      return JSON.parse(raw);
    } catch {
      return ENV_FALLBACK;
    }
  } else {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("modmed_config="))
      ?.split("=")[1];

    if (!raw) return ENV_FALLBACK;

    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return ENV_FALLBACK;
    }
  }
}

export async function MODMED_CONFIG(): Promise<ModMedConfig> {
  return getActiveConfig();
}

export async function getFhirBase(): Promise<string> {
  const cfg = await MODMED_CONFIG();
  return `${cfg.baseUrl}/${cfg.firmUrlPrefix}/ema/fhir/v2`;
}

export async function getFhir(): Promise<string> {
  const cfg = await MODMED_CONFIG();
  return `${cfg.baseUrl}/${cfg.firmUrlPrefix}/ema/fhir/v2`;
}