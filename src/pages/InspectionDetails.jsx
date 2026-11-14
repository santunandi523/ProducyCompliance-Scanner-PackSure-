import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import ComplianceAssessmentCard from "@/components/common/ComplianceAssessmentCard";
import ProductCategoryBanner from "@/components/common/ProductCategoryBanner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { inspectionService } from "@/services/inspectionService";
import { ArrowLeft, FileText, Download, Loader2, CheckCircle2, AlertTriangle, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

function InspectionDetailsContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await inspectionService.getInspectionResults(id);
        setData(res);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load inspection details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const rep = await inspectionService.generateReport(id);
      setReportInfo(rep);
      toast.success("Official tamper-evident PDF report generated");
    } catch (err) {
      toast.error(err.message || "Report generation failed");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24 text-[#8E8271]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#F5C842] mb-3" />
        <p className="text-xs font-semibold">Loading inspection audit record...</p>
      </div>
    );
  }

  if (!data || !data.inspection) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 bg-[#111118] border border-[#D4A017]/20 rounded-2xl p-8">
        <div className="font-display font-black text-xl text-white">Inspection Record Not Found</div>
        <p className="text-xs text-[#9E927C] mt-2">The requested inspection audit could not be located in the database.</p>
        <button
          onClick={() => navigate("/history")}
          className="mt-5 inline-flex items-center gap-2 btn-gold font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-black" />
          <span>Back to Inspections</span>
        </button>
      </div>
    );
  }

  const handleCategoryUpdated = (newData) => {
    if (!newData) return;
    setData((prev) => ({
      ...prev,
      ...newData,
      inspection: newData.inspection || prev?.inspection,
      declarations: newData.declarations || prev?.declarations,
      evaluations: newData.evaluations || prev?.evaluations,
    }));
  };

  const { inspection = {}, declarations = [], evaluations = [], images = [], product = {} } = data;

  return (
    <div className="max-w-[1340px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker={inspection.inspectionNumber || `INS-${id}`}
        title={product?.name || "Packaged Commodity"}
        subtitle={`${product?.brand || "Generic Brand"} · ${inspection.finalCategory || product?.category || "OTHER"} · ${inspection.location || "Enforcement Circle 1"}`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn-dark flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4A017]" />
              <span>Back</span>
            </button>
            <StatusBadge status={data.complianceStatus || inspection.finalStatus || inspection.status || "COMPLIANT"} />
          </div>
        }
      />

      <ProductCategoryBanner
        inspection={inspection}
        onCategoryUpdated={handleCategoryUpdated}
      />

      <ComplianceAssessmentCard
        score={data.complianceScore ?? inspection.screeningScore ?? 0}
        status={data.complianceStatus || inspection.finalStatus || "NEEDS REVIEW"}
        summary={data.summary}
        evaluations={evaluations}
        problems={data.problems || []}
      />

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-5 shadow-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#8E8271] font-bold">Officer / Circle</div>
          <div className="mt-1.5 font-bold text-white text-sm">{inspection.user?.fullName || "Enforcement Officer"}</div>
          <div className="text-xs text-[#9E927C] mt-0.5">{inspection.location || "Enforcement Circle 1"}</div>
        </div>
        <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-5 shadow-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#8E8271] font-bold">Date &amp; Time</div>
          <div className="mt-1.5 font-bold text-white text-sm">
            {inspection.createdAt ? new Date(inspection.createdAt).toLocaleDateString() : "Today"}
          </div>
          <div className="text-xs text-[#9E927C] mt-0.5">
            {inspection.createdAt ? new Date(inspection.createdAt).toLocaleTimeString() : "—"}
          </div>
        </div>
        <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-5 shadow-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#8E8271] font-bold">Screening Score</div>
          <div className="mt-1.5 font-display font-black text-3xl text-[#F5C842]">
            {inspection.screeningScore || 0}<span className="text-sm text-[#6E6454] font-normal"> / 100</span>
          </div>
        </div>
        <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-5 shadow-xl">
          <div className="text-[10px] uppercase tracking-widest text-[#8E8271] font-bold">Declarations Found</div>
          <div className="mt-1.5 font-display font-black text-3xl text-white">
            {declarations.length}
          </div>
        </div>
      </div>

      {images && images.length > 0 && images[0]?.id && (
        <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-6 shadow-xl">
          <div className="font-display font-black text-white text-base mb-4 flex items-center gap-2">
            <span>Package Evidence Photo</span>
            <Sparkles className="w-4 h-4 text-[#F5C842]" />
          </div>
          <div className="max-w-lg bg-[#0A0A0F] rounded-xl overflow-hidden border border-[#252538] p-3 flex items-center justify-center shadow-inner">
            <img
              src={inspectionService.getImageContentUrl(images[0].id)}
              alt="Commodity Evidence"
              className="max-h-96 w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#252538] font-display font-black text-white text-base bg-[#161622]">
          Statutory Declarations &amp; Field Corroboration
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-dark">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider">
                <th className="text-left px-5 py-3.5">Declaration Field</th>
                <th className="text-left px-5 py-3.5">AI Detected Value</th>
                <th className="text-left px-5 py-3.5">Confidence</th>
                <th className="text-left px-5 py-3.5">Officer Value</th>
                <th className="text-left px-5 py-3.5">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252538]/60">
              {declarations.map((d) => (
                <tr key={d.id || d.fieldName} className="transition-colors">
                  <td className="px-5 py-3.5 font-bold text-white">
                    {(d.fieldName || "DECLARATION").replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#F5C842]">
                    {d.detectedValue || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-[#D4C4A8]">
                    {Math.round((d.finalConfidence || 0.8) * 100)}%
                  </td>
                  <td className="px-5 py-3.5 text-white font-semibold">
                    {d.officerValue || d.detectedValue || "Verified"}
                  </td>
                  <td className="px-5 py-3.5">
                    {d.officerVerified ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[#F5C842] bg-[#D4A017]/15 border border-[#D4A017]/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {evaluations && evaluations.length > 0 && (
        <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-[#252538] font-display font-black text-white text-base bg-[#161622]">
            PCR 2011 Statutory Rule Evaluations
          </div>
          <div className="p-5 space-y-3">
            {evaluations.map((ev, idx) => (
              <div key={ev.id || idx} className="p-4 rounded-xl border border-[#252538] bg-[#161622] flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-white">
                    {ev.rule?.title || (ev.fieldName ? ev.fieldName.replace(/_/g, " ") : "Statutory Requirement")}
                  </div>
                  <div className="text-[10px] text-[#F5C842] font-mono mt-0.5">
                    {ev.rule?.legalReference || "Rule 6(1)"}
                  </div>
                  <p className="text-xs text-[#C8B89A] mt-1.5 leading-relaxed">
                    {ev.reasoning || "Rule evaluated."}
                  </p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  ev.result === "PASS"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : ev.result === "POTENTIAL_ISSUE" || ev.result === "FAIL"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-[#D4A017]/20 text-[#F5C842] border-[#D4A017]/40"
                }`}>
                  {ev.result || "REVIEW"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {inspection.officerRemarks && (
        <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-6 shadow-xl">
          <div className="font-display font-black text-white text-base">Officer Remarks &amp; Determination Findings</div>
          <p className="text-xs text-[#C8B89A] mt-2 leading-relaxed whitespace-pre-wrap">{inspection.officerRemarks}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {reportInfo ? (
          <a
            href={inspectionService.getReportDownloadUrl(reportInfo.id)}
            target="_blank"
            rel="noreferrer"
            className="btn-gold flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs shadow-xl cursor-pointer"
          >
            <Download className="w-4 h-4 text-black" />
            <span>Download Official PDF Report</span>
          </a>
        ) : (
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="btn-gold flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs shadow-xl transition disabled:opacity-50 cursor-pointer"
          >
            {generatingReport ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <FileText className="w-4 h-4 text-black" />}
            <span>Generate Official PDF Report</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function InspectionDetails() {
  return (
    <ErrorBoundary title="Inspection Details Error">
      <InspectionDetailsContent />
    </ErrorBoundary>
  );
}
