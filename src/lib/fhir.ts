import { MODMED_CONFIG, getFhirBase } from "./config";

let cachedAccessToken: string | null = null;
let cachedTokenExpiryEpochSec: number | null = null;

async function fetchAccessToken(): Promise<string> {
  const tokenUrl = `${MODMED_CONFIG.baseUrl}/${MODMED_CONFIG.firmUrlPrefix}/ema/ws/oauth2/grant`;
  const params = new URLSearchParams({ grant_type: "password", username: MODMED_CONFIG.username||"", password: MODMED_CONFIG.password||"" });
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "x-api-key": MODMED_CONFIG.apiKey||"" },
    body: params,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Token Request Failed: ${text}`);
  }
  const data = JSON.parse(text);
  const expiresIn = Number(data.expires_in || 1800);
  cachedAccessToken = data.access_token;
  cachedTokenExpiryEpochSec = Math.floor(Date.now() / 1000) + Math.max(60, Math.min(expiresIn - 60, expiresIn));
  return cachedAccessToken!;
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedTokenExpiryEpochSec && cachedTokenExpiryEpochSec - now > 60) {
    return cachedAccessToken;
  }
  return fetchAccessToken();
}

export async function fhirFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const url = path.startsWith("http") ? path : `${getFhirBase()}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("x-api-key", MODMED_CONFIG.apiKey||"");
  if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");
  return fetch(url, { ...init, headers });
}

export async function fhirS3Fetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const url = path.startsWith("http") ? path : `${getFhirBase()}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("x-api-key", MODMED_CONFIG.apiKey||"");
  if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/pdf");
  return fetch(url, { ...init, headers });
}

export async function searchPatients(params: { name?: string; id?: string; identifier?: string; birthDate?: string; count?: number; pageUrl?: string }): Promise<any> {
  if (params.pageUrl) {
    const res = await fhirFetch(params.pageUrl);
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return JSON.parse(text);
  }
  if (params.id) {
    const res = await fhirFetch(`/Patient/${params.id}`);
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    const patient = JSON.parse(text);
    return { resourceType: "Bundle", entry: [{ resource: patient }] };
  }
  const query = new URLSearchParams();
  if (params.name) query.set("name", params.name);
  if (params.identifier) query.set("identifier", params.identifier);
  if (params.birthDate) query.set("birthdate", params.birthDate);
  const res = await fhirFetch(`/Patient?${query.toString()}`);
  const text = await res.text();
  console.log("fech result is: ",res)
  if (!res.ok) throw new Error(text);
  return JSON.parse(text);
}

export async function getPatientDetails(id: string): Promise<{
  patient: any;
  conditions: any[];
  allergies: any[];
  medications: any[];
}> {
  const [patientRes, conditionsRes, allergiesRes, medsRes] = await Promise.all([
    fhirFetch(`/Patient/${id}`),
    fhirFetch(`/Condition?patient=${id}`),
    fhirFetch(`/AllergyIntolerance?patient=${id}`),
    fhirFetch(`/MedicationStatement?patient=${id}`),
  ]);

  if (![patientRes, conditionsRes, allergiesRes, medsRes].every((r) => r.ok)) {
    const texts = await Promise.all([patientRes, conditionsRes, allergiesRes, medsRes]
      .filter(Boolean)
      .map((r) => r.text()));
    throw new Error(texts.join(" | "));
  }

  const [patient, conditions, allergies, medications] = await Promise.all([
    patientRes.json(),
    conditionsRes.json(),
    allergiesRes.json(),
    medsRes.json(),
  ]);
  return {
    patient,
    conditions: conditions.entry || [],
    allergies: allergies.entry || [],
    medications: medications.entry || [],
  };
}

export async function updatePatientDemographics(id: string, updates: any): Promise<any> {
  const putRes = await fhirFetch(`/Patient/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/fhir+json" },
    body: JSON.stringify({ resourceType: "Patient", id, ...updates }),
  });

  if (!putRes.ok) {
    const errorText = await putRes.text();
    throw new Error(errorText);
  }

  try {
    const contentType = putRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await putRes.json();
    } else {
      return {
        status: putRes.status,
        statusText: putRes.statusText,
        message: "Update successful; no content returned",
        location: putRes.headers.get('content-location'),
      };
    }
  } catch {
    return {
      status: putRes.status,
      statusText: putRes.statusText,
      message: "Update successful; response body not JSON",
      location: putRes.headers.get('content-location'),
    };
  }
}

export async function upsertAllergy(patientId: string, allergy: any): Promise<any> {
  if (allergy.id) {
    const res = await fhirFetch(`/AllergyIntolerance/${allergy.id}`, { method: "PUT", body: JSON.stringify(allergy) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  const newResource = { resourceType: "AllergyIntolerance", patient: { reference: `Patient/${patientId}` }, ...allergy };
  const res = await fhirFetch(`/AllergyIntolerance`, { method: "POST", body: JSON.stringify(newResource) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function upsertCondition(patientId: string, condition: any): Promise<any> {
  if (condition.id) {
    const res = await fhirFetch(`/Condition/${condition.id}`, { method: "PUT", body: JSON.stringify(condition) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  const newResource = { resourceType: "Condition", subject: { reference: `Patient/${patientId}` }, ...condition };
  const res = await fhirFetch(`/Condition`, { method: "POST", body: JSON.stringify(newResource) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 