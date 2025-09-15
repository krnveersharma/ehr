import { NextRequest, NextResponse } from "next/server";
import { fhirFetch } from "@/lib/fhir";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const appointmentType = searchParams.get("appointmentType");
  let start = searchParams.get("start");
  let end = searchParams.get("end");
  const count = searchParams.get("_count") ? Number(searchParams.get("_count")) : 50;

  if (!appointmentType) return NextResponse.json({ error: "Missing appointmentType" }, { status: 400 });
  if (!start || !end) return NextResponse.json({ error: "Missing start or end" }, { status: 400 });

  try {
    let ge = new Date(start).toISOString();
    let le = new Date(end).toISOString();

    if (new Date(ge) > new Date(le)) {
      [ge, le] = [le, ge];
    }

    const qs = new URLSearchParams();
    qs.set("appointment-type", appointmentType);
    qs.append("date", `ge${ge}`);
    qs.append("date", `le${le}`);
    qs.set("_count", String(Math.min(100, count)));

    const res = await fhirFetch(`/Slot?${qs.toString()}`);
    const text = await res.text();
    if (!res.ok) throw new Error(text);

    return NextResponse.json(JSON.parse(text));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
