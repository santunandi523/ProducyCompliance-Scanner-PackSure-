import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ShieldQuestion } from "lucide-react";

const MAP = {
  PASS: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "PASS" },
  COMPLIANT: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "COMPLIANT" },
  FAIL: { icon: XCircle, cls: "bg-rose-50 text-rose-800 border-rose-200", label: "FAIL" },
  NON_COMPLIANT: { icon: XCircle, cls: "bg-rose-50 text-rose-800 border-rose-200", label: "NON-COMPLIANT" },
  "NON-COMPLIANT": { icon: XCircle, cls: "bg-rose-50 text-rose-800 border-rose-200", label: "NON-COMPLIANT" },
  "NON COMPLIANT": { icon: XCircle, cls: "bg-rose-50 text-rose-800 border-rose-200", label: "NON-COMPLIANT" },
  REVIEW: { icon: HelpCircle, cls: "bg-amber-50 text-amber-800 border-amber-200", label: "NEEDS VERIFICATION" },
  "NEEDS FURTHER REVIEW": { icon: HelpCircle, cls: "bg-amber-50 text-amber-800 border-amber-200", label: "NEEDS REVIEW" },
  "NEEDS REVIEW": { icon: HelpCircle, cls: "bg-amber-50 text-amber-800 border-amber-200", label: "NEEDS REVIEW" },
  NEEDS_REVIEW: { icon: HelpCircle, cls: "bg-amber-50 text-amber-800 border-amber-200", label: "NEEDS REVIEW" },
  NOT_DETECTED: { icon: AlertTriangle, cls: "bg-slate-100 text-slate-700 border-slate-200", label: "NOT DETECTED" },
  NOT_APPLICABLE: { icon: ShieldQuestion, cls: "bg-slate-100 text-slate-600 border-slate-200", label: "NOT APPLICABLE" },
  CONFLICT: { icon: AlertTriangle, cls: "bg-purple-50 text-purple-800 border-purple-200", label: "CONFLICT" },
  CATEGORY_CONFLICT: { icon: AlertTriangle, cls: "bg-purple-50 text-purple-800 border-purple-200", label: "CATEGORY CONFLICT" },
  VIOLATION: { icon: XCircle, cls: "bg-rose-50 text-rose-800 border-rose-200", label: "POTENTIAL VIOLATION" },
  "POTENTIAL NON-COMPLIANCE": { icon: AlertTriangle, cls: "bg-rose-50 text-rose-800 border-rose-200", label: "POTENTIAL NON-COMPLIANCE" },
  HIGH: { icon: AlertTriangle, cls: "bg-rose-50 text-rose-800 border-rose-200", label: "HIGH" },
  MEDIUM: { icon: AlertTriangle, cls: "bg-amber-50 text-amber-800 border-amber-200", label: "MEDIUM" },
  LOW: { icon: ShieldQuestion, cls: "bg-slate-100 text-slate-700 border-slate-200", label: "LOW" },
  INFO: { icon: HelpCircle, cls: "bg-blue-50 text-blue-800 border-blue-200", label: "INFO" },
};

export default function StatusBadge({ status, className = "", label, testId }) {
  const key = String(status || "INFO").trim().toUpperCase();
  const cfg = MAP[key] || MAP.INFO;
  const Icon = cfg.icon;
  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.cls} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {label || cfg.label || key}
    </span>
  );
}