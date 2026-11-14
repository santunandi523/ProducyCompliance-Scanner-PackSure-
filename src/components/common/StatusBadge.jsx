import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ShieldQuestion, Info } from "lucide-react";

const MAP = {
  PASS: {
    icon: CheckCircle2,
    style: { background: "rgba(16, 185, 129, 0.14)", color: "#34D399", borderColor: "rgba(16, 185, 129, 0.35)" },
    label: "PASS",
  },
  COMPLIANT: {
    icon: CheckCircle2,
    style: { background: "rgba(16, 185, 129, 0.14)", color: "#34D399", borderColor: "rgba(16, 185, 129, 0.35)" },
    label: "COMPLIANT",
  },
  FAIL: {
    icon: XCircle,
    style: { background: "rgba(239, 68, 68, 0.14)", color: "#F87171", borderColor: "rgba(239, 68, 68, 0.35)" },
    label: "FAIL",
  },
  NON_COMPLIANT: {
    icon: XCircle,
    style: { background: "rgba(239, 68, 68, 0.14)", color: "#F87171", borderColor: "rgba(239, 68, 68, 0.35)" },
    label: "NON-COMPLIANT",
  },
  "NON-COMPLIANT": {
    icon: XCircle,
    style: { background: "rgba(239, 68, 68, 0.14)", color: "#F87171", borderColor: "rgba(239, 68, 68, 0.35)" },
    label: "NON-COMPLIANT",
  },
  "NON COMPLIANT": {
    icon: XCircle,
    style: { background: "rgba(239, 68, 68, 0.14)", color: "#F87171", borderColor: "rgba(239, 68, 68, 0.35)" },
    label: "NON-COMPLIANT",
  },
  REVIEW: {
    icon: HelpCircle,
    style: { background: "rgba(245, 158, 11, 0.14)", color: "#FCD34D", borderColor: "rgba(245, 158, 11, 0.35)" },
    label: "NEEDS VERIFICATION",
  },
  "NEEDS FURTHER REVIEW": {
    icon: HelpCircle,
    style: { background: "rgba(245, 158, 11, 0.14)", color: "#FCD34D", borderColor: "rgba(245, 158, 11, 0.35)" },
    label: "NEEDS REVIEW",
  },
  "NEEDS REVIEW": {
    icon: HelpCircle,
    style: { background: "rgba(245, 158, 11, 0.14)", color: "#FCD34D", borderColor: "rgba(245, 158, 11, 0.35)" },
    label: "NEEDS REVIEW",
  },
  NEEDS_REVIEW: {
    icon: HelpCircle,
    style: { background: "rgba(245, 158, 11, 0.14)", color: "#FCD34D", borderColor: "rgba(245, 158, 11, 0.35)" },
    label: "NEEDS REVIEW",
  },
  NOT_DETECTED: {
    icon: AlertTriangle,
    style: { background: "rgba(42, 42, 61, 0.6)", color: "#9E927C", borderColor: "rgba(212, 160, 23, 0.15)" },
    label: "NOT DETECTED",
  },
  NOT_APPLICABLE: {
    icon: ShieldQuestion,
    style: { background: "rgba(42, 42, 61, 0.6)", color: "#9E927C", borderColor: "rgba(212, 160, 23, 0.15)" },
    label: "NOT APPLICABLE",
  },
  CONFLICT: {
    icon: AlertTriangle,
    style: { background: "rgba(124, 58, 237, 0.16)", color: "#C084FC", borderColor: "rgba(124, 58, 237, 0.35)" },
    label: "CONFLICT",
  },
  CATEGORY_CONFLICT: {
    icon: AlertTriangle,
    style: { background: "rgba(124, 58, 237, 0.16)", color: "#C084FC", borderColor: "rgba(124, 58, 237, 0.35)" },
    label: "CATEGORY CONFLICT",
  },
  VIOLATION: {
    icon: XCircle,
    style: { background: "rgba(239, 68, 68, 0.14)", color: "#F87171", borderColor: "rgba(239, 68, 68, 0.35)" },
    label: "POTENTIAL VIOLATION",
  },
  "POTENTIAL NON-COMPLIANCE": {
    icon: AlertTriangle,
    style: { background: "rgba(239, 68, 68, 0.14)", color: "#F87171", borderColor: "rgba(239, 68, 68, 0.35)" },
    label: "POTENTIAL NON-COMPLIANCE",
  },
  HIGH: {
    icon: AlertTriangle,
    style: { background: "rgba(239, 68, 68, 0.14)", color: "#F87171", borderColor: "rgba(239, 68, 68, 0.35)" },
    label: "HIGH",
  },
  MEDIUM: {
    icon: AlertTriangle,
    style: { background: "rgba(245, 158, 11, 0.14)", color: "#FCD34D", borderColor: "rgba(245, 158, 11, 0.35)" },
    label: "MEDIUM",
  },
  LOW: {
    icon: ShieldQuestion,
    style: { background: "rgba(42, 42, 61, 0.6)", color: "#9E927C", borderColor: "rgba(212, 160, 23, 0.15)" },
    label: "LOW",
  },
  INFO: {
    icon: Info,
    style: { background: "rgba(124, 58, 237, 0.14)", color: "#D8B4FE", borderColor: "rgba(124, 58, 237, 0.25)" },
    label: "INFO",
  },
};

export default function StatusBadge({ status, className = "", label, testId }) {
  const key = String(status || "INFO").trim().toUpperCase();
  const cfg = MAP[key] || MAP.INFO;
  const Icon = cfg.icon;

  return (
    <span
      data-testid={testId}
      style={{
        background: cfg.style.background,
        color: cfg.style.color,
        border: `1px solid ${cfg.style.borderColor}`,
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-sm shadow-sm transition-all ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
      <span>{label || cfg.label || key}</span>
    </span>
  );
}
