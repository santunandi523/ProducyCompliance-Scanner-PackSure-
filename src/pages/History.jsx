import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { inspectionService } from "@/services/inspectionService";
import { Search, Loader2 } from "lucide-react";

export default function History() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function load() {
      try {
        const data = await inspectionService.listInspections();
        setInspections(data || []);
      } catch (e) {
        console.error("Failed to load inspections:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rows = inspections.filter((i) => {
    const matchesStatus = status === "All" || i.finalStatus === status;
    const prodName = i.product?.name || "Packaged Commodity";
    const insNum = i.inspectionNumber || "";
    const matchesQuery = !q || prodName.toLowerCase().includes(q.toLowerCase()) || insNum.toLowerCase().includes(q.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        kicker="Audit Records"
        title="Inspection History"
        subtitle="Complete immutable trail of all Legal Metrology commodity inspections and verification determinations."
      />

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by commodity or Inspection ID…"
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          {["All", "COMPLIANT", "POTENTIAL_NON_COMPLIANCE", "NEEDS_FURTHER_REVIEW"].map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading inspection records...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Inspection ID</th>
                <th className="text-left px-5 py-3 font-semibold">Commodity</th>
                <th className="text-left px-5 py-3 font-semibold">Location</th>
                <th className="text-left px-5 py-3 font-semibold">Date & Time</th>
                <th className="text-left px-5 py-3 font-semibold">Score</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((i) => (
                  <tr key={i.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-mono text-xs text-blue-600 font-semibold">{i.inspectionNumber}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{i.product?.name || "Packaged Product"}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{i.location || "Delhi Zone"}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {i.createdAt ? new Date(i.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">{i.screeningScore} / 100</td>
                    <td className="px-5 py-3"><StatusBadge status={i.finalStatus || i.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => navigate(`/inspections/${i.id}`)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    No inspection records found.
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
