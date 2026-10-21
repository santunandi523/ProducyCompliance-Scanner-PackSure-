import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Scan, Package, FileSearch, AlertTriangle,
  FileText, Scale, Users as UsersIcon, User, LogOut, Bell,
  ShieldCheck, Circle, Search
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

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#0A192F] text-slate-200 shrink-0 sticky top-0 h-screen" data-testid="app-sidebar">
        <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="font-display font-extrabold text-white text-lg leading-none">PackSure</div>
            <div className="text-[10px] tracking-[0.14em] uppercase text-blue-300/80 mt-1">Legal Metrology</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={`nav-${to.replace("/", "")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 text-xs text-slate-400 space-y-3">
          <div className="flex items-center gap-2">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
            <span>System Status: <span className="text-emerald-300 font-semibold">Operational</span></span>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Logged in</div>
            <div className="text-white text-sm font-semibold mt-0.5">{user?.name}</div>
            <div className="text-slate-400 text-xs">{user?.role}</div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-100 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-72">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                className="bg-transparent outline-none text-sm text-slate-700 flex-1 placeholder:text-slate-400"
                placeholder="Search inspections, products…"
                data-testid="topbar-search"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center" data-testid="notifications-btn">
              <Bell className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {user?.name?.[0] || "O"}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</div>
                <div className="text-[11px] text-slate-500">{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}