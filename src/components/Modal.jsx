import { useEffect } from "react";

export default function Modal({ open, title, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`modal-card relative w-full ${wide ? "max-w-3xl" : "max-w-md"} bg-white rounded-3xl border border-stone-200 shadow-2xl`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-100">
          <h3 className="font-display text-xl font-semibold text-stone-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-xl hover:bg-stone-100 text-stone-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
