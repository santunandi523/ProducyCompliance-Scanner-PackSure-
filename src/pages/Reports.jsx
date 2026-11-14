import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { inspectionService } from "@/services/inspectionService";
import { FileText, Download, Printer, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    inspectionService.listInspections()
      .then((data) => {
        if (active) {
          setInspections(data || []);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Failed to load inspections for reports:", e);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDownloadReport = async (i) => {
    try {
      const rep = await inspectionService.generateReport(i.id);
      window.open(inspectionService.getReportDownloadUrl(rep.id), "_blank");
      toast.success(`Generated official tamper-evident PDF report for ${i.inspectionNumber}`);
    } catch (e) {
      toast.error(e.message || "Failed to generate report");
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker="Statutory Evidence & Records"
        title="Official Inspection Reports"
        subtitle="Every inspection produces an official tamper-evident PDF report with digital audit verification for legal admissibility."
      />

      {loading ? (
        <div className="p-16 text-center text-[#8E8271]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#F5C842] mb-2.5" />
          <span className="text-xs">Loading inspection records...</span>
        </div>
      ) : inspections.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {inspections.map((i) => (
            <div
              key={i.id}
              className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-6 hover:border-[#D4A017]/40 transition-all duration-300 hover:-translate-y-1 shadow-xl group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#2A220A] border border-[#D4A017]/30 flex items-center justify-center text-[#F5C842] shadow-inner group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" strokeWidth={1.8} />
                </div>
                <StatusBadge status={i.finalStatus || i.status} />
              </div>

              <div className="mt-5 font-mono text-xs text-[#F5C842] font-bold">
                {i.inspectionNumber}
              </div>
              <div className="font-display font-black text-white text-base mt-0.5 truncate">
                {i.product?.name || "Packaged Commodity"}
              </div>
              <div className="text-xs text-[#9E927C] mt-1">
                {i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "Today"} · {i.location || "Enforcement Circle 1"}
              </div>

              <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-[#252538]">
                <button
                  onClick={() => handleDownloadReport(i)}
                  className="btn-gold flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-black" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn-dark flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-3 rounded-xl transition cursor-pointer"
                  title="Print Record"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-16 text-center text-[#8E8271] text-xs shadow-xl">
          No inspections recorded yet. Start a new scan to generate official reports.
        </div>
      )}
    </div>
  );
}
