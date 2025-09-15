import { NextRequest, NextResponse } from "next/server";
import { getPatientDetails, updatePatientDemographics } from "@/lib/fhir";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const details = await getPatientDetails(params.id);
    return NextResponse.json(details);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  const { params } = context;
  const { id } = await params;  
  const updates = await req.json();

  try {
    const updated = await updatePatientDemographics(id, updates);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
