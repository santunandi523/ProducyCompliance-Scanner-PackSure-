import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import StatCard from "@/components/common/StatCard";
import { violationService } from "@/services/violationService";
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle, Loader2, Filter } from "lucide-react";
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
        toast.success("Violation confirmed under PCR rules");
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
    <div className="max-w-[1440px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker="Statutory Enforcement"
        title="Violations & Non-Compliance Tracker"
        subtitle="Triage potential non-compliance items surfaced by AI-assisted screening. Official officer determination acts as final record."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending Review" value={count("PENDING") + count("REVIEW")} icon={AlertTriangle} tone="amber" />
        <StatCard label="Confirmed Violations" value={count("CONFIRMED")} icon={XCircle} tone="red" />
        <StatCard label="Dismissed / Cleared" value={count("REJECTED")} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Total Surfaced" value={violations.length} icon={HelpCircle} tone="gold" />
      </div>

      <div className="bg-[#111118] border border-[#D4A017]/20 rounded-2xl p-4 flex flex-wrap gap-3.5 items-center shadow-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#D4A017]" />
          <span className="text-xs font-bold text-[#9E927C]">Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-dark px-3 py-2 text-xs font-bold text-white focus:outline-none"
          >
            {["All", "PENDING", "CONFIRMED", "REJECTED", "REVIEW"].map((c) => (
              <option key={c} value={c} className="bg-[#111118] text-white">{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#9E927C]">Severity:</span>
          <select
            value={sev}
            onChange={(e) => setSev(e.target.value)}
            className="input-dark px-3 py-2 text-xs font-bold text-white focus:outline-none"
          >
            {["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((c) => (
              <option key={c} value={c} className="bg-[#111118] text-white">{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#111118] border border-[#D4A017]/15 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-[#8E8271]">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2.5 text-[#F5C842]" />
            <span className="text-xs">Loading statutory violation register...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-dark">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5">Violation ID</th>
                  <th className="text-left px-5 py-3.5">Field / Requirement</th>
                  <th className="text-left px-5 py-3.5">Severity</th>
                  <th className="text-left px-5 py-3.5">Status</th>
                  <th className="text-left px-5 py-3.5">Statutory Reasoning</th>
                  <th className="text-right px-5 py-3.5">Officer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252538]/60">
                {rows.map((v) => (
                  <tr key={v.id} className="transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-[#F5C842] font-bold">V-{v.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-white">{v.fieldName.replace(/_/g, " ")}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={v.severity} /></td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        v.status === "CONFIRMED"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : v.status === "REJECTED"
                          ? "bg-[#1E1E2E] text-[#8E8271] border-[#252538]"
                          : "bg-[#D4A017]/20 text-[#F5C842] border-[#D4A017]/40"
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#C8B89A] text-xs max-w-sm truncate">
                      {v.officerNotes || "Identified during automated Legal Metrology rule screening."}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {v.status !== "CONFIRMED" && (
                        <button
                          onClick={() => handleAction(v.id, "CONFIRM")}
                          className="text-xs font-bold text-rose-400 hover:text-rose-300 mr-3 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30 transition cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}
                      {v.status !== "REJECTED" && (
                        <button
                          onClick={() => handleAction(v.id, "REJECT")}
                          className="text-xs font-bold text-[#8E8271] hover:text-[#F5E8C7] px-2 py-1 rounded bg-[#1E1E2E] border border-[#252538] transition cursor-pointer"
                        >
                          Dismiss
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-[#8E8271] text-xs">
                      No violations found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
