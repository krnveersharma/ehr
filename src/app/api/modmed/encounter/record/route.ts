import { getFhir, getFhirBase, MODMED_CONFIG } from "@/lib/config";
import { fhirFetch, fhirS3Fetch } from "@/lib/fhir";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { encounterId, patientId, practitionerId, summary,topic } = await req.json();

    if (!summary || !patientId || !encounterId || !practitionerId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const summaryText = Object.entries(summary)
      .filter(([_, value]) => value !== "" && value !== null)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const binaryResp = await fhirS3Fetch(`/Binary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        "Accept": "application/fhir+json",
      },
      body: JSON.stringify({
        resourceType: "Binary",
        contentType: "application/pdf",
        securityContext: null,
        data: null,
      }),
    });

    if (!binaryResp.ok) {
      const text = await binaryResp.text();
      return NextResponse.json(
        { success: false, error: `Binary POST failed: ${binaryResp.status} - ${text}` },
        { status: binaryResp.status }
      );
    }

    const binaryData = await binaryResp.json();
    const s3Url = binaryData.issue?.[0]?.details?.text;
    if (!s3Url) {
      return NextResponse.json(
        { success: false, error: "S3 URL missing in Binary response" },
        { status: 500 }
      );
    }

    const s3PutResp = await fetch(s3Url, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: summaryText,
    });

    if (!s3PutResp.ok) {
      const text = await s3PutResp.text();
      return NextResponse.json(
        { success: false, error: `S3 PUT failed: ${s3PutResp.status} - ${text}` },
        { status: s3PutResp.status }
      );
    }

    const documentRefPayload = {
      resourceType: "DocumentReference",
      identifier: [{ system: "filename", value: `${topic}.pdf` }],
      status: "current",
      type: { text: "application/pdf" },
      category: [{
        coding: [{
          system: `${getFhirBase()}/ValueSet/document-category`,
          code: topic=="Vitals"?"18512":"18504",
          display: topic=="Vitals"?"Clinical Results":"External Visit Note",
        }],
        text: `External Visit ${topic}`,
      }],
      subject: { reference: `${getFhir()}/Patient/${patientId}` },
      date: new Date().toISOString(),
      content: [{ attachment: { title: `${topic} Recorded`, contentType: "application/pdf", url: s3Url, creation: new Date().toISOString() } }],
    };

    const documentResponse = await fhirFetch(`/DocumentReference`, {
      method: "POST",
      body: JSON.stringify(documentRefPayload),
    });

    if (!documentResponse.ok) {
      const text = await documentResponse.text();
      return NextResponse.json(
        { success: false, error: `DocumentReference POST failed: ${documentResponse.status} - ${text}` },
        { status: documentResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      s3Url,
      documentResponse: "done",
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
