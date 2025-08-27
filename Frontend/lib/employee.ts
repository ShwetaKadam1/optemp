// lib/employee.ts
import api from "./api";

export async function getAttendance(employeeId: string) {
  const { data } = await api.get(`/api/attendance/${employeeId}`);
  return data as {
    _id: string;
    date: string;
    status: "present" | "absent" | "work-from-home" | "half-day";
    hours: number;
  }[];
}

export async function markAttendanceAPI(input: {
  employeeId: string;
  status: "present" | "absent" | "work-from-home" | "half-day";
  date?: string; // ISO
  hours?: number;
}) {
  const { data } = await api.post("/api/attendance/mark", input);
  return data;
}

export async function getGoals(employeeId: string) {
  const { data } = await api.get(`/api/goals/${employeeId}`);
  return data as {
    _id: string;
    title: string;
    status: "not-started" | "in-progress" | "completed";
    progress: number;
    deadline?: string;
  }[];
}

export async function updateGoal(goalId: string, body: { status?: string; progress?: number }) {
  const { data } = await api.patch(`/api/goals/${goalId}`, body);
  return data;
}

export async function getLeaves(employeeId: string) {
  const { data } = await api.get(`/api/leaves/${employeeId}`);
  return data as any[];
}

export async function submitLeave(input: {
  employeeId: string;
  type: string;
  reason: string;
  startDate: string;
  endDate: string;
}) {
  const { data } = await api.post("/api/leaves", input);
  return data;
}

export async function getFeedback(employeeId: string) {
  const { data } = await api.get(`/api/feedback/${employeeId}`);
  return data as {
    _id: string;
    message: string;
    createdAt: string;
    fromUser: { name: string; role: string; employeeId: string };
  }[];
}
