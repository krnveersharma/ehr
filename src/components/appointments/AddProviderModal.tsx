import AddProviderForm from "./AddProviderForm";

export default function AddProviderModal({ onCreate, onClose }: any) {
  return (
    <div className="border rounded p-4 space-y-3">
      <h2 className="font-medium">Add provider</h2>
      <AddProviderForm onCreate={onCreate} onClose={onClose} />
    </div>
  );
}
