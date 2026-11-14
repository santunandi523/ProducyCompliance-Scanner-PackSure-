import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/common/StatCard";
import { ClipboardList, CheckCircle2, AlertTriangle, KeyRound, ShieldCheck, RefreshCw, Lock, MapPin, BadgeCheck, Sparkles } from "lucide-react";
import { userService } from "@/services/userService";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return toast.error("Please fill in both current and new password");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters long");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setSavingPassword(true);
    try {
      await userService.changeSelfPassword(currentPassword, newPassword);
      toast.success("Security password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const displayName = profile?.fullName || user?.fullName || user?.name || user?.username || "Officer";
  const isAdmin = (profile?.role || user?.role || "").toUpperCase().includes("ADMIN");

  return (
    <div className="max-w-[1280px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker="Account & Statutory Credentials"
        title="Enforcement Officer Profile"
        subtitle="Your official enforcement credentials, assigned jurisdiction circle, and personalized scan performance ledger."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Officer Card */}
        <div className="md:col-span-1 bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-6 shadow-xl relative overflow-hidden">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4A017] via-[#9333EA] to-[#6B21A8] p-[2px] mx-auto shadow-lg">
              <div className="w-full h-full rounded-[14px] bg-[#0A0A0F] flex items-center justify-center font-display font-black text-3xl text-white">
                {displayName[0]?.toUpperCase()}
              </div>
            </div>
            <div className="mt-4 font-display font-black text-xl text-white">{displayName}</div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#D4A017]/15 text-[#F5C842] border border-[#D4A017]/30 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5C842]" />
              <span>{isAdmin ? "Admin Officer" : "Enforcement Officer"}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#252538] text-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[#8E8271] font-medium">Username</span>
              <span className="font-mono text-xs font-bold text-white">@{profile?.username || user?.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8E8271] font-medium">Badge / Employee ID</span>
              <span className="font-mono text-xs font-bold text-[#F5C842] bg-[#D4A017]/10 px-2 py-0.5 rounded border border-[#D4A017]/25">
                {profile?.employeeId || user?.employeeId || "LM-OFF-0101"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8E8271] font-medium">Jurisdiction</span>
              <span className="font-bold text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D4A017]" />
                {profile?.location || user?.location || "Enforcement Circle 1"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8E8271] font-medium">Official Email</span>
              <span className="font-semibold text-[#D4C4A8] truncate max-w-[190px]">
                {profile?.email || user?.email || `${profile?.username || user?.username}@packsure.gov.in`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8E8271] font-medium">Enforcement Status</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Service
              </span>
            </div>
          </div>
        </div>

        {/* Right Pane: Stats & Password Change */}
        <div className="md:col-span-2 space-y-6">
          {/* Real Work Performance Stats */}
          <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-display font-black text-lg text-white">Your Enforcement Ledger</div>
                <div className="text-xs text-[#9E927C]">Live performance telemetry computed exclusively for your officer badge</div>
              </div>
              <button
                onClick={loadProfile}
                disabled={loading}
                className="text-xs font-bold text-[#F5C842] hover:text-[#D4A017] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <StatCard
                label="Total Scans"
                value={profile?.totalScans ?? 0}
                delta="Conducted by you"
                icon={ClipboardList}
                tone="gold"
              />
              <StatCard
                label="Compliant"
                value={profile?.compliantScans ?? 0}
                delta="Passed PCR rules"
                icon={CheckCircle2}
                tone="emerald"
              />
              <StatCard
                label="Violations"
                value={profile?.violationScans ?? 0}
                delta="Flagged non-compliant"
                icon={AlertTriangle}
                tone="red"
              />
              <StatCard
                label="Accuracy Rate"
                value={`${profile?.complianceRate ?? 100}%`}
                delta="Compliance score"
                icon={BadgeCheck}
                tone="blue"
              />
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/20 p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#D4A017]/15 flex items-center justify-center text-[#F5C842]">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="font-display font-black text-lg text-white">Security &amp; Credentials</div>
            </div>
            <p className="text-xs text-[#9E927C] mb-6">
              Update your security password regularly to maintain statutory inspection audit trail integrity.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs font-semibold text-[#D4C4A8]">Current Password *</label>
                <div className="relative mt-1.5">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                    className="w-full input-dark px-3.5 py-2.5 text-xs text-white pr-10 focus:outline-none"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#6E6454] absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#D4C4A8]">New Password *</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="mt-1.5 w-full input-dark px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#D4C4A8]">Confirm Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="mt-1.5 w-full input-dark px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {savingPassword ? "Updating..." : "Update Security Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
