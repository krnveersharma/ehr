import { NextRequest, NextResponse } from "next/server";
import { searchSlots } from "@/lib/appointment";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const schedule = searchParams.get("schedule") || undefined;
  const start = searchParams.get("start") || undefined;
  const end = searchParams.get("end") || undefined;
  const status = searchParams.get("status") || undefined;
  const count = searchParams.get("_count") ? Number(searchParams.get("_count")) : undefined;
  try {
    const bundle = await searchSlots({ schedule, start, end, status, count });
    return NextResponse.json(bundle);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 