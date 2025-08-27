// lib/hr.ts
import api from "./api";

export async function fetchEmployees() {
  const { data } = await api.get("/api/employees");
  return data as any[];
}

export async function sendFeedbackAPI(input: {
  employeeId: string; // EMP001
  feedback: string;
  fromUserId?: string; // HR employeeId, optional: backend will infer from token if missing
}) {
  const { data } = await api.post("/api/feedback", input);
  return data;
}

export async function createPayrollIntent(input: {
  employeeId: string;
  amount: number;
  month: string; // "July 2025"
}) {
  const { data } = await api.post("/api/payroll/create-intent", input);
  return data; // { success, payroll, clientSecret, paymentIntentId }
}

export async function markPayrollPaid(paymentIntentId: string) {
  const { data } = await api.post("/api/payroll/mark-paid", { paymentIntentId });
  return data;
}

export async function getEmployeePayroll(employeeId: string) {
  const { data } = await api.get(`/api/payroll/employee/${employeeId}`);
  return data as any[];
}
