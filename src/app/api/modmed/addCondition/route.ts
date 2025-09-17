import { fhirFetch } from "@/lib/fhir";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      patientId,
      clinicalStatus,
      categoryCode,
      categoryDisplay,
      diagnosisCode,
      diagnosisDisplay,
      onsetDateTime,
      recordedDate,
    } = await req.json();

    if (!patientId || !diagnosisCode || !diagnosisDisplay) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const body = {
      resourceType: "Condition",
      clinicalStatus: {
        coding: [
          {
            system: "http://hl7.org/fhir/ValueSet/condition-clinical",
            code: clinicalStatus || "ACTIVE",
            display: clinicalStatus || "Active",
          },
        ],
        text: clinicalStatus || "Active",
      },
      category: [
        {
          coding: [
            {
              system: `${process.env.MODMED_BASE_URL}/${process.env.FIRM_URL_PREFIX}/ema/fhir/v2/ValueSet/condition-category`,
              code: categoryCode || "DIAGNOSIS",
              display: categoryDisplay || "Diagnosis",
            },
          ],
          text: categoryDisplay || "Diagnosis",
        },
      ],
      code: {
        coding: [
          {
            system: "ICD10",
            code: diagnosisCode,
            display: diagnosisDisplay,
          },
        ],
        text: diagnosisDisplay,
      },
      subject: {
        reference: `${process.env.MODMED_BASE_URL}/${process.env.FIRM_URL_PREFIX}/ema/fhir/v2/Patient/${patientId}`,
      },
      onsetDateTime: onsetDateTime || new Date().toISOString(),
      recordedDate: recordedDate || new Date().toISOString(),
    };

    const response = await fhirFetch(`/Condition`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("Response data:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
