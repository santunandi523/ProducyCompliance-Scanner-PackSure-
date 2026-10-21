import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import ComplianceAssessmentCard from "@/components/common/ComplianceAssessmentCard";
import ProductCategoryBanner from "@/components/common/ProductCategoryBanner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { inspectionService } from "@/services/inspectionService";
import { ArrowLeft, FileText, Download, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
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
      toast.success("Official PDF report generated with SHA-256 hash");
    } catch (err) {
      toast.error(err.message || "Report generation failed");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-slate-500 text-sm">Loading inspection record...</p>
      </div>
    );
  }

  if (!data || !data.inspection) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <div className="font-display font-bold text-xl text-slate-900">Inspection not found</div>
        <p className="text-sm text-slate-500 mt-2">The requested inspection record could not be located in the database.</p>
        <button onClick={() => navigate("/history")} className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Back to inspections
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
    <div className="max-w-[1200px] mx-auto space-y-6">
      <PageHeader
        kicker={inspection.inspectionNumber || `INS-${id}`}
        title={product?.name || "Packaged Commodity"}
        subtitle={`${product?.brand || "Generic"} · ${inspection.finalCategory || product?.category || "OTHER"} · ${inspection.location || "Retail Store"}`}
        actions={
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
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
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">Officer / Circle</div>
          <div className="mt-1 font-semibold text-slate-900">{inspection.user?.fullName || "Enforcement Officer"}</div>
          <div className="text-xs text-slate-500">{inspection.location || "Retail Inspection"}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">Date & Time</div>
          <div className="mt-1 font-semibold text-slate-900">
            {inspection.createdAt ? new Date(inspection.createdAt).toLocaleDateString() : "Today"}
          </div>
          <div className="text-xs text-slate-500">
            {inspection.createdAt ? new Date(inspection.createdAt).toLocaleTimeString() : "—"}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">Screening Score</div>
          <div className="mt-1 font-display font-extrabold text-3xl text-blue-700">
            {inspection.screeningScore || 0}<span className="text-lg text-slate-400">/100</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">Declarations Found</div>
          <div className="mt-1 font-display font-extrabold text-3xl text-slate-900">
            {declarations.length}
          </div>
        </div>
      </div>

      {images && images.length > 0 && images[0]?.id && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="font-display font-bold text-slate-900 mb-3">Package Evidence Photo</div>
          <div className="max-w-lg bg-slate-900/5 rounded-xl overflow-hidden border border-slate-200 p-2 flex items-center justify-center">
            <img
              src={`http://localhost:8081/api/inspections/images/${images[0].id}/content`}
              alt="Commodity Evidence"
              className="max-h-96 w-auto object-contain rounded-lg shadow-xs"
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 font-display font-bold text-slate-900">
          Statutory Declarations & Officer Verification
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Field</th>
              <th className="text-left px-5 py-3 font-semibold">AI Detected Value</th>
              <th className="text-left px-5 py-3 font-semibold">Confidence</th>
              <th className="text-left px-5 py-3 font-semibold">Officer Value</th>
              <th className="text-left px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {declarations.map((d) => (
              <tr key={d.id || d.fieldName} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 font-semibold text-slate-800">
                  {(d.fieldName || "DECLARATION").replace(/_/g, " ")}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-slate-800">
                  {d.detectedValue || "—"}
                </td>
                <td className="px-5 py-3 text-slate-700">
                  {Math.round((d.finalConfidence || 0.8) * 100)}%
                </td>
                <td className="px-5 py-3 text-slate-900 font-medium">
                  {d.officerValue || d.detectedValue || "Verified"}
                </td>
                <td className="px-5 py-3">
                  {d.officerVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {evaluations && evaluations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 font-display font-bold text-slate-900">
            PCR 2011 Rule Engine Evaluation Details
          </div>
          <div className="p-5 space-y-3">
            {evaluations.map((ev, idx) => (
              <div key={ev.id || idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {ev.rule?.title || (ev.fieldName ? ev.fieldName.replace(/_/g, " ") : "Statutory Requirement")}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ev.rule?.legalReference || "Rule 6(1)"}
                  </div>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    {ev.reasoning || "Rule evaluated."}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                  ev.result === "PASS"
                    ? "bg-emerald-100 text-emerald-800"
                    : ev.result === "POTENTIAL_ISSUE"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {ev.result || "REVIEW"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {inspection.officerRemarks && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="font-display font-bold text-slate-900">Officer Remarks & Findings</div>
          <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{inspection.officerRemarks}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {reportInfo ? (
          <a
            href={inspectionService.getReportDownloadUrl(reportInfo.id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Official PDF Report
          </a>
        ) : (
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm disabled:opacity-50"
          >
            {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Generate Official PDF Report
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