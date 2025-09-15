import PatientSearch from "@/components/PatientSearch";

export default function Home() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Patient Search</h1>
      <PatientSearch/>
    </div>
  );
}
