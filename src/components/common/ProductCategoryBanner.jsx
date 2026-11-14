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
      toast.success(`Commodity category updated to ${catToApply.replace(/_/g, " ")}. Statutory rules re-evaluated.`);
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
    <div className="bg-[#111118] border border-[#D4A017]/25 rounded-2xl p-6 text-white shadow-xl space-y-5">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252538]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4A017]/15 border border-[#D4A017]/30 flex items-center justify-center text-[#F5C842]">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-wide uppercase text-white flex items-center gap-2">
              <span>Commodity Classification & PCR Schedule</span>
              <Sparkles className="w-3.5 h-3.5 text-[#F5C842]" />
            </h4>
            <p className="text-xs text-[#9E927C] mt-0.5">
              Legal Metrology rules are category-specific. Manual selection overrides automated AI classification.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {finalCategorySource === "MANUAL" ? (
            <span className="px-3.5 py-1 bg-[#D4A017]/20 border border-[#D4A017]/40 text-[#F5C842] text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Officer Override (Manual)
            </span>
          ) : isLowConfidence ? (
            <span className="px-3.5 py-1 bg-[#D4A017]/20 border border-[#D4A017]/40 text-[#F5C842] text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5" /> Review Recommended
            </span>
          ) : (
            <span className="px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> AI Auto-Classified ({confidencePct}%)
            </span>
          )}
        </div>
      </div>

      {/* Classification Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: AI Detection Box & Reasons */}
        <div className="bg-[#161622] border border-[#252538] rounded-xl p-5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#C084FC] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" /> Vision Classification Signal
            </span>
            <span className="text-xs font-mono font-bold text-[#D4A017]">
              Confidence: {confidencePct}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black tracking-tight text-white">
              {detectedCatObj.name}
            </span>
            <span className="text-xs text-[#8E8271] font-mono">({detectedCategory})</span>
          </div>

          {/* Explainable Reasons */}
          {reasons && reasons.length > 0 && (
            <div className="space-y-1.5 pt-3 border-t border-[#252538]">
              <span className="text-[10px] font-bold text-[#8E8271] uppercase tracking-wider">
                Detection Evidence / Reasons:
              </span>
              <ul className="space-y-1.5">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="text-xs text-[#C8B89A] flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Low Confidence Alert message */}
          {isLowConfidence && finalCategorySource !== "MANUAL" && (
            <p className="text-xs text-[#F5C842] bg-[#2A220A]/60 border border-[#D4A017]/30 rounded-xl p-3 leading-relaxed font-medium">
              Commodity category has lower AI confidence ({confidencePct}%). Please review and select a category manually.
            </p>
          )}

          {!readOnly && finalCategory !== detectedCategory && (
            <button
              onClick={() => handleApplyCategory(detectedCategory, "AI")}
              disabled={updating}
              className="mt-2 w-full py-2 px-3 bg-[#1E1E2E] hover:bg-[#252538] border border-[#7C3AED]/40 rounded-xl text-xs font-bold text-[#C084FC] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" />}
              Revert to AI Detected ({detectedCatObj.name})
            </button>
          )}
        </div>

        {/* Right Side: Final Category Selection & Manual Dropdown */}
        <div className="bg-[#161622] border border-[#252538] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-inner">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#F5C842] uppercase tracking-wider">
                Active Statutory Category
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#D4A017]/15 text-[#F5C842] border border-[#D4A017]/30 rounded">
                SOURCE: {finalCategorySource}
              </span>
            </div>

            <div className="text-2xl font-black text-white tracking-tight">
              {finalCatObj.name}
            </div>
            <p className="text-xs text-[#C8B89A] mt-1.5 leading-relaxed">
              Legal Metrology rules for <strong>{finalCatObj.name}</strong> are actively loaded and checked. Irrelevant rules are excluded from statutory score.
            </p>
          </div>

          {!readOnly && (
            <div className="space-y-2 pt-3 border-t border-[#252538]">
              <label className="text-xs font-bold text-[#9E927C] block">
                Select / Override Category Manually:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 input-dark px-3 py-2.5 text-xs font-bold text-white focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code} className="bg-[#111118] text-white">
                      {opt.name} ({opt.code})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleApplyCategory(selectedCategory, "MANUAL")}
                  disabled={updating}
                  className="btn-gold py-2.5 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
