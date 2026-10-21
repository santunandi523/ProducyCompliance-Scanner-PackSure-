import { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/common/StatCard";
import { ClipboardList, CheckCircle2, AlertTriangle, Bell, Sun } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [notif, setNotif] = useState(true);
  const [theme, setTheme] = useState("Light");
  const [lang, setLang] = useState("English");

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <PageHeader kicker="Account" title="Officer Profile" subtitle="Your enforcement credentials, preferences, and recent activity summary." />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white rounded-xl border border-slate-200 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-display font-extrabold text-3xl mx-auto">{user?.name?.[0] || "O"}</div>
          <div className="mt-3 font-display font-bold text-lg text-slate-900">{user?.name}</div>
          <div className="text-sm text-slate-500">{user?.role}</div>
          <div className="mt-4 text-left text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-slate-500">Department</span><span className="font-semibold text-slate-800">{user?.department}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-semibold text-slate-800">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-semibold text-slate-800">{user?.phone}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Employee ID</span><span className="font-mono font-semibold text-slate-800">{user?.employeeId}</span></div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="font-display font-bold text-slate-900">Preferences</div>
            <div className="mt-4 space-y-4">
              <PrefRow icon={Bell} title="Notifications" desc="Get alerted when inspections require your review.">
                <button onClick={() => setNotif((v) => !v)} className={`w-11 h-6 rounded-full transition-colors relative ${notif ? "bg-blue-600" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 ${notif ? "left-6" : "left-0.5"} w-5 h-5 bg-white rounded-full shadow transition-all`} />
                </button>
              </PrefRow>
              <PrefRow icon={Sun} title="Theme" desc="Interface color palette.">
                <select value={theme} onChange={(e) => setTheme(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"><option>Light</option><option>System</option></select>
              </PrefRow>
              <PrefRow icon={Bell} title="Language" desc="Officer console language.">
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"><option>English</option><option>हिन्दी</option><option>தமிழ்</option></select>
              </PrefRow>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Inspections" value={42} icon={ClipboardList} tone="blue" />
              <StatCard label="Compliant" value={31} icon={CheckCircle2} tone="emerald" />
              <StatCard label="Flagged" value={7} icon={AlertTriangle} tone="amber" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrefRow({ icon: Icon, title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><Icon className="w-4 h-4 text-slate-600" /></div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{desc}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
