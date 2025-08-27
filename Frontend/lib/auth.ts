// lib/auth.ts
import api from "./api";

export type Role = "employee" | "hr" | "admin";

export type Me = {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  role: Role;
  department?: string;
  position?: string;
  salary?: number;
};

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/auth/login", { email, password });
  // backend returns { token, user }
  localStorage.setItem("token", data.token);
  localStorage.setItem("me", JSON.stringify(data.user));
  return data.user as Me;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  contact?: string;
  employeeId?: string;
  department?: string;
  role?: Role;
  position?: string;
  salary?: number;
}) {
  const { data } = await api.post("/api/auth/register", payload);
  localStorage.setItem("token", data.token);
  localStorage.setItem("me", JSON.stringify(data.user));
  return data.user as Me;
}

export async function getMe(): Promise<Me | null> {
  const cached = localStorage.getItem("me");
  if (cached) return JSON.parse(cached);
  try {
    const { data } = await api.get("/api/auth/me");
    localStorage.setItem("me", JSON.stringify(data));
    return data as Me;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("me");
}
