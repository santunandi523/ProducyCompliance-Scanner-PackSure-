import api from "./api";
import { mockUsers } from "./mockData";

export const getCustomUsers = () => {
  try {
    const raw = localStorage.getItem("packsure_custom_users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomUsers = (users) => {
  try {
    localStorage.setItem("packsure_custom_users", JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save custom users:", e);
  }
};

export const userService = {
  async listUsers() {
    try {
      const res = await api.get("/admin/users");
      if (res?.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    const custom = getCustomUsers();
    return [...mockUsers, ...custom];
  },

  async createUser(userData) {
    try {
      const res = await api.post("/admin/users", userData);
      if (res?.data) return res.data;
    } catch {
      // Store in local storage for standalone & cloud demo mode
    }

    const cleanUsername = String(userData.username || "").trim().toLowerCase();
    if (!cleanUsername) throw new Error("Username is required");

    const custom = getCustomUsers();
    if (
      cleanUsername === "admin" ||
      cleanUsername === "officer" ||
      custom.some((u) => u.username.toLowerCase() === cleanUsername)
    ) {
      throw new Error(`Username @${cleanUsername} is already registered.`);
    }

    const newUser = {
      id: Date.now(),
      username: cleanUsername,
      fullName: userData.fullName || cleanUsername,
      email: userData.email || `${cleanUsername}@packsure.gov.in`,
      password: userData.password, // Saved so user can log in with this password
      badgeNumber:
        userData.employeeId ||
        userData.badgeNumber ||
        `LM-${Math.floor(1000 + Math.random() * 9000)}`,
      designation:
        userData.designation ||
        (userData.role === "ROLE_ADMIN"
          ? "Compliance Administrator"
          : "Legal Metrology Inspector"),
      jurisdiction:
        userData.location ||
        userData.jurisdiction ||
        "State Enforcement Division, Circle 1",
      role: userData.role || "ROLE_OFFICER",
      status: "ACTIVE",
      active: true,
      totalScans: 0,
      compliantScans: 0,
      createdAt: new Date().toISOString(),
    };

    custom.push(newUser);
    saveCustomUsers(custom);
    return newUser;
  },

  async updateUser(id, userData) {
    try {
      const res = await api.put(`/admin/users/${id}`, userData);
      if (res?.data) return res.data;
    } catch {
      // Fallback
    }
    const custom = getCustomUsers();
    const idx = custom.findIndex((u) => u.id === Number(id));
    if (idx !== -1) {
      custom[idx] = { ...custom[idx], ...userData };
      saveCustomUsers(custom);
      return custom[idx];
    }
    return { id, ...userData };
  },

  async changeUserStatus(id, status) {
    try {
      const res = await api.patch(`/admin/users/${id}/status`, { status });
      if (res?.data) return res.data;
    } catch {
      // Fallback
    }
    const custom = getCustomUsers();
    const idx = custom.findIndex((u) => u.id === Number(id));
    if (idx !== -1) {
      custom[idx].status = status;
      custom[idx].active = status === "ACTIVE";
      saveCustomUsers(custom);
      return custom[idx];
    }
    return { id, status };
  },

  async resetUserPassword(id, newPassword) {
    try {
      const res = await api.post(`/admin/users/${id}/reset-password`, { newPassword });
      if (res?.data) return res.data;
    } catch {
      // Fallback
    }
    const custom = getCustomUsers();
    const idx = custom.findIndex((u) => u.id === Number(id));
    if (idx !== -1) {
      custom[idx].password = newPassword;
      saveCustomUsers(custom);
      return { success: true, message: "Password updated successfully" };
    }
    return { success: true, message: "Password updated successfully" };
  },

  async getUserInspections(id) {
    try {
      const res = await api.get(`/admin/users/${id}/inspections`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  async getProfile() {
    try {
      const res = await api.get("/users/profile");
      if (res?.data) return res.data;
    } catch {
      // Fallback to current localStorage user
      const u = localStorage.getItem("packsure_user");
      if (u) return JSON.parse(u);
    }
    return mockUsers[0];
  },

  async changeSelfPassword(currentPassword, newPassword) {
    try {
      const res = await api.post("/users/change-password", { currentPassword, newPassword });
      return res.data;
    } catch {
      return { success: true, message: "Password changed successfully" };
    }
  },
};
