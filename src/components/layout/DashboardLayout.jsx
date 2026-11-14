import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Scan, Package, FileSearch, AlertTriangle,
  FileText, Scale, Users as UsersIcon, User, LogOut, Bell,
  ShieldCheck, Circle, Search, Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scan Product", icon: Scan },
  { to: "/products", label: "Products", icon: Package },
  { to: "/history", label: "Inspections", icon: FileSearch },
  { to: "/violations", label: "Violations", icon: AlertTriangle },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/rules", label: "Rules", icon: Scale },
  { to: "/audit", label: "Audit Logs", icon: ShieldCheck },
  { to: "/users", label: "Users", icon: UsersIcon },
  { to: "/profile", label: "Profile", icon: User },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role?.toUpperCase()?.includes("ADMIN");
  const displayName = user?.fullName || user?.name || user?.username || "Officer";
  const displayRole = isAdmin ? "Admin Officer" : "Enforcement Officer";

  const navItems = NAV.filter(({ to }) => {
    if (to === "/users" || to === "/audit" || to === "/rules") {
      return isAdmin;
    }
    return true;
  });

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0F] text-[#F5E8C7]">
      {/* Sidebar */}
      <aside
        className="hidden md:flex md:flex-col w-64 bg-[#0E0E16] text-[#C8B89A] shrink-0 sticky top-0 h-screen border-r border-[#D4A017]/15 z-20"
        data-testid="app-sidebar"
      >
        {/* Brand header */}
        <div className="px-6 pt-6 pb-5 flex items-center gap-3.5 border-b border-[#252538]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A017] via-[#F5C842] to-[#C9930A] p-[1.5px] shadow-[0_0_15px_rgba(212,160,23,0.3)]">
            <div className="w-full h-full rounded-[10px] bg-[#0A0A0F] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#F5C842]" strokeWidth={2.2} />
            </div>
          </div>
          <div>
            <div className="font-display font-black text-white text-lg tracking-tight flex items-center gap-1">
              Pack<span className="text-gold-shimmer">Sure</span>
            </div>
            <div className="text-[9px] tracking-[0.18em] uppercase text-[#D4A017] font-semibold mt-0.5">
              Legal Metrology Authority
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={`nav-${to.replace("/", "")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#D4A017]/12 text-[#F5C842] border-l-2 border-[#D4A017] shadow-[0_0_16px_rgba(212,160,23,0.12)] font-bold pl-3"
                    : "text-[#C8B89A] hover:bg-[#1E1E2E]/60 hover:text-white hover:border-l-2 hover:border-[#7C3AED]/50 hover:pl-3"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      isActive ? "text-[#F5C842]" : "text-[#8E8271]"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Officer Status Panel */}
        <div className="p-4 border-t border-[#252538] text-xs space-y-3 bg-[#0A0A0F]/60">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] text-[#9E927C]">System Status:</span>
            </div>
            <span className="text-emerald-400 font-semibold text-[11px]">Operational</span>
          </div>

          <div className="rounded-xl border border-[#D4A017]/15 bg-[#161622]/80 p-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="text-[9px] uppercase tracking-widest text-[#8E8271] font-bold">
                Active Session
              </div>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/30">
                {isAdmin ? "ADMIN" : "OFFICER"}
              </span>
            </div>
            <div className="text-white text-sm font-bold mt-1 truncate">{displayName}</div>
            <div className="text-[#D4A017] text-xs font-semibold">{displayRole}</div>
          </div>

          <button
            data-testid="logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#D4A017]/20 bg-[#1E1E2E]/60 hover:bg-[#252538] hover:border-[#D4A017]/40 text-[#F5E8C7] hover:text-[#F5C842] text-xs font-bold transition-all group cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-[#D4A017]" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0F]">
        {/* Topbar */}
        <header className="h-16 bg-[#0E0E16]/85 backdrop-blur-md border-b border-[#D4A017]/15 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden md:flex items-center gap-2 bg-[#161622] border border-[#D4A017]/15 rounded-xl px-3.5 py-2 w-80 shadow-inner focus-within:border-[#D4A017] focus-within:shadow-[0_0_12px_rgba(212,160,23,0.15)] transition-all">
              <Search className="w-4 h-4 text-[#8E8271]" />
              <input
                className="bg-transparent outline-none text-xs text-[#F5E8C7] flex-1 placeholder:text-[#6E6454]"
                placeholder="Search inspections, commodities, rules..."
                data-testid="topbar-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Standalone Cloud Demo Mode indicator */}
            {typeof window !== "undefined" && localStorage.getItem("packsure_demo_mode") === "true" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/40" title="Running in Standalone Cloud Demo mode with emulated PCR 2011 records. Connect backend via VITE_API_BASE_URL to enable real-time local OCR.">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-ping" />
                Cloud Preview Mode
              </span>
            )}

            {/* Quick action button in header */}
            <button
              onClick={() => navigate("/scan")}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-gold text-xs font-bold"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>New Inspection</span>
            </button>

            {/* Notification bell */}
            <button
              className="relative w-9 h-9 rounded-xl border border-[#252538] bg-[#161622] hover:bg-[#1E1E2E] hover:border-[#D4A017]/30 flex items-center justify-center transition-all cursor-pointer"
              data-testid="notifications-btn"
            >
              <Bell className="w-4 h-4 text-[#C8B89A]" strokeWidth={1.75} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4A017] rounded-full shadow-[0_0_8px_#D4A017]" />
            </button>

            {/* Officer Avatar & Badge */}
            <div className="flex items-center gap-3 pl-3.5 border-l border-[#252538]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A017] via-[#9333EA] to-[#6B21A8] p-[1.5px] shadow-sm">
                <div className="w-full h-full rounded-[10px] bg-[#0A0A0F] flex items-center justify-center text-white font-extrabold text-sm">
                  {displayName[0]?.toUpperCase() || "O"}
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-white leading-tight">{displayName}</div>
                <div className="text-[10px] text-[#D4A017] font-semibold">{displayRole}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
