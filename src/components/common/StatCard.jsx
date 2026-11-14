export default function StatCard({ label, value, delta, icon: Icon, tone = "slate", testId }) {
  const tones = {
    slate:   { bg: "rgba(37,37,53,0.6)", iconBg: "rgba(90,78,66,0.25)", iconColor: "#C8B89A", border: "rgba(212,160,23,0.12)", glow: "rgba(212,160,23,0.06)" },
    blue:    { bg: "rgba(107,33,168,0.18)", iconBg: "rgba(124,58,237,0.25)", iconColor: "#C084FC", border: "rgba(124,58,237,0.3)", glow: "rgba(124,58,237,0.15)" },
    violet:  { bg: "rgba(107,33,168,0.18)", iconBg: "rgba(124,58,237,0.25)", iconColor: "#C084FC", border: "rgba(124,58,237,0.3)", glow: "rgba(124,58,237,0.15)" },
    emerald: { bg: "rgba(16,185,129,0.12)", iconBg: "rgba(16,185,129,0.22)", iconColor: "#34D399", border: "rgba(16,185,129,0.28)", glow: "rgba(16,185,129,0.12)" },
    amber:   { bg: "rgba(245,158,11,0.12)", iconBg: "rgba(212,160,23,0.22)", iconColor: "#F5C842", border: "rgba(212,160,23,0.32)", glow: "rgba(212,160,23,0.15)" },
    gold:    { bg: "rgba(212,160,23,0.12)", iconBg: "rgba(212,160,23,0.25)", iconColor: "#F5C842", border: "rgba(212,160,23,0.35)", glow: "rgba(212,160,23,0.18)" },
    red:     { bg: "rgba(239,68,68,0.12)", iconBg: "rgba(239,68,68,0.22)", iconColor: "#F87171", border: "rgba(239,68,68,0.28)", glow: "rgba(239,68,68,0.12)" },
  };

  const t = tones[tone] || tones.slate;

  return (
    <div
      data-testid={testId}
      className="animate-fade-in relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#D4A017]/40 cursor-default group"
      style={{
        background: '#111118',
        border: `1px solid ${t.border}`,
        boxShadow: `0 6px 28px rgba(0,0,0,0.6), 0 0 20px ${t.glow}`,
      }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] font-bold" style={{ color: '#9E927C' }}>
              {label}
            </div>
            <div className="mt-2.5 text-3xl sm:text-4xl font-display font-black tracking-tight text-white group-hover:text-[#F5E8C7] transition-colors">
              {value}
            </div>
            {delta && (
              <div className="mt-1.5 text-xs font-medium" style={{ color: '#C8B89A' }}>
                {delta}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: t.iconBg, border: `1px solid ${t.border}` }}
            >
              <Icon className="w-5 h-5" strokeWidth={2} style={{ color: t.iconColor }} />
            </div>
          )}
        </div>
      </div>
      {/* Subtle bottom gradient accent line */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, ${t.border}, #D4A017, transparent)` }}
      />
    </div>
  );
}
