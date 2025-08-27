// app/hr-dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, Building, FileText, Send, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { fetchEmployees, sendFeedbackAPI, createPayrollIntent, markPayrollPaid } from "@/lib/hr";
import { getMe, logout } from "@/lib/auth";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

function useAuthGuard() {
  useEffect(() => {
    const me = localStorage.getItem("me");
    if (!me) window.location.href = "/";
    else {
      const role = JSON.parse(me).role;
      if (!(role === "hr" || role === "admin")) window.location.href = "/employee-dashboard";
    }
  }, []);
}

export default function HRDashboard() {
  useAuthGuard();

  const [me, setMe] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmp, setLoadingEmp] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [feedback, setFeedback] = useState("");
  const [sentFeedback, setSentFeedback] = useState<{ employeeName: string; feedback: string; date: string }[]>([]);

  const [payrollStatus, setPayrollStatus] = useState<{ [id: string]: "idle" | "processing" | "paid" | "failed" }>({});

  useEffect(() => {
    (async () => {
      const m = await getMe();
      setMe(m);
      try {
        const list = await fetchEmployees();
        setEmployees(list);
      } finally {
        setLoadingEmp(false);
      }
    })();
  }, []);

  // Build departments distribution dynamically
  const departmentsAgg = useMemo(() => {
    const acc: Record<string, number> = {};
    employees.forEach((e) => {
      const d = e.department || "Unassigned";
      acc[d] = (acc[d] || 0) + 1;
    });
    return Object.entries(acc).map(([name, count]) => ({
      name,
      count,
      budget: 0, // not in backend; display-only
    }));
  }, [employees]);

  // Fake performance per department = average of employee salary percentile
  const departmentPerformance = useMemo(() => {
    const acc: Record<string, { total: number; c: number }> = {};
    const salaries = employees.map((e) => e.salary || 0);
    const max = Math.max(1, ...salaries);
    employees.forEach((e) => {
      const d = e.department || "Unassigned";
      const score = Math.round(((e.salary || 0) / max) * 100);
      acc[d] = acc[d] || { total: 0, c: 0 };
      acc[d].total += score;
      acc[d].c += 1;
    });
    return Object.entries(acc).map(([department, v]) => ({
      department,
      performance: Math.round(v.total / v.c || 0),
    }));
  }, [employees]);

  const handlePaySalary = async (employee: any) => {
    const { _id, employeeId, salary = 0 } = employee;
    setPayrollStatus((s) => ({ ...s, [employee._id]: "processing" }));
    try {
      const month = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }); // e.g. "August 2025"
      const intent = await createPayrollIntent({ employeeId, amount: salary, month });
      // if you integrate Stripe on FE, confirm card here; for now, mark paid immediately
      await markPayrollPaid(intent.paymentIntentId);
      setPayrollStatus((s) => ({ ...s, [employee._id]: "paid" }));
    } catch (e) {
      console.error(e);
      setPayrollStatus((s) => ({ ...s, [employee._id]: "failed" }));
    }
  };

  const submitFeedback = async () => {
    if (!selectedEmployee || !feedback) return;
    try {
      await sendFeedbackAPI({
        employeeId: selectedEmployee.employeeId,
        feedback,
        fromUserId: me?.employeeId,
      });
      setSentFeedback((prev) => [
        { employeeName: selectedEmployee.name, feedback, date: new Date().toLocaleDateString() },
        ...prev,
      ]);
      setFeedback("");
      setSelectedEmployee(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send feedback");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
                <p className="text-sm text-gray-500">{me?.name} {me?.role ? `• ${me.role}` : ""}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => { logout(); window.location.href = "/"; }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>HR Profile</CardTitle>
                <CardDescription>Your HR details</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {Object.entries({
                  "HR ID": me?.employeeId || "HR001",
                  "Full Name": me?.name || "-",
                  Role: me?.role || "-",
                  Email: me?.email || "-",
                  Department: me?.department || "Human Resources",
                  "Join Date": "-", // not available in backend model by default
                }).map(([label, value], idx) => (
                  <div key={idx}>
                    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
                    <p className="text-lg font-semibold">{value as any}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loadingEmp ? "…" : employees.length}</div>
                  <p className="text-xs opacity-80">Active employees</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                  <span className="text-white/80 font-bold">₹</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{(employees || []).reduce((a, e) => a + (e.salary || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs opacity-80">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {departmentPerformance.length
                      ? Math.round(departmentPerformance.reduce((a, d) => a + d.performance, 0) / departmentPerformance.length)
                      : 0}%</div>
                  <p className="text-xs opacity-80">Proxy (salary-based)</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <Building className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{departmentsAgg.length}</div>
                  <p className="text-xs opacity-80">Active departments</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Proxy score per department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="performance" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
                <CardHeader>
                  <CardTitle>Department Distribution</CardTitle>
                  <CardDescription>Employees by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={departmentsAgg} cx="50%" cy="50%" labelLine={false}
                           label={(d: any) => `${d.name}: ${d.count}`} outerRadius={80} dataKey="count">
                        {departmentsAgg.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employees */}
          <TabsContent value="employees" className="space-y-6">
            <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>View and manage all employees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {employees.map((employee) => (
                  <Card key={employee._id} className="p-4 bg-white shadow-sm hover:shadow-md rounded-lg flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {String(employee.name || "")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {employee.position || "-"} • {employee.department || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{employee.employeeId}</Badge>
                      <Badge variant="default">active</Badge>
                      <Button size="sm" variant="outline" onClick={() => setSelectedEmployee(employee)}>
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
                {!employees.length && !loadingEmp && <p className="text-sm text-muted-foreground">No employees found.</p>}
              </CardContent>
            </Card>

            {/* Slide-over */}
            {!!selectedEmployee && (
              <div className="fixed inset-0 z-50 flex">
                <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEmployee(null)} />
                <div className="ml-auto w-full max-w-sm h-[90vh] my-auto rounded-lg bg-white shadow-xl p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                    <Button variant="ghost" onClick={() => setSelectedEmployee(null)}><X className="h-5 w-5" /></Button>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div><span className="font-medium">Employee ID:</span> {selectedEmployee.employeeId}</div>
                    <div><span className="font-medium">Department:</span> {selectedEmployee.department || "-"}</div>
                    <div><span className="font-medium">Position:</span> {selectedEmployee.position || "-"}</div>
                    <div><span className="font-medium">Email:</span> {selectedEmployee.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedEmployee.phone || "-"}</div>
                    <div><span className="font-medium">Salary:</span> {selectedEmployee.salary ? `Rs.${selectedEmployee.salary.toLocaleString()}` : "-"}</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Payroll */}
          <TabsContent value="payroll" className="space-y-6">
            <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle>Salary Disbursement</CardTitle>
                <CardDescription>Process monthly salary payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {employees.map((e) => (
                  <Card key={e._id} className="p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">₹</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{e.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {e.employeeId} • {e.department || "-"} • ₹{(e.salary || 0).toLocaleString()}/month
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {payrollStatus[e._id] === "paid" ? (
                        <Badge variant="default">Paid</Badge>
                      ) : payrollStatus[e._id] === "processing" ? (
                        <Badge variant="secondary">Processing...</Badge>
                      ) : payrollStatus[e._id] === "failed" ? (
                        <Badge variant="destructive">Failed</Badge>
                      ) : (
                        <Button size="sm" onClick={() => handlePaySalary(e)}>Pay Salary</Button>
                      )}
                      {/* Payslip will be accessible once payroll entry exists (open new tab when you have ID) */}
                      <Button size="sm" variant="outline" onClick={() => alert("Open payslip after listing payrolls for this employee.")}>
                        <FileText className="h-4 w-4 mr-1" />
                        Payslip
                      </Button>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments */}
          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentsAgg.map((dept, index) => (
                <Card key={dept.name} className="bg-white shadow-md hover:shadow-lg rounded-lg">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index % COLORS.length] + "20" }}>
                      <Building className="h-4 w-4" style={{ color: COLORS[index % COLORS.length] }} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Employees</span><span className="font-medium">{dept.count}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Budget</span><span className="font-medium">—</span></div>
                    <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => alert(`Manage Department: ${dept.name}`)}>Manage Department</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-6">
            <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle>Employee Feedback</CardTitle>
                <CardDescription>Provide feedback to employees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Employee</Label>
                  <Select onValueChange={(id) => setSelectedEmployee(employees.find((e) => e.employeeId === id) || null)}>
                    <SelectTrigger><SelectValue placeholder="Choose an employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e._id} value={e.employeeId}>
                          {e.name} - {e.position || "-"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea placeholder="Write your feedback here..." value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} />
                </div>
                <Button onClick={submitFeedback} disabled={!selectedEmployee || !feedback}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle>Sent Feedback</CardTitle>
                <CardDescription>Recently sent feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sentFeedback.length === 0 && <p className="text-sm text-muted-foreground">No feedback sent yet.</p>}
                {sentFeedback.map((item, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">To: {item.employeeName}</span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="text-sm">{item.feedback}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
