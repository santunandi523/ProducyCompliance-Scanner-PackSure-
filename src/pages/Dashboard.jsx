import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import {
  ClipboardList, CheckCircle2, HelpCircle, AlertTriangle, Package,
  Scan, FileText, ArrowRight, Activity
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { dashboardService } from "@/services/dashboardService";

const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444"];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalInspections: 0,
    todayInspections: 0,
    needsReview: 0,
    potentialViolations: 0,
    compliant: 0,
    productsScanned: 0,
  });
  const [violationCategories, setViolationCategories] = useState([]);
  const [recentInspections, setRecentInspections] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sum, viols, rec, hlth] = await Promise.allSettled([
          dashboardService.getSummary(),
          dashboardService.getViolationCategories(),
          dashboardService.getRecentInspections(),
          dashboardService.getHealth(),
        ]);

        if (sum.status === "fulfilled") setStats(sum.value);
        if (viols.status === "fulfilled") setViolationCategories(viols.value);
        if (rec.status === "fulfilled") setRecentInspections(rec.value);
        if (hlth.status === "fulfilled") setHealth(hlth.value);
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      }
    }
    loadDashboardData();
  }, []);

  const pieData = [
    { name: "Compliant", value: stats.compliant || 0 },
    { name: "Needs Review", value: stats.needsReview || 0 },
    { name: "Potential Violation", value: stats.potentialViolations || 0 },
  ];

  const first = (user?.fullName || user?.username || "Officer").split(" ")[0];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        kicker={`Good day, ${first}`}
        title="Inspection Operations Center"
        subtitle="AI-assisted Legal Metrology enforcement metrics. All statutory actions are verified by authorized officers."
        actions={
          <div className="flex items-center gap-3">
            {health && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg border border-slate-200">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>DB: <strong>{health.database}</strong></span>
                <span>·</span>
                <span>AI: <strong>{health.aiService}</strong></span>
              </div>
            )}
            <button
              onClick={() => navigate("/scan")}
              data-testid="start-inspection-btn"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              <Scan className="w-4 h-4" /> Start Inspection
            </button>
          </div>
        }
      />

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Scan Commodity", desc: "Launch camera or upload package photos.", icon: Scan, to: "/scan", tone: "bg-blue-600 text-white" },
          { label: "Review Violations", desc: "Examine potential PCR non-compliance.", icon: AlertTriangle, to: "/violations", tone: "bg-white text-slate-900" },
          { label: "Inspection History", desc: "Access finalized audits and PDF reports.", icon: FileText, to: "/history", tone: "bg-white text-slate-900" },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => navigate(c.to)}
            data-testid={`quick-${c.to.replace("/", "")}`}
            className={`text-left rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 ${c.tone}`}
          >
            <div className="flex items-center justify-between">
              <c.icon className="w-6 h-6" strokeWidth={1.75} />
              <ArrowRight className="w-4 h-4 opacity-70" />
            </div>
            <div className="mt-6 font-display font-bold text-lg">{c.label}</div>
            <div className={`text-sm mt-1 ${c.tone.includes("white") ? "text-slate-500" : "text-blue-100"}`}>{c.desc}</div>
          </button>
        ))}
      </div>

      {/* Real Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard testId="stat-total" label="Total Inspections" value={stats.totalInspections} delta={`${stats.todayInspections} today`} icon={ClipboardList} tone="blue" />
        <StatCard testId="stat-compliant" label="Compliant" value={stats.compliant} delta="Passed all PCR rules" icon={CheckCircle2} tone="emerald" />
        <StatCard testId="stat-review" label="Needs Review" value={stats.needsReview} delta="Awaiting officer" icon={HelpCircle} tone="amber" />
        <StatCard testId="stat-violations" label="Potential Issues" value={stats.potentialViolations} delta="Flagged by rule engine" icon={AlertTriangle} tone="red" />
        <StatCard testId="stat-products" label="Unique Products" value={stats.productsScanned} delta="Active database catalog" icon={Package} tone="slate" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Compliance Distribution Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="font-display font-bold text-slate-900">Compliance Distribution</div>
            <span className="text-xs text-slate-500">Live Database</span>
          </div>
          <div className="h-56 mt-2">
            {stats.totalInspections > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((e, idx) => (
                      <Cell key={e.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No inspections recorded yet. Start a scan!
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-slate-100 pt-3">
            {pieData.map((p) => (
              <div key={p.name}>
                <div className="text-[11px] text-slate-500">{p.name}</div>
                <div className="text-sm font-bold text-slate-900">{p.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Violation Categories Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="font-display font-bold text-slate-900">Common PCR Declarations Flagged</div>
            <span className="text-xs text-slate-500">Rule Engine Analytics</span>
          </div>
          <div className="h-64 mt-2">
            {violationCategories.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={violationCategories}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No recurring violations recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-display font-bold text-lg text-slate-900">Recent Inspections</div>
            <div className="text-xs text-slate-500">Chronological record of enforcement scans</div>
          </div>
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">
              <tr>
                <th className="py-2.5 px-4">Inspection #</th>
                <th className="py-2.5 px-4">Commodity / Product</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Score</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInspections.length > 0 ? (
                recentInspections.slice(0, 5).map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                      {ins.inspectionNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {ins.product?.name || "Packaged Product"}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {ins.location || "Retail Market"}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {ins.createdAt ? new Date(ins.createdAt).toLocaleString() : "Just now"}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {ins.screeningScore} / 100
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ins.finalStatus || "PENDING"} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/inspections/${ins.id}`)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No inspections recorded yet. Start an inspection to generate live data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
