'use client'
import AddConditionForm from "@/components/addCondition/AddConditionForm";
import { useParams } from "next/navigation";

export default function AddConditionPage() {
  const params = useParams();
  const id = params?.id as string; 

  if (!id) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AddConditionForm patientId={id as string} />
    </div>
  );
}
