import { NextRequest, NextResponse } from "next/server";
import { cancelAppointment, updateAppointment } from "@/lib/appointment";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resource = await req.json();
    const updated = await updateAppointment(params.id, resource);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const cancelled = await cancelAppointment(params.id, body?.reason);
    return NextResponse.json(cancelled);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 