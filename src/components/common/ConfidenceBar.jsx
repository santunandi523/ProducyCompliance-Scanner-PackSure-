export default function ConfidenceBar({ value = 0, className = "" }) {
  const pct = Math.round((value || 0) * 100);
  
  // Custom gold / emerald / amber / rose gradient for confidence levels
  const barGradient =
    pct >= 85
      ? "linear-gradient(90deg, #10B981 0%, #34D399 100%)"
      : pct >= 60
      ? "linear-gradient(90deg, #D4A017 0%, #F5C842 100%)"
      : "linear-gradient(90deg, #EF4444 0%, #F87171 100%)";

  const label = pct >= 85 ? "High" : pct >= 60 ? "Medium" : "Low";
  const labelColor = pct >= 85 ? "#34D399" : pct >= 60 ? "#F5C842" : "#F87171";

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-medium mb-1">
        <span className="font-mono font-bold" style={{ color: labelColor }}>
          {pct}%
        </span>
        <span className="text-[10px] text-[#9E927C] uppercase tracking-wider">
          {label} confidence
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#1E1E2E] overflow-hidden border border-[#252538]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: barGradient,
            boxShadow: `0 0 8px ${pct >= 85 ? 'rgba(16,185,129,0.4)' : pct >= 60 ? 'rgba(212,160,23,0.4)' : 'rgba(239,68,68,0.4)'}`,
          }}
        />
      </div>
    </div>
  );
}
