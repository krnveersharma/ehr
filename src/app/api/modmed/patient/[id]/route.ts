import { NextRequest, NextResponse } from "next/server";
import { getPatientDetails, updatePatientDemographics } from "@/lib/fhir";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const details = await getPatientDetails(id);
    return NextResponse.json({ success: true, data: details });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const updates = await req.json();
    const updated = await updatePatientDemographics(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
