import { Camera, ScanLine, FileText, Scale, AlertTriangle, UserCheck, FileCheck2 } from "lucide-react";

const STEPS = [
  { icon: Camera, label: "Image" },
  { icon: ScanLine, label: "PaddleOCR" },
  { icon: FileText, label: "Extraction" },
  { icon: Scale, label: "Rule Engine" },
  { icon: AlertTriangle, label: "Issue Detection" },
  { icon: UserCheck, label: "Officer Review" },
  { icon: FileCheck2, label: "SHA-256 Report" },
];

export default function PipelineDiagram({ className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 ${className}`} data-testid="pipeline-diagram">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-blue-700 font-semibold">How PackSure works</div>
          <div className="font-display font-bold text-slate-900 text-lg">AI-assisted inspection pipeline</div>
        </div>
        <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-300 tracking-wider px-2 py-0.5 rounded">
          PaddleOCR · PCR Rules
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mt-4">
        {STEPS.map((s) => (
          <div key={s.label} className="flex md:flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="text-xs md:text-center font-semibold text-slate-700">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
