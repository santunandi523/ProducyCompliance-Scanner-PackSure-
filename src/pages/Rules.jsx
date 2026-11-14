import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { ruleService } from "@/services/ruleService";
import { Plus, X, Scale, Play, CheckCircle2, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const VALIDATION_TYPES = ["PRESENCE", "FORMAT", "NUMERIC", "DATE", "READABILITY", "CUSTOM"];

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // New Rule Form
  const [draft, setDraft] = useState({
    ruleCode: "",
    title: "",
    category: "ALL",
    validationType: "PRESENCE",
    fieldName: "MRP",
    severity: "HIGH",
    description: "",
    legalReference: "Legal Metrology (Packaged Commodities) Rules, 2011",
    required: true,
  });

  // Rule Testing Sandbox
  const [testRuleCode, setTestRuleCode] = useState("");
  const [testValue, setTestValue] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let active = true;
    ruleService.getAllRules()
      .then((data) => {
        if (active) {
          setRules(data || []);
          if (data && data.length > 0) {
            setTestRuleCode((prev) => prev || data[0].ruleCode);
          }
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Failed to load rules:", e);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const handleCreateRule = async () => {
    if (!draft.ruleCode || !draft.title) return toast.error("Rule code and title are required");
    try {
      await ruleService.createRule(draft);
      toast.success(`Rule ${draft.ruleCode} saved to statutory database`);
      setOpen(false);
      setDraft({
        ruleCode: "",
        title: "",
        category: "ALL",
        validationType: "PRESENCE",
        fieldName: "MRP",
        severity: "HIGH",
        description: "",
        legalReference: "Legal Metrology (Packaged Commodities) Rules, 2011",
        required: true,
      });
      refresh();
    } catch (e) {
      toast.error(e.message || "Failed to create rule");
    }
  };

  const handleTestRule = async () => {
    if (!testRuleCode || !testValue) {
      toast.error("Please enter a rule code and a sample test value");
      return;
    }
    setTesting(true);
    try {
      const res = await ruleService.testRule(testRuleCode, testValue);
      setTestResult(res);
      toast.success("Rule evaluation completed");
    } catch (e) {
      toast.error(e.message || "Test evaluation failed");
    } finally {
      setTesting(false);
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      if (rule.active) {
        await ruleService.deactivateRule(rule.id);
        toast.info(`Rule ${rule.ruleCode} deactivated`);
      } else {
        await ruleService.activateRule(rule.id);
        toast.success(`Rule ${rule.ruleCode} activated`);
      }
      refresh();
    } catch (e) {
      toast.error(e.message || "Failed to toggle rule");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker="Statutory Rule Engine"
        title="Legal Metrology (PCR 2011) Rule Registry"
        subtitle="PCR 2011 compliance rules are database-driven, version-controlled, and testable against sample package declarations."
        actions={
          <button
            onClick={() => setOpen(true)}
            data-testid="add-rule-btn"
            className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Add Statutory Rule</span>
          </button>
        }
      />

      {/* Rule Testing Sandbox Card */}
      <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/25 p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#D4A017]/15 flex items-center justify-center text-[#F5C842]">
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="font-display font-black text-white text-base">Rule Testing Sandbox</h3>
          <span className="text-[10px] font-mono font-bold uppercase bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/30 px-2.5 py-0.5 rounded-full ml-1">
            Interactive Tester
          </span>
        </div>
        <p className="text-xs text-[#9E927C] mb-5">
          Simulate how any PCR rule evaluates OCR parsed tokens before applying it in live enforcement scans.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-[#D4C4A8]">Select Rule</label>
            <select
              value={testRuleCode}
              onChange={(e) => setTestRuleCode(e.target.value)}
              className="mt-1.5 w-full input-dark px-3 py-2 text-xs font-bold text-white focus:outline-none"
            >
              {rules.map((r) => (
                <option key={r.ruleCode} value={r.ruleCode} className="bg-[#111118] text-white">
                  {r.ruleCode} — {r.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#D4C4A8]">Sample Declaration Value</label>
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              placeholder="e.g. ₹85.00 or 1800-222-3333"
              className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleTestRule}
              disabled={testing}
              className="w-full btn-gold py-2.5 px-4 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Play className="w-4 h-4 text-black" />}
              <span>Run Test Evaluation</span>
            </button>
          </div>
        </div>

        {testResult && (
          <div className="mt-5 p-4 rounded-xl bg-[#161622] border border-[#252538] text-xs flex items-start gap-3.5 shadow-inner">
            {testResult.result === "PASS" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#F5C842] shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Result: {testResult.result}</span>
                <span className="text-[10px] font-mono text-[#F5C842]">({testResult.ruleCode})</span>
              </div>
              <p className="text-xs text-[#C8B89A] mt-1 leading-relaxed">{testResult.reasoning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rules Table */}
      <div className="bg-[#111118] border border-[#D4A017]/15 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-[#8E8271]">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2.5 text-[#F5C842]" />
            <span className="text-xs">Loading statutory rules from database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-dark">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5">Rule Code</th>
                  <th className="text-left px-5 py-3.5">Requirement</th>
                  <th className="text-left px-5 py-3.5">Category</th>
                  <th className="text-left px-5 py-3.5">Validation</th>
                  <th className="text-left px-5 py-3.5">Version</th>
                  <th className="text-left px-5 py-3.5">Severity</th>
                  <th className="text-left px-5 py-3.5">Status</th>
                  <th className="text-right px-5 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252538]/60">
                {rules.map((r) => (
                  <tr key={r.id} className="transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#F5C842]">{r.ruleCode}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{r.title}</div>
                      <div className="text-[10px] text-[#8E8271] mt-0.5">{r.legalReference}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#D4C4A8] font-semibold">{r.category}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#1E1E2E] text-[#C084FC] border border-[#2A2A3D] rounded-md">
                        {r.validationType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#9E927C]">{r.version}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.severity} /></td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        r.active
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-[#1E1E2E] text-[#8E8271] border-[#252538]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.active ? "bg-emerald-400" : "bg-[#6E6454]"}`} />
                        {r.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleActive(r)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          r.active
                            ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                            : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        {r.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/30 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252538] bg-[#161622]">
              <div className="font-display font-black text-white text-base">Add Statutory Rule</div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[#1E1E2E] flex items-center justify-center text-[#C8B89A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#D4C4A8]">Rule Code *</label>
                <input
                  type="text"
                  value={draft.ruleCode}
                  onChange={(e) => setDraft({ ...draft, ruleCode: e.target.value })}
                  placeholder="e.g. PC-CUSTOM-008"
                  className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#D4C4A8]">Requirement Title *</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Best Before Date"
                  className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#D4C4A8]">Field Key</label>
                <input
                  type="text"
                  value={draft.fieldName}
                  onChange={(e) => setDraft({ ...draft, fieldName: e.target.value })}
                  placeholder="e.g. EXPIRY_DATE"
                  className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#D4C4A8]">Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="mt-1.5 w-full input-dark px-3 py-2 text-xs text-white"
                >
                  {["ALL", "FOOD", "COSMETIC", "HOUSEHOLD", "ELECTRONICS", "TEXTILE"].map((c) => (
                    <option key={c} value={c} className="bg-[#111118] text-white">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#D4C4A8]">Validation Type</label>
                <select
                  value={draft.validationType}
                  onChange={(e) => setDraft({ ...draft, validationType: e.target.value })}
                  className="mt-1.5 w-full input-dark px-3 py-2 text-xs text-white"
                >
                  {VALIDATION_TYPES.map((v) => (
                    <option key={v} value={v} className="bg-[#111118] text-white">{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#D4C4A8]">Severity</label>
                <select
                  value={draft.severity}
                  onChange={(e) => setDraft({ ...draft, severity: e.target.value })}
                  className="mt-1.5 w-full input-dark px-3 py-2 text-xs text-white"
                >
                  {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => (
                    <option key={s} value={s} className="bg-[#111118] text-white">{s}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#D4C4A8]">Legal Reference / Act Citation</label>
                <input
                  type="text"
                  value={draft.legalReference}
                  onChange={(e) => setDraft({ ...draft, legalReference: e.target.value })}
                  placeholder="Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6(1)"
                  className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#252538] bg-[#161622]">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-xs text-[#8E8271] hover:text-white font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                className="btn-gold px-5 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer"
              >
                Save Rule to Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
