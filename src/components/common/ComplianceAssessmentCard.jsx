import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp, Eye, Sparkles } from "lucide-react";

export default function ComplianceAssessmentCard({
  score = 0,
  status = "NEEDS REVIEW",
  summary = null,
  evaluations = [],
  problems = [],
  onSelectDeclaration = null
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const numericScore = typeof score === "number" ? Math.round(score * 10) / 10 : parseFloat(score) || 0;

  // Determine status classification and colors
  let finalStatus = status ? status.replace(/_/g, " ").toUpperCase() : "";
  if (!finalStatus) {
    if (numericScore < 50) finalStatus = "NON-COMPLIANT";
    else if (numericScore < 75) finalStatus = "NEEDS REVIEW";
    else finalStatus = "COMPLIANT";
  }

  let statusConfig = {
    label: "COMPLIANT",
    badgeBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
    cardBorder: "border-emerald-500/30",
    scoreText: "text-emerald-400",
    scoreGlow: "rgba(16, 185, 129, 0.25)",
  };

  if (finalStatus === "NON-COMPLIANT" || finalStatus === "NON COMPLIANT" || numericScore < 50) {
    statusConfig = {
      label: "NON-COMPLIANT",
      badgeBg: "bg-rose-500/20 text-rose-400 border border-rose-500/40",
      cardBorder: "border-rose-500/30",
      scoreText: "text-rose-400",
      scoreGlow: "rgba(239, 68, 68, 0.25)",
    };
  } else if (finalStatus === "NEEDS REVIEW" || finalStatus === "NEEDS_REVIEW" || numericScore < 75) {
    statusConfig = {
      label: "NEEDS REVIEW",
      badgeBg: "bg-[#D4A017]/20 text-[#F5C842] border border-[#D4A017]/40",
      cardBorder: "border-[#D4A017]/30",
      scoreText: "text-[#F5C842]",
      scoreGlow: "rgba(212, 160, 23, 0.25)",
    };
  }

  // Derive counts if summary not passed directly
  const passedList = evaluations.filter(e => e.result === "PASS");
  const failedList = evaluations.filter(e => e.result === "FAIL" || e.result === "POTENTIAL_ISSUE" || e.result === "VIOLATION");
  const reviewList = evaluations.filter(e => e.result === "REVIEW" || e.result === "NEEDS_REVIEW");
  const naList = evaluations.filter(e => e.result === "NOT_APPLICABLE");

  const totalApplicable = summary?.totalApplicableChecks ?? (evaluations.length - naList.length);
  const passedCount = summary?.passedChecks ?? passedList.length;
  const failedCount = summary?.failedChecks ?? failedList.length;
  const reviewCount = summary?.reviewChecks ?? reviewList.length;
  const naCount = summary?.notApplicableChecks ?? naList.length;

  return (
    <div
      className={`rounded-2xl border ${statusConfig.cardBorder} p-6 shadow-xl space-y-6 transition-all duration-300 bg-[#111118]`}
      style={{ boxShadow: `0 10px 40px rgba(0,0,0,0.6), 0 0 24px ${statusConfig.scoreGlow}` }}
    >
      {/* 1. Top Summary Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#252538]">
        <div className="flex items-center gap-6">
          {/* Big Prominent Percentage */}
          <div
            className="flex flex-col items-center justify-center min-w-[130px] rounded-2xl p-4 border border-[#252538] bg-[#161622] shadow-inner"
            style={{ boxShadow: `0 0 20px ${statusConfig.scoreGlow}` }}
          >
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${statusConfig.scoreText}`}>
              {numericScore}%
            </span>
            <span className="text-[10px] font-bold text-[#8E8271] uppercase tracking-widest mt-1">
              Compliance Score
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${statusConfig.badgeBg}`}>
                {statusConfig.label}
              </span>
              <span className="text-xs font-bold text-[#D4C4A8] bg-[#1E1E2E] px-3 py-1 rounded-full border border-[#2A2A3D]">
                {passedCount} / {totalApplicable} checks passed
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-2 flex items-center gap-2">
              <span>Legal Metrology Compliance Assessment</span>
              <Sparkles className="w-4 h-4 text-[#F5C842]" />
            </h3>
            <p className="text-xs text-[#9E927C] mt-0.5">
              Legal Metrology (Packaged Commodities) Rules, 2011 · Automated statutory determination
            </p>
          </div>
        </div>

        {/* Toggle Score Breakdown Button */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#F5E8C7] bg-[#1E1E2E] hover:bg-[#252538] hover:border-[#D4A017]/40 border border-[#2A2A3D] rounded-xl transition cursor-pointer"
        >
          <Info className="w-4 h-4 text-[#F5C842]" />
          <span>{showBreakdown ? "Hide Formula" : "View Formula Breakdown"}</span>
          {showBreakdown ? <ChevronUp className="w-3.5 h-3.5 text-[#D4A017]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#D4A017]" />}
        </button>
      </div>

      {/* 2. Collapsible Score Breakdown Box */}
      {showBreakdown && (
        <div className="bg-[#161622] rounded-xl border border-[#D4A017]/20 p-4 space-y-3 text-xs animate-fade-in shadow-inner">
          <div className="font-bold text-[#F5E8C7] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
              Weighted Score Calculation Matrix
            </span>
            <span className="text-[11px] font-mono text-[#D4A017]">Formula: (Passed Weight / Applicable Weight) × 100</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-emerald-400 uppercase">Passed</div>
              <div className="text-xl font-black text-emerald-300 mt-0.5">{passedCount}</div>
            </div>
            <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-rose-400 uppercase">Failed</div>
              <div className="text-xl font-black text-rose-300 mt-0.5">{failedCount}</div>
            </div>
            <div className="bg-[#2A220A]/60 border border-[#D4A017]/30 rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-[#F5C842] uppercase">Needs Review</div>
              <div className="text-xl font-black text-[#F5C842] mt-0.5">{reviewCount}</div>
            </div>
            <div className="bg-[#1E1E2E] border border-[#2A2A3D] rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-[#8E8271] uppercase">Excluded (N/A)</div>
              <div className="text-xl font-black text-[#D4C4A8] mt-0.5">{naCount}</div>
            </div>
            <div className="bg-[#180D28]/60 border border-[#7C3AED]/30 rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-[#C084FC] uppercase">Total Applicable</div>
              <div className="text-xl font-black text-white mt-0.5">{totalApplicable}</div>
            </div>
          </div>

          <p className="text-[11px] text-[#9E927C] leading-relaxed pt-2 border-t border-[#252538]">
            * Mandatory declarations (MRP, Manufacturer/Packer, Net Qty, Country of Origin, Mfd Date, Customer Care) carry <strong>weight = 2</strong>, while optional declarations carry <strong>weight = 1</strong>. Not Applicable rules do not penalize the score.
          </p>
        </div>
      )}

      {/* 3. Problems & Violations List */}
      {(problems.length > 0 || failedList.length > 0 || reviewList.length > 0) && (
        <div className="space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-[#F5C842]">
            <AlertTriangle className="w-4 h-4 text-[#F5C842]" />
            <span>Compliance Attention Items ({problems.length || (failedList.length + reviewList.length)})</span>
          </div>

          <div className="space-y-2.5">
            {problems.length > 0 ? (
              problems.map((prob, idx) => {
                const isFail = prob.status === "FAIL" || prob.status === "POTENTIAL_ISSUE" || prob.status === "VIOLATION";
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                      isFail
                        ? "bg-rose-950/20 border-rose-500/30 text-rose-200"
                        : "bg-[#2A220A]/40 border-[#D4A017]/30 text-[#F5E8C7]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isFail ? (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#F5C842] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{prob.rule ? prob.rule.replace(/_/g, " ") : "Statutory Finding"}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isFail ? "bg-rose-500/30 text-rose-300 border border-rose-500/40" : "bg-[#D4A017]/20 text-[#F5C842] border border-[#D4A017]/30"
                          }`}>
                            {prob.status}
                          </span>
                        </div>
                        <p className="mt-1 text-[#C8B89A] leading-relaxed font-medium">
                          {prob.message || prob.reason}
                        </p>
                      </div>
                    </div>

                    {onSelectDeclaration && prob.rule && (
                      <button
                        onClick={() => onSelectDeclaration({ fieldName: prob.rule })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E1E2E] hover:bg-[#252538] border border-[#D4A017]/30 rounded-lg text-[11px] font-bold text-[#F5C842] self-start sm:self-center transition shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#F5C842]" />
                        <span>View Evidence</span>
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              [...failedList, ...reviewList].map((ev) => {
                const isFail = ev.result === "FAIL" || ev.result === "POTENTIAL_ISSUE";
                return (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isFail
                        ? "bg-rose-950/20 border-rose-500/30 text-rose-200"
                        : "bg-[#2A220A]/40 border-[#D4A017]/30 text-[#F5E8C7]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isFail ? (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#F5C842] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{ev.fieldName ? ev.fieldName.replace(/_/g, " ") : (ev.rule?.title || "Statutory Rule Finding")}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isFail ? "bg-rose-500/30 text-rose-300" : "bg-[#D4A017]/20 text-[#F5C842]"
                          }`}>
                            {ev.result}
                          </span>
                        </div>
                        <p className="mt-1 text-[#C8B89A] leading-relaxed font-medium">
                          {ev.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. Rule Evaluations Breakdown Grid */}
      <div className="space-y-3">
        <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Verified Statutory Declarations ({passedList.length})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {passedList.map((ev) => (
            <div
              key={ev.id}
              className="bg-[#161622] border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs shadow-sm hover:border-emerald-500/40 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white truncate" title={ev.fieldName || ev.rule?.title}>
                {ev.fieldName ? ev.fieldName.replace(/_/g, " ") : ev.rule?.ruleCode}
              </span>
            </div>
          ))}
          {passedList.length === 0 && (
            <span className="text-xs text-[#8E8271] italic col-span-full">No declarations verified yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}
