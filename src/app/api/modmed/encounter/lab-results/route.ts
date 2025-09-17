import { fhirFetch } from "@/lib/fhir";
import { NextRequest, NextResponse } from "next/server";
const allowedCodes = ["18512", "18504", "18503"];
export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  }

  try {
    const response = await fhirFetch(`/DocumentReference?patient=${patientId}`);

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: text }, { status: response.status });
    }

    const data = await response.json();

    
    const filtered = (data.entry || []).filter((e: any) =>
      e.resource.category?.some((c: any) =>
        c.coding?.some((codeObj: any) => allowedCodes.includes(codeObj.code))
      )
    );

    return NextResponse.json({ total: filtered.length, documents: filtered });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
