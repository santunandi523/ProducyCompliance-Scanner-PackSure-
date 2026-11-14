import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, ScanLine, FileCheck2, Scale, Lock, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and security password");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(username, password);
      toast.success(`Access Granted: Welcome, ${user.fullName || user.username}`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid credentials or authentication service offline");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0A0F] text-[#F5E8C7] flex flex-col md:grid md:grid-cols-2 grain-bg">
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D4A017]/15 blur-3xl pointer-events-none animate-pulse-gold" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#7C3AED]/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#9333EA]/10 blur-3xl pointer-events-none" />

      {/* Left panel - Brand & Industry Capabilities */}
      <div className="relative z-10 hidden md:flex flex-col justify-between p-12 lg:p-16 border-r border-[#D4A017]/15 bg-gradient-to-b from-[#111118]/80 via-[#0A0A0F]/90 to-[#111118]/80 backdrop-blur-sm">
        {/* Brand identity */}
        <div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A017] via-[#F5C842] to-[#C9930A] p-[1.5px] shadow-[0_0_20px_rgba(212,160,23,0.35)]">
              <div className="w-full h-full rounded-[10px] bg-[#0A0A0F] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#F5C842]" strokeWidth={2.2} />
              </div>
            </div>
            <div>
              <div className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
                Pack<span className="text-gold-shimmer">Sure</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/30 ml-2">Enterprise</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#D4A017] font-semibold mt-0.5">
                Legal Metrology Compliance Platform
              </div>
            </div>
          </div>
        </div>

        {/* Hero message & capabilities */}
        <div className="space-y-8 my-auto py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/25 text-[#F5C842] text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#F5C842]" />
            <span>Industrial Regulatory Verification Suite</span>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-4xl lg:text-5xl leading-[1.15] text-white">
              Automated screening <br />
              for packaged commodity <br />
              <span className="text-gold-shimmer">statutory compliance.</span>
            </h1>
            <p className="text-[#C8B89A] mt-5 text-base leading-relaxed max-w-lg">
              Capture or upload packaged goods evidence. PackSure executes local deep learning OCR, Legal Metrology (PCR 2011) automated cross-checks, multi-panel corroboration, and produces cryptographically verifiable audit reports.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3.5 max-w-lg pt-2">
            {[
              { icon: ScanLine, title: "RapidOCR PP-OCRv4", desc: "Local ONNX engine" },
              { icon: Scale, title: "PCR 2011 Rules", desc: "Automated verification" },
              { icon: FileCheck2, title: "Tamper-Evident", desc: "Audit trail reports" },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-[#D4A017]/15 bg-[#161622]/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-[#D4A017]/40 hover:bg-[#1C1C28]/80 hover:-translate-y-0.5 shadow-lg group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#D4A017]/10 flex items-center justify-center mb-2.5 group-hover:bg-[#D4A017]/20 transition-colors">
                  <f.icon className="w-4 h-4 text-[#F5C842]" strokeWidth={2} />
                </div>
                <div className="text-xs font-bold text-white leading-tight">{f.title}</div>
                <div className="text-[10px] text-[#8E8271] mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory disclaimer */}
        <div className="text-[11px] text-[#8E8271] leading-relaxed max-w-md pt-4 border-t border-[#252535]">
          Enforcement Support Platform engineered pursuant to the Legal Metrology Act, 2009 and Legal Metrology (Packaged Commodities) Rules, 2011. Final determinations subject to authorized officer review.
        </div>
      </div>

      {/* Right panel - Officer Authentication Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="md:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A017] to-[#C9930A] flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-extrabold text-xl text-white">PackSure</div>
              <div className="text-[9px] uppercase tracking-widest text-[#D4A017]">Legal Metrology Platform</div>
            </div>
          </div>

          {/* Form card */}
          <div className="card-dark backdrop-blur-xl bg-[#111118]/90 border border-[#D4A017]/20 rounded-2xl p-8 sm:p-9 shadow-[0_12px_48px_rgba(0,0,0,0.7)] relative overflow-hidden">
            {/* Subtle top edge gold highlight */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent opacity-80" />

            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#D4A017] font-bold">
                Official Sign-In
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#C084FC] font-mono bg-[#7C3AED]/15 px-2.5 py-0.5 rounded-full border border-[#7C3AED]/25">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-ping" />
                TLS Secured
              </div>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-2">
              Enforcement Console
            </h2>
            <p className="text-[#C8B89A] text-sm mt-1.5 leading-normal">
              Enter your officer credentials to access inspection registers and rule screening.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#D4C4A8] flex items-center gap-1.5 mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#D4A017]" />
                  Officer Username / Badge ID
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full input-dark px-4 py-3 text-sm text-white placeholder:text-[#5A5243] focus:border-[#D4A017] transition-all"
                  placeholder="e.g., admin or officer"
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4C4A8] flex items-center gap-1.5 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D4A017]" />
                  Security Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full input-dark px-4 py-3 text-sm text-white placeholder:text-[#5A5243] pr-10 focus:border-[#D4A017] transition-all"
                    placeholder="Enter official password"
                    autoComplete="current-password"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#8E8271] absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full btn-gold py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Authenticating Credentials...
                    </span>
                  ) : (
                    <>
                      <span>Authorize & Sign In</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-5 border-t border-[#252535]">
              <div className="flex items-start gap-3 bg-[#1C1C28]/70 border border-[#7C3AED]/20 rounded-xl p-3.5 text-xs text-[#C8B89A] leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-[#C084FC] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Protected Regulatory Terminal:</span> Access restricted to authorized personnel. Session activities are cryptographically audited under statutory governance.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
