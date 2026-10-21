import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { auditService } from "@/services/auditService";
import { Loader2, User } from "lucide-react";

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
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        kicker="Compliance Security"
        title="Audit Logs & Integrity Ledger"
        subtitle="Append-only immutable record of system actions, officer verifications, report generations, and rule modifications."
      />

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700">Filter by Action:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
          >
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {filteredLogs.length} Events Recorded
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading system audit ledger...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Timestamp</th>
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-5 py-3 font-semibold">Action</th>
                <th className="text-left px-5 py-3 font-semibold">Target Entity</th>
                <th className="text-left px-5 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-slate-500 text-xs font-mono">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {log.username || "system"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs">
                    {log.entityType ? `${log.entityType} #${log.entityId || ""}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-700 text-xs max-w-md">
                    {log.details || "—"}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No audit records match the filter.
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
