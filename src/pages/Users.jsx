import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import StatCard from "@/components/common/StatCard";
import {
  UserPlus, X, KeyRound, CheckCircle2, XCircle, ShieldCheck,
  RefreshCw, Users as UsersIcon, Briefcase, Eye, ChevronRight, Lock, MapPin
} from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/userService";
import { useNavigate } from "react-router-dom";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [openWorks, setOpenWorks] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userWorks, setUserWorks] = useState([]);
  const [loadingWorks, setLoadingWorks] = useState(false);

  const [draft, setDraft] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    employeeId: "",
    role: "ROLE_OFFICER",
    location: "Enforcement Circle 1",
  });

  const [newPassword, setNewPassword] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.listUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load enforcement officers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateOfficer = async () => {
    if (!draft.fullName.trim() || !draft.username.trim() || !draft.password.trim()) {
      return toast.error("Full name, username, and password are required");
    }
    try {
      await userService.createUser(draft);
      toast.success(`Officer ${draft.username} created successfully`);
      setOpenAdd(false);
      setDraft({
        fullName: "",
        username: "",
        email: "",
        password: "",
        employeeId: "",
        role: "ROLE_OFFICER",
        location: "Enforcement Circle 1",
      });
      loadUsers();
    } catch (err) {
      toast.error(err.message || "Failed to create officer");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    try {
      await userService.resetUserPassword(selectedUser.id, newPassword);
      toast.success(`Password reset for @${selectedUser.username}`);
      setOpenReset(false);
      setSelectedUser(null);
      setNewPassword("");
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await userService.changeUserStatus(user.id, newStatus);
      toast.success(`Officer @${user.username} status set to ${newStatus}`);
      loadUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleInspectWorks = async (u) => {
    setSelectedUser(u);
    setOpenWorks(true);
    setLoadingWorks(true);
    try {
      const works = await userService.getUserInspections(u.id);
      setUserWorks(works || []);
    } catch (err) {
      toast.error("Failed to load inspections for officer @" + u.username);
    } finally {
      setLoadingWorks(false);
    }
  };

  // Team summary statistics
  const totalOfficers = users.length;
  const activeOfficers = users.filter((u) => u.status === "ACTIVE").length;
  const totalScansByTeam = users.reduce((acc, u) => acc + (u.totalScans || 0), 0);
  const totalCompliantScans = users.reduce((acc, u) => acc + (u.compliantScans || 0), 0);
  const teamComplianceRate = totalScansByTeam > 0 ? Math.round((totalCompliantScans / totalScansByTeam) * 100) : 100;

  return (
    <div className="max-w-[1440px] mx-auto space-y-7 animate-fade-in">
      <PageHeader
        kicker="Administrative Command"
        title="Enforcement Officers & Department Directory"
        subtitle="Administer official accounts, register new enforcement officers, monitor individual inspection output, and audit officers' field activities."
        actions={
          <button
            onClick={() => setOpenAdd(true)}
            data-testid="add-user-btn"
            className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-black" />
            <span>Register New Officer</span>
          </button>
        }
      />

      {/* Aggregate Team Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Officers" value={totalOfficers} delta="Enrolled in department" icon={UsersIcon} tone="gold" />
        <StatCard label="Active Personnel" value={activeOfficers} delta={`${totalOfficers - activeOfficers} inactive`} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Total Field Scans" value={totalScansByTeam} delta="All inspections performed" icon={Briefcase} tone="blue" />
        <StatCard label="Team Compliance" value={`${teamComplianceRate}%`} delta="Passed statutory check" icon={ShieldCheck} tone="emerald" />
      </div>

      <div className="bg-[#111118] border border-[#D4A017]/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#252538] flex items-center justify-between bg-[#161622]/80">
          <div>
            <div className="font-display font-black text-white text-base">Enforcement Personnel Roster</div>
            <div className="text-xs text-[#9E927C]">Authorized Legal Metrology field and administrative officers</div>
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="text-xs font-bold text-[#F5C842] hover:text-[#D4A017] flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#8E8271] flex items-center justify-center gap-2.5">
            <RefreshCw className="w-5 h-5 animate-spin text-[#F5C842]" />
            <span className="text-xs">Loading officer registry and work metrics...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-dark">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5">Officer / Badge</th>
                  <th className="text-left px-5 py-3.5">Username</th>
                  <th className="text-left px-5 py-3.5">Role</th>
                  <th className="text-left px-5 py-3.5">Jurisdiction Circle</th>
                  <th className="text-center px-4 py-3.5">Scans Done</th>
                  <th className="text-center px-4 py-3.5">Compliance Rate</th>
                  <th className="text-left px-4 py-3.5">Status</th>
                  <th className="text-right px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252538]/60">
                {users.map((u) => {
                  const isAdminRole = (u.role || "").toUpperCase().includes("ADMIN");
                  return (
                    <tr key={u.id} className="transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${isAdminRole ? "bg-[#7C3AED]/25 text-[#C084FC] border border-[#7C3AED]/40" : "bg-[#D4A017]/20 text-[#F5C842] border border-[#D4A017]/30"}`}>
                          {(u.fullName || u.username || "O")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white">{u.fullName || u.username}</div>
                          <div className="text-[10px] font-mono text-[#9E927C]">
                            {u.employeeId || "LM-OFF-0101"} · {u.email || `${u.username}@packsure.gov.in`}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#F5C842]">@{u.username}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${isAdminRole ? "bg-[#7C3AED]/20 text-[#C084FC] border-[#7C3AED]/35" : "bg-[#1E1E2E] text-[#D4C4A8] border-[#2A2A3D]"}`}>
                          <ShieldCheck className={`w-3 h-3 ${isAdminRole ? "text-[#C084FC]" : "text-[#D4A017]"}`} />
                          <span>{isAdminRole ? "Admin Officer" : "Enforcement Officer"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#9E927C]">{u.location || "Enforcement Circle 1"}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-mono font-bold text-white bg-[#1E1E2E] px-2.5 py-1 rounded-md text-xs border border-[#2A2A3D]">
                          {u.totalScans || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-mono font-bold text-xs ${u.complianceRate >= 80 ? "text-emerald-400" : u.complianceRate >= 50 ? "text-[#F5C842]" : "text-rose-400"}`}>
                          {u.complianceRate !== undefined ? `${u.complianceRate}%` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-[#1E1E2E] text-[#8E8271] border-[#252538]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-emerald-400" : "bg-[#6E6454]"}`} />
                          {u.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleInspectWorks(u)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#7C3AED]/40 bg-[#7C3AED]/15 hover:bg-[#7C3AED]/25 text-[#C084FC] transition cursor-pointer"
                          title="Inspect works done by this officer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Check Works</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setOpenReset(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#D4A017]/30 bg-[#D4A017]/10 hover:bg-[#D4A017]/20 text-[#F5C842] transition cursor-pointer"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#F5C842]" />
                          <span>Reset</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                            u.status === "ACTIVE"
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          }`}
                        >
                          {u.status === "ACTIVE" ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Works Modal */}
      {openWorks && selectedUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setOpenWorks(false)}>
          <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/30 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252538] bg-[#161622]">
              <div>
                <div className="font-display font-black text-white text-lg flex items-center gap-2">
                  <span>Inspection Trail: {selectedUser.fullName || selectedUser.username}</span>
                </div>
                <div className="text-xs text-[#9E927C] mt-0.5">
                  Badge: <span className="font-mono font-bold text-[#F5C842]">{selectedUser.employeeId || "LM-OFF-0101"}</span> · Jurisdiction: {selectedUser.location || "Enforcement Circle 1"}
                </div>
              </div>
              <button onClick={() => setOpenWorks(false)} className="w-8 h-8 rounded-lg hover:bg-[#1E1E2E] flex items-center justify-center text-[#C8B89A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingWorks ? (
                <div className="p-16 text-center text-[#8E8271] flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#F5C842]" />
                  <span className="text-xs">Loading officer's inspections...</span>
                </div>
              ) : userWorks.length > 0 ? (
                <table className="w-full text-sm table-dark">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-wider">
                      <th className="text-left px-4 py-2.5">Inspection #</th>
                      <th className="text-left px-4 py-2.5">Commodity</th>
                      <th className="text-left px-4 py-2.5">Date &amp; Time</th>
                      <th className="text-center px-4 py-2.5">Score</th>
                      <th className="text-left px-4 py-2.5">Status</th>
                      <th className="text-right px-4 py-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252538]/60">
                    {userWorks.map((ins) => (
                      <tr key={ins.id} className="transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#F5C842] text-xs">{ins.inspectionNumber}</td>
                        <td className="px-4 py-3 font-semibold text-white">{ins.product?.name || "Packaged Commodity"}</td>
                        <td className="px-4 py-3 text-xs text-[#9E927C]">
                          {ins.createdAt ? new Date(ins.createdAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-center font-black text-white">{ins.screeningScore} / 100</td>
                        <td className="px-4 py-3"><StatusBadge status={ins.finalStatus || ins.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setOpenWorks(false);
                              navigate(`/inspections/${ins.id}`);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#F5C842] hover:underline cursor-pointer"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-14 text-center text-[#8E8271] text-xs">
                  No inspection scans recorded yet for officer <strong className="text-white">{selectedUser.fullName || selectedUser.username}</strong>.
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#252538] bg-[#161622] flex items-center justify-between text-xs text-[#9E927C]">
              <span>Total records: <strong className="text-white">{userWorks.length}</strong> inspections logged</span>
              <button
                onClick={() => setOpenWorks(false)}
                className="px-4 py-2 bg-[#1E1E2E] hover:bg-[#252538] text-[#F5E8C7] font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Officer Modal */}
      {openAdd && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setOpenAdd(false)}>
          <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/30 shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252538] bg-[#161622]">
              <div className="font-display font-black text-white text-base">Register Legal Metrology Officer</div>
              <button onClick={() => setOpenAdd(false)} className="w-8 h-8 rounded-lg hover:bg-[#1E1E2E] flex items-center justify-center text-[#C8B89A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#D4C4A8]">Full Name *</label>
                  <input
                    type="text"
                    value={draft.fullName}
                    onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#D4C4A8]">Username *</label>
                  <input
                    type="text"
                    value={draft.username}
                    onChange={(e) => setDraft({ ...draft, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    placeholder="e.g. ramesh_officer"
                    className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#D4C4A8]">Security Password *</label>
                  <input
                    type="password"
                    value={draft.password}
                    onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#D4C4A8]">Badge / Employee ID</label>
                  <input
                    type="text"
                    value={draft.employeeId}
                    onChange={(e) => setDraft({ ...draft, employeeId: e.target.value })}
                    placeholder="e.g. LM-OFF-2041"
                    className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#D4C4A8]">System Role</label>
                  <select
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                    className="mt-1.5 w-full input-dark px-3 py-2 text-xs text-white"
                  >
                    <option value="ROLE_OFFICER" className="bg-[#111118] text-white">Enforcement Officer</option>
                    <option value="ROLE_ADMIN" className="bg-[#111118] text-white">Admin Officer</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#D4C4A8]">Jurisdiction Circle</label>
                  <input
                    type="text"
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    placeholder="e.g. Enforcement Circle 2"
                    className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#D4C4A8]">Official Email</label>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="e.g. ramesh@packsure.gov.in"
                  className="mt-1.5 w-full input-dark px-3.5 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#252538] bg-[#161622]">
              <button
                onClick={() => setOpenAdd(false)}
                className="px-4 py-2 text-xs text-[#8E8271] font-bold hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOfficer}
                className="btn-gold px-5 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer"
              >
                Register Officer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {openReset && selectedUser && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setOpenReset(false)}>
          <div className="bg-[#111118] rounded-2xl border border-[#D4A017]/30 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252538] bg-[#161622]">
              <div className="font-display font-black text-white text-base">Reset Password for @{selectedUser.username}</div>
              <button onClick={() => setOpenReset(false)} className="w-8 h-8 rounded-lg hover:bg-[#1E1E2E] flex items-center justify-center text-[#C8B89A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#C8B89A]">
                Assign a revised security password for officer <strong className="text-white">{selectedUser.fullName || selectedUser.username}</strong>.
              </p>
              <div>
                <label className="text-xs font-semibold text-[#D4C4A8]">New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="mt-1.5 w-full input-dark px-3.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#252538] bg-[#161622]">
              <button onClick={() => setOpenReset(false)} className="px-4 py-2 text-xs text-[#8E8271] font-bold hover:text-white cursor-pointer">
                Cancel
              </button>
              <button onClick={handleResetPassword} className="btn-gold px-4 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
