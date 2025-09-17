import { fhirFetch } from "@/lib/fhir";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } =await context.params;
    const resource = await req.json();

    const updated = await fhirFetch(`Appointment/${id}`, {
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