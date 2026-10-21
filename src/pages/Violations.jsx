import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import StatCard from "@/components/common/StatCard";
import { violationService } from "@/services/violationService";
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [sev, setSev] = useState("All");

  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let active = true;
    violationService.getAllViolations(status === "All" ? null : status)
      .then((data) => {
        if (active) {
          setViolations(data || []);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Failed to load violations:", e);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, refreshKey]);

  const handleAction = async (id, action) => {
    try {
      if (action === "CONFIRM") {
        await violationService.confirmViolation(id, "Confirmed by Officer");
        toast.success("Violation confirmed");
      } else {
        await violationService.rejectViolation(id, "Dismissed by Officer");
        toast.info("Violation dismissed");
      }
      refresh();
    } catch (e) {
      toast.error(e.message || "Failed to update violation");
    }
  };

  const rows = violations.filter(
    (v) => sev === "All" || v.severity === sev
  );

  const count = (s) => violations.filter((v) => v.status === s).length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        kicker="Enforcement"
        title="Violations Management"
        subtitle="Triage potential non-compliance items surfaced by AI-assisted screening. Officer verified as final."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending Review" value={count("PENDING") + count("REVIEW")} icon={AlertTriangle} tone="amber" />
        <StatCard label="Confirmed" value={count("CONFIRMED")} icon={XCircle} tone="red" />
        <StatCard label="Rejected / Dismissed" value={count("REJECTED")} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Total Tracked" value={violations.length} icon={HelpCircle} tone="blue" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          {["All", "PENDING", "CONFIRMED", "REJECTED", "REVIEW"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sev}
          onChange={(e) => setSev(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          {["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading violations...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Violation ID</th>
                <th className="text-left px-5 py-3 font-semibold">Field / Requirement</th>
                <th className="text-left px-5 py-3 font-semibold">Severity</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Notes / Reasoning</th>
                <th className="text-right px-5 py-3 font-semibold">Officer Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-blue-600 font-semibold">V-{v.id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{v.fieldName.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3"><StatusBadge status={v.severity} /></td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      v.status === "CONFIRMED"
                        ? "bg-rose-100 text-rose-800"
                        : v.status === "REJECTED"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs max-w-xs truncate">
                    {v.officerNotes || "Identified during AI rule screening."}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {v.status !== "CONFIRMED" && (
                      <button
                        onClick={() => handleAction(v.id, "CONFIRM")}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 mr-3"
                      >
                        Confirm
                      </button>
                    )}
                    {v.status !== "REJECTED" && (
                      <button
                        onClick={() => handleAction(v.id, "REJECT")}
                        className="text-xs font-medium text-slate-600 hover:text-slate-800"
                      >
                        Dismiss
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No violations found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
