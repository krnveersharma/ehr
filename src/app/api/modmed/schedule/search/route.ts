import { NextRequest, NextResponse } from "next/server";
import { searchSchedules } from "@/lib/appointment";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const actor = searchParams.get("actor") || undefined;
  const date = searchParams.get("date") || undefined;
  const count = searchParams.get("_count") ? Number(searchParams.get("_count")) : undefined;
  try {
    const bundle = await searchSchedules({ actor, date, count });
    return NextResponse.json(bundle);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 