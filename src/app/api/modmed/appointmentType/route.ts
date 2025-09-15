import { fhirFetch } from "@/lib/fhir";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const res = await fhirFetch(`/ValueSet/appointment-type`);
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return NextResponse.json(JSON.parse(text));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
