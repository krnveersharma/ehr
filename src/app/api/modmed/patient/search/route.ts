import { NextRequest, NextResponse } from "next/server";
import { searchPatients } from "@/lib/fhir";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || undefined;
  const id = searchParams.get("id") || undefined;
  const identifier = searchParams.get("identifier") || undefined;

  try {
    const result = await searchPatients({ name, id, identifier });
    console.log("results are: ", result);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}