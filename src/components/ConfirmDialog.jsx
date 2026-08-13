import Modal from "./Modal";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onClose, busy = false }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-stone-600 text-sm leading-relaxed">{message}</p>
      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={busy}
          className="px-5 py-2.5 rounded-xl border border-stone-300 hover:border-stone-500 text-stone-700 text-sm font-semibold disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60"
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
