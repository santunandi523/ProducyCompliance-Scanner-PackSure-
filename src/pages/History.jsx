import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { inspectionService } from "@/services/inspectionService";
import { useAuth } from "@/context/AuthContext";
import { Search, Loader2, ShieldCheck, User, Filter, ArrowRight } from "lucide-react";

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");

  const isAdmin = (user?.role || "").toUpperCase().includes("ADMIN");

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
    const officerName = i.user?.fullName || i.user?.username || "";
    const matchesQuery = !q ||
      prodName.toLowerCase().includes(q.toLowerCase()) ||
      insNum.toLowerCase().includes(q.toLowerCase()) ||
      officerName.toLowerCase().includes(q.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 animate-fade-in">
      <PageHeader
        kicker={isAdmin ? "Department Audit Trail" : "Personal Audit Trail"}
        title={isAdmin ? "All Enforcement Inspections" : "Your Inspections"}
        subtitle={
          isAdmin
            ? "Comprehensive immutable record of all package inspections conducted across all enforcement circles."
            : "Complete history of package inspections and determinations performed by your officer account."
        }
      />

      <div className="bg-[#111118] border border-[#D4A017]/20 rounded-2xl p-4 flex flex-wrap gap-3.5 items-center shadow-xl">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 flex-1 min-w-[240px] input-dark">
          <Search className="w-4 h-4 text-[#8E8271]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isAdmin ? "Search by commodity, ID, or officer..." : "Search by commodity or Inspection ID..."}
            className="bg-transparent outline-none text-xs text-white placeholder:text-[#6E6454] flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#D4A017]" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-dark px-3 py-2 text-xs font-bold text-white focus:outline-none"
          >
            {["All", "COMPLIANT", "POTENTIAL_NON_COMPLIANCE", "NEEDS_FURTHER_REVIEW"].map((c) => (
              <option key={c} value={c} className="bg-[#111118] text-white">
                {c.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#111118] border border-[#D4A017]/15 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-[#8E8271]">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2.5 text-[#F5C842]" />
            <span className="text-xs">Loading inspection records from secure database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-dark">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left">Inspection ID</th>
                  <th className="px-5 py-3.5 text-left">Commodity</th>
                  {isAdmin && <th className="px-5 py-3.5 text-left">Inspecting Officer</th>}
                  <th className="px-5 py-3.5 text-left">Circle / Location</th>
                  <th className="px-5 py-3.5 text-left">Date &amp; Time</th>
                  <th className="px-5 py-3.5 text-left">Score</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252538]/60">
                {rows.length > 0 ? (
                  rows.map((i) => (
                    <tr key={i.id} className="transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#F5C842]">
                        {i.inspectionNumber}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-white">
                        {i.product?.name || "Packaged Commodity"}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-xs">
                          <span className="inline-flex items-center gap-1.5 font-medium px-2.5 py-0.5 rounded-md bg-[#1E1E2E] text-[#D4C4A8] border border-[#2A2A3D]">
                            <User className="w-3 h-3 text-[#D4A017]" />
                            {i.user?.fullName || i.user?.username || "Enforcement Officer"}
                          </span>
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-xs text-[#9E927C]">{i.location || "Enforcement Circle 1"}</td>
                      <td className="px-5 py-3.5 text-xs text-[#9E927C]">
                        {i.createdAt ? new Date(i.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 font-black text-white">
                        <span className={i.screeningScore >= 80 ? "text-emerald-400" : i.screeningScore >= 50 ? "text-[#F5C842]" : "text-rose-400"}>
                          {i.screeningScore}
                        </span>
                        <span className="text-[#6E6454] font-normal text-xs"> / 100</span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={i.finalStatus || i.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => navigate(`/inspections/${i.id}`)}
                          className="text-xs font-bold text-[#F5C842] hover:text-white px-2.5 py-1 rounded-lg bg-[#D4A017]/10 hover:bg-[#D4A017]/20 border border-[#D4A017]/20 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="text-center py-14 text-xs text-[#8E8271]">
                      No inspections found matching your search criteria.
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
