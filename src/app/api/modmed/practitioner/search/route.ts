import { NextRequest, NextResponse } from "next/server";
import { searchPractitioners } from "@/lib/appointment";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const family = searchParams.get("family") || undefined;
  const given = searchParams.get("given") || undefined;
  const id = searchParams.get("id") || undefined;
  const count = searchParams.has("_count") ? Number(searchParams.get("_count")) : undefined;

  try {
    const bundle = await searchPractitioners({ family, given, id, _count: count });
    return NextResponse.json(bundle);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
