import type { LoginCredentials, LoginResponse } from "../types/auth";
import type { ApiSuccess } from "../types/api";
import { request } from "./api/client";

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: credentials,
      token: null,
    });
  },

  async logout(): Promise<ApiSuccess<null>> {
    return request<ApiSuccess<null>>("/api/auth/logout", {
      method: "POST",
      token: null,
    });
  },
};
