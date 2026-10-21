import { useState } from "react";
import { Tag, Sparkles, Check, RefreshCw, AlertTriangle, ShieldCheck, ChevronDown, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { inspectionService } from "@/services/inspectionService";

const CATEGORY_OPTIONS = [
  { code: "FOOD", name: "Food & Beverages" },
  { code: "ELECTRONICS", name: "Electronics & Electricals" },
  { code: "COSMETICS", name: "Cosmetics & Beauty" },
  { code: "PERSONAL_CARE", name: "Personal Care & Hygiene" },
  { code: "HOUSEHOLD", name: "Household & Cleaning" },
  { code: "TEXTILES", name: "Textiles & Apparel" },
  { code: "MEDICINES_HEALTHCARE", name: "Medicines / Healthcare" },
  { code: "OTHER", name: "Other Commodity" },
];

export default function ProductCategoryBanner({
  inspection,
  onCategoryUpdated,
  readOnly = false
}) {
  if (!inspection) return null;

  const detectedCategory = inspection.detectedCategory || "OTHER";
  const rawConf = inspection.detectedCategoryConfidence ?? 0.5;
  const confidencePct = Math.round(rawConf > 1 ? rawConf : rawConf * 100);
  const detectedSource = inspection.detectedCategorySource || "AI";
  const decisionState = inspection.categoryDecisionState || "AUTO_DETECTED";

  const finalCategory = inspection.finalCategory || detectedCategory;
  const finalCategorySource = inspection.finalCategorySource || "AI";

  // Parse explainable reasons
  let reasons = [];
  if (inspection.detectedCategoryReasons) {
    try {
      const parsed = typeof inspection.detectedCategoryReasons === "string"
        ? JSON.parse(inspection.detectedCategoryReasons)
        : inspection.detectedCategoryReasons;
      if (Array.isArray(parsed)) {
        reasons = parsed.map((r) => (typeof r === "string" ? r : JSON.stringify(r)));
      } else if (parsed) {
        reasons = [String(parsed)];
      }
    } catch (e) {
      reasons = [String(inspection.detectedCategoryReasons)];
    }
  }

  const [selectedCategory, setSelectedCategory] = useState(finalCategory);
  const [updating, setUpdating] = useState(false);

  const detectedCatObj = CATEGORY_OPTIONS.find((c) => c.code === detectedCategory) || { code: detectedCategory, name: detectedCategory };
  const finalCatObj = CATEGORY_OPTIONS.find((c) => c.code === finalCategory) || { code: finalCategory, name: finalCategory };

  const handleApplyCategory = async (catToApply, src = "MANUAL") => {
    try {
      setUpdating(true);
      const res = await inspectionService.updateCategory(inspection.id, catToApply, null, src);
      toast.success(`Product category updated to ${catToApply.replace(/_/g, " ")}. Statutory rules re-evaluated.`);
      if (onCategoryUpdated) {
        onCategoryUpdated(res.data || res);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update product category");
    } finally {
      setUpdating(false);
    }
  };

  const isLowConfidence = confidencePct < 80 || decisionState === "REVIEW_REQUIRED" || decisionState === "CATEGORY_CONFLICT";

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-800/40 space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold tracking-wide uppercase text-indigo-200">
              PRODUCT CATEGORY CLASSIFICATION
            </h4>
            <p className="text-[11px] text-indigo-300/80">
              Legal Metrology rules are category-specific. Manual selection overrides AI detection.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {finalCategorySource === "MANUAL" ? (
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Officer Override (Manual)
            </span>
          ) : isLowConfidence ? (
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-full flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Officer Review Required
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Auto-Detected ({confidencePct}%)
            </span>
          )}
        </div>
      </div>

      {/* Classification Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: AI Detection Box & Reasons */}
        <div className="bg-slate-800/70 border border-indigo-900/60 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Detection Signal
            </span>
            <span className="text-xs font-mono font-bold text-indigo-200">
              Confidence: {confidencePct}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black tracking-tight text-white">
              {detectedCatObj.name}
            </span>
            <span className="text-xs text-indigo-300 font-mono">({detectedCategory})</span>
          </div>

          {/* Explainable Reasons */}
          {reasons && reasons.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-indigo-900/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Detection Evidence / Reasons:
              </span>
              <ul className="space-y-1">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-indigo-200/90 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Low Confidence Alert message */}
          {isLowConfidence && finalCategorySource !== "MANUAL" && (
            <p className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800/60 rounded-lg p-2.5 leading-relaxed font-medium">
              Product category could not be determined confidently ({confidencePct}%). Please review and select a category manually.
            </p>
          )}

          {!readOnly && finalCategory !== detectedCategory && (
            <button
              onClick={() => handleApplyCategory(detectedCategory, "AI")}
              disabled={updating}
              className="mt-2 w-full py-1.5 px-3 bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700/60 rounded-lg text-xs font-bold text-indigo-200 flex items-center justify-center gap-1.5 transition"
            >
              {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
              Use AI Detected ({detectedCatObj.name})
            </button>
          )}
        </div>

        {/* Right Side: Final Category Selection & Manual Dropdown */}
        <div className="bg-slate-800/70 border border-indigo-900/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Active Category for Compliance Evaluation
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                SOURCE: {finalCategorySource}
              </span>
            </div>

            <div className="text-2xl font-black text-amber-400 tracking-tight">
              {finalCatObj.name}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Statutory rules for <strong>{finalCatObj.name}</strong> will be loaded and evaluated. Non-applicable category rules are excluded from score.
            </p>
          </div>

          {!readOnly && (
            <div className="space-y-2 pt-3 border-t border-indigo-900/60">
              <label className="text-xs font-bold text-slate-300 block">
                Select / Override Category Manually:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 bg-slate-900 border border-indigo-700/70 rounded-xl text-xs font-bold text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.name} ({opt.code})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleApplyCategory(selectedCategory, "MANUAL")}
                  disabled={updating}
                  className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                >
                  {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  Apply Category
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
