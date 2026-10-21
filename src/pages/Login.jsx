import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, ScanLine, FileCheck2, Scale, Lock, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("officer");
  const [password, setPassword] = useState("Officer@123");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(username, password);
      toast.success(`Welcome, ${user.fullName || user.username}`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid credentials or service unavailable");
    } finally {
      setSubmitting(false);
    }
  };

  const setCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden md:flex flex-col justify-between bg-[#0A192F] text-white p-10 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <div className="font-display font-extrabold text-2xl leading-none">PackSure</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-blue-300 mt-1">Legal Metrology · Govt. of India</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-blue-300 font-semibold">National Compliance Platform</div>
            <h1 className="font-display font-extrabold text-4xl lg:text-5xl mt-3 leading-tight">
              AI-assisted screening<br />for packaged<br />commodity compliance.
            </h1>
            <p className="text-slate-300 mt-4 text-base max-w-md">
              Capture or upload package evidence. PackSure performs computer vision quality checks, deep learning OCR, Legal Metrology rule evaluations, and cryptographic report generation.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: ScanLine, label: "PaddleOCR v4" },
              { icon: Scale, label: "PCR 2011 Rules" },
              { icon: FileCheck2, label: "SHA-256 Reports" },
            ].map((f) => (
              <div key={f.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <f.icon className="w-4 h-4 text-blue-300 mb-2" strokeWidth={1.75} />
                <div className="text-xs font-semibold">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-slate-400 leading-relaxed max-w-md">
          PackSure is an enforcement support system. Final statutory determination is subject to authorized officer verification under the Legal Metrology Act, 2009.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="md:hidden mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0A192F] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="font-display font-extrabold text-2xl text-slate-900">PackSure</div>
          </div>

          <div className="text-[11px] uppercase tracking-widest text-blue-700 font-semibold">Official Sign-In</div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 mt-1">Enforcement Portal</h2>
          <p className="text-slate-500 text-sm mt-1.5">Enter your officer credentials to access inspection workflows.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3.5 py-2.5 text-sm text-slate-900"
                placeholder="officer"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative mt-1.5">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none px-3.5 py-2.5 text-sm text-slate-900 pr-10"
                  placeholder="••••••••"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Authenticating..." : "Sign In"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Preset Accounts</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCredentials("officer", "Officer@123")}
                className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-2.5 rounded border border-slate-200 text-left font-medium transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Officer (Delhi)
              </button>
              <button
                type="button"
                onClick={() => setCredentials("admin", "Admin@123")}
                className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 py-1.5 px-2.5 rounded border border-slate-200 text-left font-medium transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Admin (HQ)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}