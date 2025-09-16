import AppointmentForm from "./AppointmentForm";

export default function BookingModal({ slot, appointmentType, locationId, practitionerId, initialPatientId, onSubmit, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-full max-w-lg">
        <h2 className="font-medium mb-3">Book Appointment</h2>
        <AppointmentForm
          slot={slot}
          appointmentType={appointmentType}
          locationId={locationId}
          practitionerId={practitionerId}
          initialPatientId={initialPatientId}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
