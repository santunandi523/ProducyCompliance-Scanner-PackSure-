export default function StatCard({ label, value, delta, icon: Icon, tone = "slate", testId }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow" data-testid={testId}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{label}</div>
          <div className="mt-2 text-3xl font-display font-extrabold text-slate-900">{value}</div>
          {delta && <div className="mt-1 text-xs text-slate-500">{delta}</div>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${tones[tone]}`}>
            <Icon className="w-5 h-5" strokeWidth={1.75} />
          </div>
        )}
      </div>
    </div>
  );
}
