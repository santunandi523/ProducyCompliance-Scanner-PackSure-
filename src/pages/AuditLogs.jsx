import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { auditService } from "@/services/auditService";
import { Loader2, User, Filter, ShieldCheck, Clock } from "lucide-react";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        const data = await auditService.getLogs();
        setLogs(data || []);
      } catch (e) {
        console.error("Failed to load audit logs:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredLogs = logs.filter(
    (l) => actionFilter === "ALL" || l.action === actionFilter
  );

  const actions = ["ALL", ...new Set(logs.map((l) => l.action))];

  return (
    <div className="max-w-[1440px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker="Statutory Integrity & Governance"
        title="Immutable System Audit Ledger"
        subtitle="Append-only regulatory record of inspection actions, officer verifications, report generations, and rule engine modifications."
      />

      <div className="bg-[#111118] border border-[#D4A017]/20 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[#D4A017]" />
          <label className="text-xs font-semibold text-[#D4C4A8]">Filter by Event Type:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-dark px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
          >
            {actions.map((a) => (
              <option key={a} value={a} className="bg-[#111118] text-white">{a}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-[#F5C842] font-mono font-bold bg-[#D4A017]/10 px-3 py-1 rounded-full border border-[#D4A017]/25">
          {filteredLogs.length} Events Logged
        </div>
      </div>

      <div className="bg-[#111118] border border-[#D4A017]/15 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-[#8E8271]">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2.5 text-[#F5C842]" />
            <span className="text-xs">Loading tamper-evident audit ledger...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-dark">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5">Timestamp</th>
                  <th className="text-left px-5 py-3.5">Officer / Principal</th>
                  <th className="text-left px-5 py-3.5">Action Event</th>
                  <th className="text-left px-5 py-3.5">Target Entity</th>
                  <th className="text-left px-5 py-3.5">Event Telemetry Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252538]/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="transition-colors">
                    <td className="px-5 py-3.5 text-[#9E927C] text-xs font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#D4A017]" />
                      <span>{log.username || "system"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/30 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#D4C4A8] text-xs font-mono">
                      {log.entityType ? `${log.entityType} #${log.entityId || ""}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[#C8B89A] text-xs max-w-lg leading-relaxed">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-[#8E8271] text-xs">
                      No audit events match the selected criteria.
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
