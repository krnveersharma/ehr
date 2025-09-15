export const MODMED_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_MODMED_BASE_URL,
  firmUrlPrefix: process.env.NEXT_PUBLIC_MODMED_FIRM_PREFIX,
  apiKey: process.env.NEXT_PUBLIC_MODMED_API_KEY,
  username: process.env.NEXT_PUBLIC_MODMED_USERNAME,
  password: process.env.NEXT_PUBLIC_MODMED_PASSWORD ,
} as const;

export function getFhirBase(): string {
  return `${MODMED_CONFIG.baseUrl}/${MODMED_CONFIG.firmUrlPrefix}/ema/fhir/v2`;
} 