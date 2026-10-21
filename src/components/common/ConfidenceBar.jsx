export default function ConfidenceBar({ value = 0, className = "" }) {
  const pct = Math.round((value || 0) * 100);
  const color = pct >= 85 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
  const label = pct >= 85 ? "High" : pct >= 60 ? "Medium" : "Low";
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
        <span className="font-mono">{pct}%</span>
        <span>{label} confidence</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
