import { fhirFetch } from "@/lib/fhir";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resource = await req.json();

    const updated = await fhirFetch(`Appointment/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(resource),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("Failed to update appointment:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}