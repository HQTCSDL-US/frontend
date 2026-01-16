import api, {
  setToken,
  removeToken,
  setStoredUser,
  getStoredUser,
} from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  User,
} from "../types/api";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );

    if (response.data.success && response.data.data) {
      const authData = response.data.data;
      setToken(authData.token);
      setStoredUser(
        JSON.stringify({
          userId: authData.userId,
          username: authData.username,
          email: authData.email,
          role: authData.role,
        })
      );
      return authData;
    }

    throw new Error(response.data.message || "Login failed");
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );

    if (response.data.success && response.data.data) {
      const authData = response.data.data;
      setToken(authData.token);
      setStoredUser(
        JSON.stringify({
          userId: authData.userId,
          username: authData.username,
          email: authData.email,
          role: authData.role,
        })
      );
      return authData;
    }

    throw new Error(response.data.message || "Registration failed");
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      removeToken();
    }
  },

  getCurrentUser(): User | null {
    const userStr = getStoredUser();
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },
};
