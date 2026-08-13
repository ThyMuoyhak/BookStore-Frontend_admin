export default function StatCard({ icon, label, value, sub, tone = "amber" }) {
  const tones = {
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    sky: "bg-sky-100 text-sky-700",
    violet: "bg-violet-100 text-violet-700",
    rose: "bg-rose-100 text-rose-700",
    stone: "bg-stone-200 text-stone-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-start gap-4">
      <span className={`w-12 h-12 shrink-0 grid place-items-center rounded-2xl text-xl ${tones[tone] || tones.stone}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <p className="font-display text-2xl font-semibold text-stone-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
