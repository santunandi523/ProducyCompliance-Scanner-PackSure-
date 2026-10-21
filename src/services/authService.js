import api from "./api";

export const authService = {
  async login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    if (res.success && res.data) {
      localStorage.setItem("packsure_token", res.data.token);
      localStorage.setItem("packsure_user", JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.message || "Login failed");
  },

  async getMe() {
    const res = await api.get("/auth/me");
    return res.data;
  },

  logout() {
    localStorage.removeItem("packsure_token");
    localStorage.removeItem("packsure_user");
  },

  getStoredUser() {
    try {
      const u = localStorage.getItem("packsure_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
};
