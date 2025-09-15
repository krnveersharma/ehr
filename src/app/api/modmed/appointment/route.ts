import { NextRequest, NextResponse } from "next/server";
import { createAppointment, searchAppointments} from "@/lib/appointment";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || undefined;
  const practitionerId = searchParams.get("practitionerId") || undefined;
  const patientId = searchParams.get("patientId") || undefined;
  const status = searchParams.get("status") || undefined;
  const count = searchParams.get("_count") ? Number(searchParams.get("_count")) : undefined;
  try {
    const bundle = await searchAppointments({ date, practitionerId, patientId, status, count });
    return NextResponse.json(bundle);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await createAppointment(body);
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 