import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { ruleService } from "@/services/ruleService";
import { Plus, X, Scale, Play, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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
      toast.success(`Rule ${draft.ruleCode} saved to database`);
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
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        kicker="Statutory Configuration"
        title="Legal Metrology Rule Engine"
        subtitle="PCR 2011 statutory compliance rules are database-driven, version-controlled, and testable against sample package declarations."
        actions={
          <button
            onClick={() => setOpen(true)}
            data-testid="add-rule-btn"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        }
      />

      {/* Rule Testing Sandbox Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-5 h-5 text-blue-600" />
          <h3 className="font-display font-bold text-slate-900">Rule Testing Sandbox</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">Interactive Evaluator</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Test how any statutory rule evaluates specific OCR values before applying it in live field inspections.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Select Rule</label>
            <select
              value={testRuleCode}
              onChange={(e) => setTestRuleCode(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {rules.map((r) => (
                <option key={r.ruleCode} value={r.ruleCode}>
                  {r.ruleCode} — {r.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Sample Declaration Value</label>
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              placeholder="e.g. ₹85.00 or 1800-222-3333"
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleTestRule}
              disabled={testing}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Test Evaluation
            </button>
          </div>
        </div>

        {testResult && (
          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm flex items-start gap-3">
            {testResult.result === "PASS" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>Result: {testResult.result}</span>
                <span className="text-xs font-normal text-slate-500 font-mono">({testResult.ruleCode})</span>
              </div>
              <p className="text-xs text-slate-700 mt-1">{testResult.reasoning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading statutory rules from database...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Rule Code</th>
                <th className="text-left px-5 py-3 font-semibold">Requirement</th>
                <th className="text-left px-5 py-3 font-semibold">Category</th>
                <th className="text-left px-5 py-3 font-semibold">Validation</th>
                <th className="text-left px-5 py-3 font-semibold">Version</th>
                <th className="text-left px-5 py-3 font-semibold">Severity</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-blue-700">{r.ruleCode}</td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-900">{r.title}</div>
                    <div className="text-xs text-slate-500">{r.legalReference}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{r.category}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 border border-slate-200 rounded">
                      {r.validationType}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-700">{r.version}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.severity} /></td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      r.active
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${r.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {r.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(r)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {r.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Rule Modal */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="font-display font-bold text-slate-900">Add Legal Metrology Rule</div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Rule Code</label>
                <input
                  type="text"
                  value={draft.ruleCode}
                  onChange={(e) => setDraft({ ...draft, ruleCode: e.target.value })}
                  placeholder="e.g. PC-CUSTOM-008"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Requirement Title</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Best Before Date"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Field Key</label>
                <input
                  type="text"
                  value={draft.fieldName}
                  onChange={(e) => setDraft({ ...draft, fieldName: e.target.value })}
                  placeholder="e.g. EXPIRY_DATE"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {["ALL", "FOOD", "COSMETIC", "HOUSEHOLD", "ELECTRONICS", "TEXTILE"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Validation Type</label>
                <select
                  value={draft.validationType}
                  onChange={(e) => setDraft({ ...draft, validationType: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {VALIDATION_TYPES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Severity</label>
                <select
                  value={draft.severity}
                  onChange={(e) => setDraft({ ...draft, severity: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Legal Reference / Act Citation</label>
                <input
                  type="text"
                  value={draft.legalReference}
                  onChange={(e) => setDraft({ ...draft, legalReference: e.target.value })}
                  placeholder="Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6(1)"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-semibold">
                Cancel
              </button>
              <button onClick={handleCreateRule} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
                Save Rule to Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
