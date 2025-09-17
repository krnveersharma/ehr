import { NextRequest, NextResponse } from "next/server";
import { fhirFetch } from "@/lib/fhir";
import { getFhirBase, MODMED_CONFIG } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    if (!patientId) return NextResponse.json({ success: false, error: "Missing patientId" }, { status: 400 });

    const resp = await fhirFetch(`/MedicationStatement/1254`, {
      method: "GET",
      headers: { Accept: "application/fhir+json" },
    });
    const data = await resp.json();

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, medicationCode, medicationText, startDate } = body;

    if (!patientId || !medicationCode || !medicationText) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const payload = {
      resourceType: "MedicationStatement",
      status: "active",
      medicationCodeableConcept: {
        coding: [
          {
            system: "RxNorm",
            code: medicationCode,
            display: medicationText,
          },
        ],
        text: medicationText,
      },
      subject: { 
        reference: `${MODMED_CONFIG.baseUrl}/${MODMED_CONFIG.firmUrlPrefix}/Patient/${patientId}` ,
        display: `${getFhirBase()}/Patient/${patientId}` ,
    },
      // effectivePeriod: { start: startDate || new Date().toISOString() },
    };

    const resp = await fhirFetch(`/MedicationStatement`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (resp.status == 201) {
      console.log('resp is: ',resp,"request is: ",payload)
      return NextResponse.json({ success: true });
    }
        return NextResponse.json({ success: false, error: {} }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
