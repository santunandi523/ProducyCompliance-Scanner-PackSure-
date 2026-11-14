import { Camera, ScanLine, FileText, Scale, AlertTriangle, UserCheck, FileCheck2, Sparkles } from "lucide-react";

const STEPS = [
  { icon: Camera, label: "Evidence Capture" },
  { icon: ScanLine, label: "RapidOCR PP-OCRv4" },
  { icon: FileText, label: "Field Extraction" },
  { icon: Scale, label: "Rule Engine (PCR 2011)" },
  { icon: AlertTriangle, label: "Conflict Resolution" },
  { icon: UserCheck, label: "Officer Review" },
  { icon: FileCheck2, label: "Audit Report Export" },
];

export default function PipelineDiagram({ className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[#D4A017]/20 bg-[#111118] p-6 shadow-xl ${className}`}
      data-testid="pipeline-diagram"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4A017] font-bold">
            Automated Inspection Workflow
          </div>
          <div className="font-display font-black text-white text-lg mt-0.5 flex items-center gap-2">
            <span>End-to-End Metrology Screening Pipeline</span>
            <Sparkles className="w-4 h-4 text-[#F5C842]" />
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/30 tracking-wider px-3 py-1 rounded-full self-start sm:self-auto">
          Local ONNX Engine · Statutory Rules
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-5">
        {STEPS.map((s, idx) => (
          <div
            key={s.label}
            className="flex md:flex-col items-center gap-2.5 p-3 rounded-xl bg-[#161622] border border-[#252538] hover:border-[#D4A017]/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2A220A] border border-[#D4A017]/30 text-[#F5C842] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
              <s.icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="text-center">
              <div className="text-[9px] font-mono text-[#D4A017] uppercase tracking-wider font-bold">
                Step 0{idx + 1}
              </div>
              <div className="text-xs font-bold text-white group-hover:text-[#F5E8C7] transition-colors leading-tight mt-0.5">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
