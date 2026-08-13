const STYLE = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-sky-600",
};

const ICON = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export function toast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,22rem)]";
    document.body.appendChild(container);
  }

  const el = document.createElement("div");
  el.className = `toast-item ${STYLE[type] || STYLE.info} text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-start gap-3`;
  el.innerHTML = `<span class="grid place-items-center w-5 h-5 rounded-full bg-white/20 shrink-0 text-xs">${
    ICON[type] || ICON.info
  }</span><span class="leading-snug"></span>`;
  el.lastElementChild.textContent = message;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity .3s";
    setTimeout(() => el.remove(), 320);
  }, 4000);
}
