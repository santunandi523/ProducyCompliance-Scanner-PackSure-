import api from "./api";
import { getCustomUsers } from "./userService";

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
        const cleanUser = String(username).trim().toLowerCase();

        // 1. Check built-in admin credentials
        if (cleanUser === "admin") {
          if (password === "Admin@123") {
            const adminUser = {
              id: 1,
              username: "admin",
              fullName: "Super Admin",
              role: "ROLE_ADMIN",
              badgeNumber: "ADM-7701",
              designation: "Senior Compliance Administrator",
              jurisdiction: "HQ / National Jurisdiction",
              email: "admin@packsure.gov.in",
              isDemoMode: true,
            };
            const demoToken = `packsure-demo-jwt-admin-${Date.now()}`;
            localStorage.setItem("packsure_token", demoToken);
            localStorage.setItem("packsure_user", JSON.stringify(adminUser));
            localStorage.setItem("packsure_demo_mode", "true");
            return adminUser;
          } else {
            throw new Error("Invalid password for @admin. Default password is: Admin@123");
          }
        }

        // 2. Check built-in officer credentials
        if (cleanUser === "officer") {
          if (password === "Officer@123") {
            const officerUser = {
              id: 2,
              username: "officer",
              fullName: "Enforcement Officer",
              role: "ROLE_OFFICER",
              badgeNumber: "LM-8842",
              designation: "Legal Metrology Inspector",
              jurisdiction: "State Enforcement Division, Zone 1",
              email: "officer@packsure.gov.in",
              isDemoMode: true,
            };
            const demoToken = `packsure-demo-jwt-officer-${Date.now()}`;
            localStorage.setItem("packsure_token", demoToken);
            localStorage.setItem("packsure_user", JSON.stringify(officerUser));
            localStorage.setItem("packsure_demo_mode", "true");
            return officerUser;
          } else {
            throw new Error("Invalid password for @officer. Default password is: Officer@123");
          }
        }

        // 3. Check newly created custom users from the Directory
        const customUsers = getCustomUsers();
        const found = customUsers.find(
          (u) => String(u.username).trim().toLowerCase() === cleanUser
        );

        if (found) {
          if (found.status === "INACTIVE" || found.active === false) {
            throw new Error(
              `Officer account @${cleanUser} is deactivated. Please contact an Administrator.`
            );
          }

          if (found.password === password) {
            const loggedInUser = {
              id: found.id,
              username: found.username,
              fullName: found.fullName || found.username,
              role: found.role || "ROLE_OFFICER",
              badgeNumber: found.badgeNumber || "LM-9000",
              designation:
                found.designation ||
                (found.role === "ROLE_ADMIN"
                  ? "Compliance Administrator"
                  : "Legal Metrology Inspector"),
              jurisdiction: found.jurisdiction || "State Enforcement Division",
              email: found.email || `${cleanUser}@packsure.gov.in`,
              isDemoMode: true,
            };
            const demoToken = `packsure-demo-jwt-${cleanUser}-${Date.now()}`;
            localStorage.setItem("packsure_token", demoToken);
            localStorage.setItem("packsure_user", JSON.stringify(loggedInUser));
            localStorage.setItem("packsure_demo_mode", "true");
            return loggedInUser;
          } else {
            throw new Error(`Incorrect security password for user @${cleanUser}.`);
          }
        }

        // 4. User does not exist
        throw new Error(
          `User @${cleanUser} not found. Register the officer in the Users tab, or log in with admin / Admin@123.`
        );
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
