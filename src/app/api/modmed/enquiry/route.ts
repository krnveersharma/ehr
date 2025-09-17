import { fhirFetch } from "@/lib/fhir";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {
  try {
    const res = await fhirFetch(`/Encounter`);
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    const visits = data.entry?.map((e: any) => e.resource) || [];

    return NextResponse.json({ visits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
