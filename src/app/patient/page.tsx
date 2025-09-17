"use client";
import PatientList from "@/components/PatientList";
import React, { Suspense } from "react";
export default function PatientListPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <PatientList/>
    </Suspense>
  );
} 