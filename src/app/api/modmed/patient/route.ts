import { NextRequest, NextResponse } from "next/server";
import { searchPatients } from "@/lib/fhir";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || undefined;
  const id = searchParams.get("id") || undefined;
  const birthDate = searchParams.get("birthdate") || undefined;
  const count = searchParams.get("_count") ? Number(searchParams.get("_count")) : undefined;
  try {
    const bundle = await searchPatients({ name, id, birthDate: birthDate || undefined, count });
    return NextResponse.json(bundle);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, id, identifier, birthDate, count, pageUrl } = await req.json();
    const bundle = await searchPatients({ name, id, identifier, birthDate, count, pageUrl });
    return NextResponse.json(bundle);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
