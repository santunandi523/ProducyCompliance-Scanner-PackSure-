import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { UserPlus, X, KeyRound, CheckCircle2, XCircle, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/userService";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openReset, setOpenReset] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [draft, setDraft] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "ROLE_OFFICER",
    location: "Delhi Zone Circle",
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
    if (!draft.fullName || !draft.username || !draft.password) {
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
        role: "ROLE_OFFICER",
        location: "Delhi Zone Circle",
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
      toast.success(`Password reset for ${selectedUser.username}`);
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
      toast.success(`Officer ${user.username} status set to ${newStatus}`);
      loadUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <PageHeader
        kicker="Administration"
        title="Enforcement Personnel & Officers"
        subtitle="Manage Legal Metrology enforcement officers, supervisors, credentials, and access roles."
        actions={
          <button
            onClick={() => setOpenAdd(true)}
            data-testid="add-user-btn"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" /> Add Officer
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" /> Loading officers...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Officer Name</th>
                <th className="text-left px-5 py-3 font-semibold">Username</th>
                <th className="text-left px-5 py-3 font-semibold">Role</th>
                <th className="text-left px-5 py-3 font-semibold">Location / Circle</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      {u.fullName ? u.fullName[0] : u.username[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{u.email || `${u.username}@packsure.gov.in`}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-mono text-xs font-semibold">@{u.username}</td>
                  <td className="px-5 py-3 text-slate-700">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      {u.role.replace("ROLE_", "")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs">{u.location || "Delhi Zone"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        u.status === "ACTIVE" || !u.status
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" || !u.status ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {u.status || "ACTIVE"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setOpenReset(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                      title="Reset Password"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Reset Password
                    </button>

                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                        u.status === "ACTIVE" || !u.status
                          ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {u.status === "ACTIVE" || !u.status ? (
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Officer Modal */}
      {openAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpenAdd(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="font-display font-bold text-slate-900">Add Enforcement Officer</div>
              <button onClick={() => setOpenAdd(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  value={draft.fullName}
                  onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                  placeholder="Officer Name (e.g. Ramesh Kumar)"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Username *</label>
                <input
                  type="text"
                  value={draft.username}
                  onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                  placeholder="Username (e.g. officer2)"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Initial Password *</label>
                <input
                  type="password"
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  placeholder="Password (min 6 characters)"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Official Email</label>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="officer@packsure.gov.in"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Role</label>
                <select
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ROLE_OFFICER">Enforcement Officer</option>
                  <option value="ROLE_SUPERVISOR">Supervisor</option>
                  <option value="ROLE_ADMIN">Administrator</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Zone / Location</label>
                <input
                  type="text"
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  placeholder="Delhi Zone Circle"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setOpenAdd(false)} className="px-4 py-2 text-sm text-slate-600 font-semibold hover:text-slate-800">
                Cancel
              </button>
              <button onClick={handleCreateOfficer} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
                Save Officer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {openReset && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpenReset(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="font-display font-bold text-slate-900">Reset Password for @{selectedUser.username}</div>
              <button onClick={() => setOpenReset(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-600">
                Set a new password for officer <strong>{selectedUser.fullName}</strong>. The old password will be invalidated immediately.
              </p>
              <div>
                <label className="text-xs font-semibold text-slate-700">New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setOpenReset(false)} className="px-4 py-2 text-sm text-slate-600 font-semibold hover:text-slate-800">
                Cancel
              </button>
              <button onClick={handleResetPassword} className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
