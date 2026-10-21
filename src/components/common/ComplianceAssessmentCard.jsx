import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp, Eye } from "lucide-react";

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

  // Determine status classification and colors based on user specification
  let finalStatus = status ? status.replace(/_/g, " ").toUpperCase() : "";
  if (!finalStatus) {
    if (numericScore < 50) finalStatus = "NON-COMPLIANT";
    else if (numericScore < 75) finalStatus = "NEEDS REVIEW";
    else finalStatus = "COMPLIANT";
  }

  let statusConfig = {
    label: "COMPLIANT",
    badgeBg: "bg-emerald-600 text-white",
    cardBorder: "border-emerald-300 bg-emerald-50/40",
    scoreText: "text-emerald-700",
    lightBadge: "bg-emerald-100 text-emerald-800 border-emerald-300"
  };

  if (finalStatus === "NON-COMPLIANT" || finalStatus === "NON COMPLIANT" || numericScore < 50) {
    statusConfig = {
      label: "NON-COMPLIANT",
      badgeBg: "bg-rose-600 text-white",
      cardBorder: "border-rose-300 bg-rose-50/40",
      scoreText: "text-rose-700",
      lightBadge: "bg-rose-100 text-rose-800 border-rose-300"
    };
  } else if (finalStatus === "NEEDS REVIEW" || finalStatus === "NEEDS_REVIEW" || numericScore < 75) {
    statusConfig = {
      label: "NEEDS REVIEW",
      badgeBg: "bg-amber-500 text-white",
      cardBorder: "border-amber-300 bg-amber-50/40",
      scoreText: "text-amber-700",
      lightBadge: "bg-amber-100 text-amber-800 border-amber-300"
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
    <div className={`rounded-2xl border ${statusConfig.cardBorder} p-6 shadow-sm space-y-6 transition-all duration-200`}>
      {/* 1. Top Summary Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-6">
          {/* Big Prominent Percentage */}
          <div className="flex flex-col items-center justify-center min-w-[120px] bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${statusConfig.scoreText}`}>
              {numericScore}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Compliance Score
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${statusConfig.badgeBg}`}>
                {statusConfig.label}
              </span>
              <span className="text-xs font-bold text-slate-600 bg-white/80 px-3 py-1 rounded-full border border-slate-200">
                {passedCount} / {totalApplicable} checks passed
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Legal Metrology Compliance Assessment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Legal Metrology (Packaged Commodities) Rules, 2011 · Score derived from weighted statutory rule evaluation
            </p>
          </div>
        </div>

        {/* Toggle Score Breakdown Button */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition"
        >
          <Info className="w-4 h-4 text-blue-600" />
          {showBreakdown ? "Hide Score Breakdown" : "View Score Breakdown"}
          {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Collapsible Score Breakdown Box */}
      {showBreakdown && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs animate-in fade-in duration-150">
          <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
            <span>Score Calculation Breakdown</span>
            <span className="text-[11px] font-mono text-slate-500">Formula: (Passed Weight / Applicable Weight) × 100</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-2.5 text-center">
              <div className="text-[10px] font-bold text-emerald-800 uppercase">Passed</div>
              <div className="text-lg font-extrabold text-emerald-900 mt-0.5">{passedCount}</div>
            </div>
            <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-2.5 text-center">
              <div className="text-[10px] font-bold text-rose-800 uppercase">Failed</div>
              <div className="text-lg font-extrabold text-rose-900 mt-0.5">{failedCount}</div>
            </div>
            <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-2.5 text-center">
              <div className="text-[10px] font-bold text-amber-800 uppercase">Needs Review</div>
              <div className="text-lg font-extrabold text-amber-900 mt-0.5">{reviewCount}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Not Applicable</div>
              <div className="text-lg font-extrabold text-slate-700 mt-0.5">{naCount}</div>
              <span className="text-[9px] text-slate-400 block">(Excluded)</span>
            </div>
            <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-2.5 text-center">
              <div className="text-[10px] font-bold text-blue-800 uppercase">Applicable Checks</div>
              <div className="text-lg font-extrabold text-blue-900 mt-0.5">{totalApplicable}</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            * Mandatory declarations (MRP, Manufacturer/Packer, Net Qty, Country of Origin, Mfd Date, Customer Care) carry <strong>weight = 2</strong>, while optional declarations carry <strong>weight = 1</strong>. Not Applicable rules do not reduce the score.
          </p>
        </div>
      )}

      {/* 3. Problems & Violations List (if any exist) */}
      {(problems.length > 0 || failedList.length > 0 || reviewList.length > 0) && (
        <div className="space-y-3">
          <div className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Compliance Problems & Attention Items ({problems.length || (failedList.length + reviewList.length)})
          </div>

          <div className="space-y-2.5">
            {problems.length > 0 ? (
              problems.map((prob, idx) => {
                const isFail = prob.status === "FAIL" || prob.status === "POTENTIAL_ISSUE" || prob.status === "VIOLATION";
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isFail ? "bg-rose-50/80 border-rose-200 text-rose-950" : "bg-amber-50/80 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isFail ? (
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{prob.rule ? prob.rule.replace(/_/g, " ") : "Rule Finding"}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isFail ? "bg-rose-200 text-rose-800" : "bg-amber-200 text-amber-900"
                          }`}>
                            {prob.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-slate-700 leading-relaxed font-medium">
                          {prob.message || prob.reason}
                        </p>
                      </div>
                    </div>

                    {onSelectDeclaration && prob.rule && (
                      <button
                        onClick={() => onSelectDeclaration({ fieldName: prob.rule })}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 shadow-2xs self-start sm:self-center transition flex-shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" /> View Evidence
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              // Fallback to evaluations if problems list not explicitly populated
              [...failedList, ...reviewList].map((ev) => {
                const isFail = ev.result === "FAIL" || ev.result === "POTENTIAL_ISSUE";
                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isFail ? "bg-rose-50/80 border-rose-200 text-rose-950" : "bg-amber-50/80 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isFail ? (
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{ev.fieldName ? ev.fieldName.replace(/_/g, " ") : (ev.rule?.title || "Rule Finding")}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isFail ? "bg-rose-200 text-rose-800" : "bg-amber-200 text-amber-900"
                          }`}>
                            {ev.result}
                          </span>
                        </div>
                        <p className="mt-0.5 text-slate-700 leading-relaxed font-medium">
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
        <div className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Passed Statutory Rules ({passedList.length})
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {passedList.map((ev) => (
            <div
              key={ev.id}
              className="bg-white border border-emerald-200/80 rounded-xl p-2.5 flex items-center gap-2 text-xs shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold text-slate-800 truncate" title={ev.fieldName || ev.rule?.title}>
                {ev.fieldName ? ev.fieldName.replace(/_/g, " ") : ev.rule?.ruleCode}
              </span>
            </div>
          ))}
          {passedList.length === 0 && (
            <span className="text-xs text-slate-400 italic col-span-full">No rules passed yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}
