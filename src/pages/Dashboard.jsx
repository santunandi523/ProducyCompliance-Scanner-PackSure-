import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import {
  ClipboardList, CheckCircle2, HelpCircle, AlertTriangle, Package,
  Scan, FileText, ArrowRight, Activity, Sparkles, TrendingUp
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { dashboardService } from "@/services/dashboardService";

const PIE_COLORS = ["#34D399", "#FCD34D", "#F87171"];

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

  const isAdmin = (user?.role || "").toUpperCase().includes("ADMIN");
  const displayName = user?.fullName || user?.name || user?.username || "Officer";
  const first = displayName.split(" ")[0];

  return (
    <div className="max-w-[1440px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker={`Official Session: ${first}`}
        title={isAdmin ? "Department Operations Command" : "Officer Enforcement Console"}
        subtitle={
          isAdmin
            ? "AI-assisted Legal Metrology enforcement metrics across all officers, circles, and package inspections."
            : "Your personal inspection operations center. Tracking your field scans, PCR rule checks, and pending determinations."
        }
        actions={
          <div className="flex items-center gap-3">
            {health && (
              <div
                className="hidden sm:flex items-center gap-2.5 text-xs px-3.5 py-2 rounded-xl border border-[#D4A017]/20 bg-[#111118]/80 backdrop-blur-md shadow-sm"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[#9E927C]">Database: <strong className="text-white">{health.database}</strong></span>
                <span className="text-[#3D382F]">·</span>
                <span className="text-[#9E927C]">AI Service: <strong className="text-[#F5C842]">{health.aiService}</strong></span>
              </div>
            )}
            <button
              onClick={() => navigate("/scan")}
              data-testid="start-inspection-btn"
              className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>Start Inspection</span>
            </button>
          </div>
        }
      />

      {/* Quick Action Cards with Gold & Purple Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Scan Commodity",
            desc: "Launch camera capture or upload package panels for instant OCR analysis.",
            icon: Scan,
            to: "/scan",
            theme: "gold",
          },
          {
            label: "Review Violations",
            desc: "Examine potential PCR non-compliances, unit sale price errors, and missing declarations.",
            icon: AlertTriangle,
            to: "/violations",
            theme: "purple",
          },
          {
            label: "Inspection Archive",
            desc: "Access finalized audits, evidence photos, and download tamper-proof PDF reports.",
            icon: FileText,
            to: "/history",
            theme: "dark",
          },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => navigate(c.to)}
            data-testid={`quick-${c.to.replace("/", "")}`}
            className="text-left rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group relative overflow-hidden"
            style={
              c.theme === "gold"
                ? {
                    background: 'linear-gradient(135deg, #1A1708 0%, #2A220A 100%)',
                    border: '1px solid rgba(212,160,23,0.35)',
                    boxShadow: '0 8px 32px rgba(212,160,23,0.12)',
                  }
                : c.theme === "purple"
                ? {
                    background: 'linear-gradient(135deg, #180D28 0%, #221338 100%)',
                    border: '1px solid rgba(124,58,237,0.35)',
                    boxShadow: '0 8px 32px rgba(124,58,237,0.12)',
                  }
                : {
                    background: '#111118',
                    border: '1px solid rgba(212,160,23,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }
            }
          >
            <div className="flex items-center justify-between">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  background:
                    c.theme === "gold"
                      ? 'rgba(212,160,23,0.2)'
                      : c.theme === "purple"
                      ? 'rgba(124,58,237,0.2)'
                      : 'rgba(255,255,255,0.05)',
                }}
              >
                <c.icon
                  className="w-6 h-6"
                  strokeWidth={2}
                  style={{
                    color: c.theme === "gold" ? '#F5C842' : c.theme === "purple" ? '#C084FC' : '#D4A017',
                  }}
                />
              </div>
              <ArrowRight
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                style={{
                  color: c.theme === "gold" ? '#F5C842' : c.theme === "purple" ? '#C084FC' : '#8E8271',
                }}
              />
            </div>
            <div className="mt-5 font-display font-extrabold text-lg text-white group-hover:text-[#F5E8C7] transition-colors">
              {c.label}
            </div>
            <div className="text-xs mt-1.5 leading-relaxed text-[#C8B89A]">{c.desc}</div>
          </button>
        ))}
      </div>

      {/* Real Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          testId="stat-total"
          label={isAdmin ? "Total Inspections" : "Your Total Scans"}
          value={stats.totalInspections}
          delta={`${stats.todayInspections} today`}
          icon={ClipboardList}
          tone="gold"
        />
        <StatCard
          testId="stat-compliant"
          label="Compliant"
          value={stats.compliant}
          delta="Passed all PCR rules"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          testId="stat-review"
          label="Needs Review"
          value={stats.needsReview}
          delta="Awaiting officer"
          icon={HelpCircle}
          tone="amber"
        />
        <StatCard
          testId="stat-violations"
          label="Potential Issues"
          value={stats.potentialViolations}
          delta="Flagged by rule engine"
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          testId="stat-products"
          label="Unique Products"
          value={stats.productsScanned}
          delta={isAdmin ? "Active database catalog" : "Catalog items scanned"}
          icon={Package}
          tone="blue"
        />
      </div>

      {/* Analytics & Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Compliance Distribution Pie */}
        <div
          className="rounded-2xl p-6 lg:col-span-1 border border-[#D4A017]/15 bg-[#111118] shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="font-display font-bold text-white text-base">Compliance Distribution</div>
            <span className="text-[11px] font-mono text-[#D4A017] uppercase tracking-wider bg-[#D4A017]/10 px-2.5 py-0.5 rounded-full border border-[#D4A017]/20">
              Live Data
            </span>
          </div>
          <div className="h-56 mt-4">
            {stats.totalInspections > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={55} outerRadius={82} dataKey="value" paddingAngle={4}>
                    {pieData.map((e, idx) => (
                      <Cell key={e.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="#111118" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A26',
                      border: '1px solid rgba(212,160,23,0.3)',
                      borderRadius: '0.75rem',
                      color: '#F5E8C7',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-[#8E8271]">
                <Package className="w-8 h-8 text-[#5A5243] mb-2" />
                No inspections recorded yet. Start a scan!
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center pt-4 border-t border-[#252538]">
            {pieData.map((p, idx) => (
              <div key={p.name} className="p-2 rounded-xl bg-[#161622]">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9E927C] font-semibold">
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[idx] }} />
                  {p.name}
                </div>
                <div className="text-sm font-extrabold text-white mt-1">{p.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Violation Categories Bar Chart */}
        <div
          className="rounded-2xl p-6 lg:col-span-2 border border-[#D4A017]/15 bg-[#111118] shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-white text-base">Common PCR Declarations Flagged</div>
              <div className="text-xs text-[#9E927C] mt-0.5">Statutory non-compliance pattern frequency</div>
            </div>
            <span className="text-[11px] font-mono text-[#C084FC] uppercase tracking-wider bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-full border border-[#7C3AED]/25">
              Rule Engine
            </span>
          </div>
          <div className="h-64 mt-4">
            {violationCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={violationCategories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6E6454" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6E6454" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A26',
                      border: '1px solid rgba(212,160,23,0.3)',
                      borderRadius: '0.75rem',
                      color: '#F5E8C7',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#D4A017" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-[#8E8271]">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-2" />
                No recurring statutory violations recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div
        className="rounded-2xl p-6 border border-[#D4A017]/15 bg-[#111118] shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-display font-black text-lg text-white">Recent Inspection Audits</div>
            <div className="text-xs text-[#9E927C]">Chronological ledger of screening operations</div>
          </div>
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-bold text-[#F5C842] hover:text-[#D4A017] flex items-center gap-1 transition-colors"
          >
            <span>View all audits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm table-dark">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Inspection #</th>
                <th className="py-3 px-4">Commodity / Product</th>
                {isAdmin && <th className="py-3 px-4">Auditing Officer</th>}
                <th className="py-3 px-4">Enforcement Circle</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Statutory Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252538]/60">
              {recentInspections.length > 0 ? (
                recentInspections.slice(0, 6).map((ins) => (
                  <tr key={ins.id} className="transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#F5C842]">
                      {ins.inspectionNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {ins.product?.name || "Packaged Commodity"}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-semibold px-2 py-0.5 rounded-md bg-[#1E1E2E] text-[#D4C4A8] border border-[#2A2A3D]">
                          {ins.user?.fullName || ins.user?.username || "Officer"}
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-xs text-[#9E927C]">
                      {ins.location || "Enforcement Circle 1"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#9E927C]">
                      {ins.createdAt ? new Date(ins.createdAt).toLocaleString() : "Just now"}
                    </td>
                    <td className="py-3.5 px-4 font-black text-white">
                      <span className={ins.screeningScore >= 80 ? "text-emerald-400" : ins.screeningScore >= 50 ? "text-[#F5C842]" : "text-rose-400"}>
                        {ins.screeningScore}
                      </span>
                      <span className="text-[#6E6454] font-normal text-xs"> / 100</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ins.finalStatus || "PENDING"} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/inspections/${ins.id}`)}
                        className="text-xs font-bold text-[#F5C842] hover:text-white px-2.5 py-1 rounded-lg bg-[#D4A017]/10 hover:bg-[#D4A017]/20 border border-[#D4A017]/20 transition-all cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-10 text-xs text-[#8E8271]">
                    No inspections recorded yet. Start an inspection to generate live audit data.
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
