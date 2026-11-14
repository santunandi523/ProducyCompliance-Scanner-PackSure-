import api from "./api";

export const authService = {
  async login(username, password) {
    try {
      const res = await api.post("/auth/login", { username, password });
      if (res.success && res.data) {
        localStorage.setItem("packsure_token", res.data.token);
        localStorage.setItem("packsure_user", JSON.stringify(res.data.user));
        localStorage.removeItem("packsure_demo_mode");
        return res.data.user;
      }
      throw new Error(res.message || "Login failed");
    } catch (err) {
      // If backend returns 404 (e.g. static Vercel deployment with no backend container) or network failure
      const isStatus404 =
        err.response?.status === 404 ||
        err.message?.includes("404") ||
        err.message?.includes("status code 404");
      const isNetworkErr =
        err.message?.includes("Cannot connect") ||
        err.message?.includes("Network Error") ||
        !err.response;

      if (isStatus404 || isNetworkErr) {
        // Authenticate with official credentials in Standalone Cloud Demo Mode
        const cleanUser = String(username).trim().toLowerCase();
        if (
          (cleanUser === "admin" && password === "Admin@123") ||
          (cleanUser === "officer" && password === "Officer@123")
        ) {
          const isAdmin = cleanUser === "admin";
          const demoUser = {
            id: isAdmin ? 1 : 2,
            username: cleanUser,
            fullName: isAdmin ? "Super Admin" : "Enforcement Officer",
            role: isAdmin ? "ROLE_ADMIN" : "ROLE_OFFICER",
            badgeNumber: isAdmin ? "ADM-7701" : "LM-8842",
            designation: isAdmin
              ? "Senior Compliance Administrator"
              : "Legal Metrology Inspector",
            jurisdiction: "State Enforcement Division, Zone 1",
            email: `${cleanUser}@packsure.gov.in`,
            isDemoMode: true,
          };

          const demoToken = `packsure-demo-jwt-${cleanUser}-${Date.now()}`;
          localStorage.setItem("packsure_token", demoToken);
          localStorage.setItem("packsure_user", JSON.stringify(demoUser));
          localStorage.setItem("packsure_demo_mode", "true");
          return demoUser;
        } else {
          throw new Error(
            "Invalid credentials. Official credentials are: admin / Admin@123 or officer / Officer@123"
          );
        }
      }

      throw err;
    }
  },

  async getMe() {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch {
      return this.getStoredUser();
    }
  },

  logout() {
    localStorage.removeItem("packsure_token");
    localStorage.removeItem("packsure_user");
    localStorage.removeItem("packsure_demo_mode");
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
