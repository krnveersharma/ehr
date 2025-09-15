import { NextRequest, NextResponse } from "next/server";
import { fhirFetch } from "@/lib/fhir";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const res = await fhirFetch(`/Practitioner/${id}`);
      const text = await res.text();
      if (!res.ok) return NextResponse.json({ error: text }, { status: res.status });
      const data = JSON.parse(text);
      return NextResponse.json(data);
    }

    const res = await fhirFetch(`/Practitioner?${searchParams.toString()}`);
    const text = await res.text();
    if (!res.ok) return NextResponse.json({ error: text }, { status: res.status });
    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fhirFetch(`/Practitioner`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) return NextResponse.json({ error: text }, { status: res.status });
    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
