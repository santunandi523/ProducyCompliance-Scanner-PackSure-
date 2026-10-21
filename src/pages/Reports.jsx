import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { inspectionService } from "@/services/inspectionService";
import { FileText, Download, Printer, Loader2 } from "lucide-react";
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
      toast.success(`Generated official PDF report for ${i.inspectionNumber}`);
    } catch (e) {
      toast.error(e.message || "Failed to generate report");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <PageHeader
        kicker="Statutory Evidence"
        title="Inspection Reports & Records"
        subtitle="Every inspection produces an official signed PDF report with cryptographic SHA-256 hash for court admissibility."
      />
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          Loading inspection records...
        </div>
      ) : inspections.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inspections.map((i) => (
            <div key={i.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-700" strokeWidth={1.75} />
                </div>
                <StatusBadge status={i.finalStatus || i.status} />
              </div>
              <div className="mt-4 font-mono text-xs text-blue-600 font-semibold">{i.inspectionNumber}</div>
              <div className="font-display font-bold text-slate-900 mt-0.5 truncate">
                {i.product?.name || "Packaged Commodity"}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {i.createdAt ? new Date(i.createdAt).toLocaleDateString() : "Today"} · {i.location || "Delhi Zone"}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleDownloadReport(i)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" /> PDF (SHA-256)
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No inspections recorded yet. Start a new scan to generate official reports.
        </div>
      )}
    </div>
  );
}
