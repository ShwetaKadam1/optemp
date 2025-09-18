"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Send,
  X,
  Building,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "@/lib/apiClient";
import { auth } from "@/lib/firebaseClient";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6",
];

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [employeeData, setEmployeeData] = useState(null)
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<any | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [managingDepartment, setManagingDepartment] = useState(null);
  const [deptBudgets, setDeptBudgets] = useState<{ [key: string]: number }>({});
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [salaryAmount, setSalaryAmount] = useState<number>(0);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryModal, setSalaryModal] = useState<{ base: number; bonus: number; deductions: number; period: string }>({
  base: 0,
  bonus: 0,
  deductions: 0,
  period: "",
  });
  const [existingPayrolls, setExistingPayrolls] = useState<{ [key: string]: string[] }>({});
  const [payrollStatus, setPayrollStatus] = useState<{ [key: string]: string }>({});
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [sentFeedback, setSentFeedback] = useState<any[]>([]);
  const [showPerformance, setShowPerformance] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);


useEffect(() => {
  const isAdmin = localStorage.getItem("isAdmin");
  if (!isAdmin || isAdmin !== "true") {
    window.location.href = "/admin-login";
  } else {
    setUserLoaded(true);
    setIsAdmin(true); //  // admin verified
  }
}, []);

// 2️⃣ Fetch dashboard data once admin is verified
useEffect(() => {
  if (!userLoaded) return; // wait until admin is verified

  const fetchData = async () => {
    setLoadingData(true); // optional: show a loading state
    try {
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  fetchData();
}, [userLoaded]);

  const fetchDashboardData = async () => {
    try {
      // Employees
      const empRes = await api.get("/api/users/all", { headers: { "x-admin": "true" } });
      const users = empRes.data;
      setEmployees(users);

      // Performance
      const perfRes = await api.get("/api/performances", { headers: { "x-admin": "true" } });
      const allPerf = perfRes.data;

      const employeesWithPerf = users.map((u: any) => ({
        ...u,
        performance: allPerf
          .filter((p: any) => p.user._id === u._id)
          .map((p: any) => ({
            month: p.period,
            productivity: p.score || 0,
            goals: p.notes ? 100 : 0,
          }))
          .reverse(),
      }));
      setEmployees(employeesWithPerf);

      // Departments
      const deptRes = await api.get("/api/departments", { headers: { "x-admin": "true" } });
      const depts = deptRes.data.map((d: any) => ({
        ...d,
        count: users.filter((e: any) => e.department === d.name).length,
        budget: d.budget || 0,
      }));
      setDepartments(depts);

      const budgets: { [key: string]: number } = {};
      depts.forEach((d) => {
        budgets[d._id] = d.budget || 0;
      });
      setDeptBudgets(budgets);

      // Payroll
    const payrollRes = await api.get("/api/payroll", { headers: { "x-admin": "true" } });
    const payrollsData = payrollRes.data;

    const payrollMap: { [key: string]: string[] } = {};
    payrollsData.forEach((p: any) => {
      if (p.user?._id) {
        if (!payrollMap[p.user._id]) payrollMap[p.user._id] = [];
        payrollMap[p.user._id].push(p.period);
      }
    });

    setExistingPayrolls(payrollMap);

    // ✅ store payrolls so JSX can access
    setPayrolls(payrollsData);

      // Feedback
      const fbRes = await api.get("/api/feedbacks", { headers: { "x-admin": "true" } });
  setSentFeedback(
    fbRes.data.map((f: any) => ({
      employeeName: f.user?.name || "-",
      message: f.message,
      date: new Date(f.createdAt || f.date).toISOString().slice(0, 10), // fallback & safe format
      senderRole: f.senderRole,
    }))
  );

  // ✅ Leaves
    const leaveRes = await api.get("/api/leaves", { headers: { "x-admin": "true" } });
    setLeaves(leaveRes.data);

  } catch (err) {
    console.error("Error fetching admin dashboard data:", err);
  }
};  

  const [form, setForm] = useState({
  name: "",
  email: "",
  department: "",
  role: "",
});


  const handleAddSalary = async (employeeId: string, salaryData: { base: number; bonus: number; deductions: number; period: string }) => {
  try {
    // Validate inputs
    if (!salaryData.period || !salaryData.base) {
      alert("Please enter period and base salary.");
      return;
    }

    // Call API to save salary in payroll collection
    const res = await api.post(
      `/payroll/run/${employeeId}`,
      {
        period: salaryData.period,
        base: salaryData.base,
        bonus: salaryData.bonus || 0,
        deductions: salaryData.deductions || 0,
      },
      { headers: { "x-admin": "true" } }
    );

    if (res.status === 201) {
      alert("Salary added successfully!");
      // Optionally refresh payroll data
      fetchDashboardData();
    }
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to add salary");
  }
};

  const submitFeedback = async () => {
    if (!selectedEmployee || !feedback) return;
    try {
      await api.post("/api/feedbacks", {
        userId: selectedEmployee._id,
        message: feedback,
      }, { headers: { "x-admin": "true" } });

      setSentFeedback((prev) => [
        {
          employeeName: selectedEmployee.name,
          message: feedback,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setFeedback("");
      setSelectedEmployee(null);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

const handleFormChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

// ADD EMPLOYEE
const handleAddEmployee = async () => {
  try {
    const res = await api.post("/api/users", form, { headers: { "x-admin": "true" } });
    setEmployees([res.data, ...employees]);
    setShowAddModal(false);
    setForm({ name: "", department: "", role: "", email: "" });
  } catch (err) {
    console.error(err);
  }
};

// EDIT EMPLOYEE
const handleEditEmployee = (emp) => {
  setEditingEmployee(emp);
  setForm({
    name: emp.name,
    department: emp.department,
    role: emp.role,
    email: emp.email,
    position: emp.position 
  });
};

// UPDATE EMPLOYEE (use employeeId instead of _id)
const handleUpdateEmployee = async () => {
  try {
    const res = await api.put(
      `/api/users/${editingEmployee.employeeId}`,
      form,
      { headers: { "x-admin": "true" } }
    );

    setEmployees(
      employees.map((e) =>
        e.employeeId === res.data.employeeId ? res.data : e
      )
    );

    setEditingEmployee(null);
    setForm({ name: "", department: "", role: "", email: "" });
  } catch (err) {
    console.error("Update failed:", err);
  }
};

// DELETE EMPLOYEE (use employeeId instead of _id)
const handleDeleteEmployee = async () => {
  if (!deletingEmployee) {
    console.error("No employee selected for deletion");
    return;
  }

  if (!confirm(`Are you sure you want to delete ${deletingEmployee.name}?`)) return;

  try {
    await api.delete(`/api/users/${deletingEmployee.employeeId}`, {
      headers: { "x-admin": "true" },
    });

    setEmployees(employees.filter((e) => e.employeeId !== deletingEmployee.employeeId));
    setDeletingEmployee(null);
    console.log("Employee deleted successfully");
  } catch (err) {
    console.error("Delete failed:", err);
  }
};

  const submitSalary = async () => {
  try {
    await api.post(`/api/payroll/run/${selectedEmployee._id}`, salaryModal, {
      headers: { "x-admin": "true" },
    });

    alert("Salary added successfully!");

    // Refresh payroll data or update state
    fetchDashboardData();
    setShowSalaryModal(false);
    setSalaryModal({ base: 0, bonus: 0, deductions: 0, period: "" });
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to add salary");
  }
};

const handleLeaveApproval = async (leaveId: string, status: "approved" | "rejected") => {
  try {
    await api.put(
      `/api/leaves/${leaveId}/approval`,
      { status },
      { headers: { "x-admin": "true" } }
    );

    // Remove leave from state after approval/rejection
    setLeaves((prev) => prev.filter((l) => l._id !== leaveId));
  } catch (err) {
    console.error("Error updating leave:", err);
  }
};


  const handleLogout = async () => {
    localStorage.removeItem("isAdmin");
    window.location.href = "/admin-login";
  };

if (!userLoaded || loadingData) return <p className="p-4">Loading Admin dashboard...</p>;

  const deptPerformance = departments.map((d) => {
    const deptScores = employees
      .filter((e) => e.department === d.name)
      .flatMap((e) => e.performance?.map((p: any) => p.productivity) || []);
    const avgPerf = deptScores.length
      ? deptScores.reduce((a, b) => a + b, 0) / deptScores.length
      : 0;
    return { department: d.name, performance: avgPerf };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-red-600 p-4">
        Admin Dashboard Loaded ✅
      </h1>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {process.env.NEXT_PUBLIC_DASHBOARD_TITLE || "Admin Dashboard"}
                </h1>
                <p className="text-sm text-gray-500">
                  {process.env.NEXT_PUBLIC_ADMIN_NAME || "Admin User"} • Admin
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="leaves">Leave Approval</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

         {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>Your details</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {Object.entries({
                  "Admin ID": "ADMIN001",
                  "Full Name": process.env.NEXT_PUBLIC_ADMIN_NAME || "Admin User",
                  "Role": "Admin",
                  "Email": process.env.NEXT_PUBLIC_ADMIN_EMAIL,
                  "Joined": "2025-09-09",
                }).map(([label, value], idx) => (
                  <div key={idx}>
                    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
                    <p className="text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle>Total Employees</CardTitle>
                  <CardDescription className="text-blue-100">
                    Company-wide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{employees.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
  <CardHeader>
    <CardTitle>Monthly Payroll</CardTitle>
    <CardDescription className="text-green-100">
      Current Cycle
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">
  ₹
  {payrolls
    .filter((p: any) => {
      const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2025-09"
      return p.period?.startsWith(currentMonth);
    })
    .reduce((sum: number, p: any) => sum + (p.net || 0), 0)
    .toLocaleString()}
</p>
  </CardContent>
</Card>

              <Card className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle>Avg Performance</CardTitle>
                  <CardDescription className="text-yellow-100">
                    All Employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {Math.round(
                      employees.reduce(
                        (acc, e) =>
                          acc +
                          (e.performance?.[0]?.productivity || 0),
                        0
                      ) / employees.length
                    )}
                    %
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription className="text-purple-100">
                    Active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{departments.length}</p>
                </CardContent>
              </Card>
            </div>

             {/* Charts (Bar + Pie) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Performance */}
              <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Average performance scores by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
      dataKey="department"
      interval={0}
      angle={-30}
      textAnchor="end"
      height={80}
    />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="performance" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Department Distribution (PIE) */}
              <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
                <CardHeader>
                  <CardTitle>Department Distribution</CardTitle>
                  <CardDescription>Employee count by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departments}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, count }: any) => `${name}: ${count}`}
                      >
                        {departments.map((entry, index) => (
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

        {/* ✅ Employees Tab */}
<TabsContent value="employees" className="space-y-6">
  <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
    <CardHeader className="flex justify-between items-center">
      <div>
        <CardTitle>Employee Management</CardTitle>
        <CardDescription>Manage employees: add, edit, or delete</CardDescription>
      </div>
      <Button size="sm" onClick={() => setShowAddModal(true)}>Add Employee</Button>
    </CardHeader>

    <CardContent className="space-y-4">
      {employees.map((emp) => (
        <Card
          key={emp._id}
          className="p-4 bg-white shadow-sm hover:shadow-md rounded-lg flex justify-between items-center"
        >
          {/* Avatar + Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {emp.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div>
              <h4 className="font-medium">{emp.name}</h4>
              <p className="text-sm text-muted-foreground">{emp.role} • {emp.department}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{emp.employeeId}</Badge>
            <Badge variant={emp.status === "active" ? "default" : "secondary"}>
              {emp.status || "active"}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => setSelectedEmployee(emp)}>View</Button>
            <Button size="sm" variant="secondary" onClick={() => handleEditEmployee(emp)}>Edit</Button>
           <Button size="sm" variant="destructive" onClick={() => setDeletingEmployee(emp)}>Delete</Button>
          </div>
        </Card>
      ))}
    </CardContent>
  </Card>

  {/* 🔹 Sliding Panel for Employee Details */}
  {selectedEmployee && (
  <div className="fixed inset-0 z-50 flex justify-end">
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setSelectedEmployee(null)}
    />

    {/* Panel */}
    <div className="relative z-60 w-full max-w-sm h-full bg-white shadow-xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
          <Button variant="ghost" onClick={() => setSelectedEmployee(null)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Employee Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div><span className="font-medium">Employee ID:</span> {selectedEmployee.employeeId}</div>
          <div><span className="font-medium">Department:</span> {selectedEmployee.department}</div>
          <div><span className="font-medium">Role:</span> {selectedEmployee.role}</div>
          <div><span className="font-medium">Email:</span> {selectedEmployee.email}</div>
          <div><span className="font-medium">Join Date:</span> {new Date(selectedEmployee.joinedOn).toLocaleDateString()}</div>
          <div><span className="font-medium">Phone:</span> {selectedEmployee.contact || "-"}</div>
          <div><span className="font-medium">Position:</span>{selectedEmployee.position || "-"}</div>
        </div>

         {/* 🔹 Toggle Performance Button */}
        <Button
          className="mt-4"
          onClick={() =>
            setShowPerformance((prev) => (prev === selectedEmployee._id ? null : selectedEmployee._id))
          }
        >
          {showPerformance === selectedEmployee._id
            ? "Hide Performance"
            : "Show Performance"}
        </Button>

        {/* 🔹 Performance Chart */}
        {showPerformance === selectedEmployee._id &&
          selectedEmployee.performance?.length > 0 && (
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedEmployee.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="productivity" fill="#3b82f6" />
                  <Bar dataKey="goals" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
      </div>
    </div>
  )}

  {/* 🔹 Add Employee Modal */}
<Dialog open={showAddModal} onOpenChange={setShowAddModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Employee</DialogTitle>
      <DialogDescription>Fill in the details to add a new employee.</DialogDescription>
    </DialogHeader>

    <div className="space-y-3">
      <Input name="employeeid" placeholder="Employee ID (lowercase)" value={form.employeeId} onChange={handleFormChange}/>
      <Input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} />
      <Input name="email" placeholder="Email" value={form.email} onChange={handleFormChange} />
      <Input name="department" placeholder="Department" value={form.department} onChange={handleFormChange} />
      <Input name="role" placeholder="Role" value={form.role} onChange={handleFormChange} />
      <Input name="position" placeholder="Position (e.g., Junior, Senior)" value={form.position} onChange={handleFormChange}/>
    </div>

    <DialogFooter>
      <Button onClick={handleAddEmployee}>Save</Button>
      <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* 🔹 Edit Employee Modal */}
<Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Employee</DialogTitle>
      <DialogDescription>Update employee details below.</DialogDescription>
    </DialogHeader>

    <div className="space-y-3">
      <Input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} />
      <Input name="email" placeholder="Email" value={form.email} onChange={handleFormChange} />
      <Input name="department" placeholder="Department" value={form.department} onChange={handleFormChange} />
      <Input name="role" placeholder="Role" value={form.role} onChange={handleFormChange} />
      <Input name="position" placeholder="Position" value={form.position} onChange={handleFormChange} />
    </div>

    <DialogFooter>
      <Button onClick={handleUpdateEmployee}>Update</Button>
      <Button variant="ghost" onClick={() => setEditingEmployee(null)}>Cancel</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Delete Dialog */}
<Dialog open={!!deletingEmployee} onOpenChange={() => setDeletingEmployee(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete {deletingEmployee?.name}?
      </DialogDescription>
    </DialogHeader>

    <DialogFooter className="flex gap-3">
      <Button
        variant="destructive"
        onClick={handleDeleteEmployee} // ✅ uses state internally
      >
        Delete
      </Button>
      <Button
        variant="ghost"
        onClick={() => setDeletingEmployee(null)} // ✅ fix typo
      >
        Cancel
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
</TabsContent>


       {/* ================= Admin Payroll Tab ================= */}
<TabsContent value="payroll" className="space-y-6">
  <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
    <CardHeader>
      <CardTitle>Salary Disbursement</CardTitle>
      <CardDescription>
        Set salary amounts for employees
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-4">
      {employees.map((emp) => {
        const salary = emp.salary || {};
        const { base = 0, bonus = 0, deductions = 0 } = salary;
        const netAmount = base + bonus - deductions;

        return (
          <Card
            key={emp._id}
            className="p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md rounded-lg"
          >
            {/* Employee Info */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">₹</span>
              </div>
              <div>
                <h4 className="font-medium">{emp.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {emp.employeeId} • {emp.department} • ₹
                  {netAmount.toLocaleString()}/month
                </p>
              </div>
            </div>

            {/* Action: Add Salary */}
            <div>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedEmployee(emp);
                  setSalaryModal({ base: base, bonus: bonus, deductions:deductions, period: "" });
                  setShowSalaryModal(true);
                }}
              >
                Add Salary
              </Button>
            </div>
          </Card>
        );
      })}
    </CardContent>
  </Card>

  {/* ================= Add Salary Modal ================= */}
  {showSalaryModal && selectedEmployee && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="fixed inset-0 bg-black/50"
      onClick={() => setShowSalaryModal(false)}
    />
    <div className="bg-white p-6 rounded-lg shadow-lg z-50 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Add Salary for {selectedEmployee.name}</h3>

      <div className="space-y-3">
        <Input
          type="text"
          placeholder="Period (YYYY-MM)"
          value={salaryModal.period}
          onChange={(e) =>
            setSalaryModal((prev) => ({ ...prev, period: e.target.value }))
          }
        />
        <Input
          type="number"
          placeholder="Base Salary"
          value={salaryModal.base}
          onChange={(e) =>
            setSalaryModal((prev) => ({ ...prev, base: Number(e.target.value) }))
          }
        />
        <Input
          type="number"
          placeholder="Bonus"
          value={salaryModal.bonus}
          onChange={(e) =>
            setSalaryModal((prev) => ({ ...prev, bonus: Number(e.target.value) }))
          }
        />
        <Input
          type="number"
          placeholder="Deductions"
          value={salaryModal.deductions}
          onChange={(e) =>
            setSalaryModal((prev) => ({ ...prev, deductions: Number(e.target.value) }))
          }
        />
      </div>

      <Button
        className="mt-4 w-full"
        onClick={submitSalary}
        disabled={
          !salaryModal.period ||
          !salaryModal.base ||
          existingPayrolls[selectedEmployee._id]?.includes(salaryModal.period)
        }
      >
        Add Salary
      </Button>

      {existingPayrolls[selectedEmployee._id]?.includes(salaryModal.period) && (
        <p className="text-red-500 mt-2 text-sm">
          Salary for this period is already set!
        </p>
      )}
        </div>
      </div>
  )}
</TabsContent>

    {/* ================= Departments Tab ================= */}
<TabsContent value="departments" className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {departments.map((dept, index) => (
      <Card
        key={dept._id}
        className="bg-white shadow-md hover:shadow-lg rounded-lg"
      >
        {/* Header */}
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-lg">{dept.name}</CardTitle>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: COLORS[index % COLORS.length] + "20" }}
          >
            <Building
              className="h-4 w-4"
              style={{ color: COLORS[index % COLORS.length] }}
            />
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Employees</span>
            <span className="font-medium">{dept.count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Budget</span>
            <span className="font-medium">
              ₹{(deptBudgets[dept._id] ?? dept.budget ?? 0).toLocaleString()}
            </span>
          </div>

          {/* Manage Button → Only show if admin */}
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={() => setManagingDepartment(dept)}
            >
              Manage Department
            </Button>
          )}
        </CardContent>
      </Card>
    ))}
  </div>

  {/* ===== Manage Department Modal ===== */}
{managingDepartment && (
  <Dialog
    open={true}
    onOpenChange={() => setManagingDepartment(null)}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Manage Department</DialogTitle>
        <DialogDescription>
          Update budget for {managingDepartment.name}
        </DialogDescription>
      </DialogHeader>

      <Input
        type="number"
        value={managingDepartment.budget || 0}
        onChange={(e) => {
          const newBudget = Number(e.target.value);

          // Update modal state
          setManagingDepartment({
            ...managingDepartment,
            budget: newBudget,
          });

          // Update the displayed budget in the card immediately
          setDeptBudgets((prev) => ({
            ...prev,
            [managingDepartment._id]: newBudget,
          }));
        }}
        placeholder="Budget"
      />

      <DialogFooter className="flex gap-3">
        <Button
          variant="destructive"
          onClick={async () => {
            try {
              // PUT request to backend
              await api.put(
                `/api/departments/${managingDepartment._id}`,
                { budget: managingDepartment.budget },
                { headers: { "x-admin": "true" } }
              );

              // Update the department in the departments array (state)
              setDepartments((prev) =>
                prev.map((d) =>
                  d._id === managingDepartment._id
                    ? { ...d, budget: managingDepartment.budget }
                    : d
                )
              );

              setManagingDepartment(null);
            } catch (err) {
              console.error("Failed to update budget:", err);
              alert("Failed to update budget. Check console for details.");
            }
          }}
        >
          Save
        </Button>

        <Button variant="ghost" onClick={() => setManagingDepartment(null)}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
</TabsContent>

  {/* ================= Leave Approval Tab ================= */}
<TabsContent value="leaves">
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Pending Leave Requests</h2>
    {leaves.filter(l => l.status === "pending").length === 0 ? (
      <p>No pending leaves.</p>
    ) : (
      leaves
        .filter(l => l.status === "pending") // show only pending leaves
        .map((leave) => (
          <Card key={leave._id} className="bg-white shadow-md rounded-lg">
            <CardHeader>
              <CardTitle>
                {leave.user?.name || "-"} ({leave.user?.email || "-"})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Type:</strong> {leave.type}</p>
              <p>
                <strong>From:</strong> {new Date(leave.from).toLocaleDateString()}{" "}
                <strong>To:</strong> {new Date(leave.to).toLocaleDateString()}
              </p>
              <p><strong>Reason:</strong> {leave.reason}</p>
              <p><strong>Status:</strong> {leave.status}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleLeaveApproval(leave._id, "approved")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleLeaveApproval(leave._id, "rejected")}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
    )}
  </div>
</TabsContent>


        {/* ✅ Feedback Tab */}
<TabsContent value="feedback" className="space-y-6">
  {/* Feedback Form */}
  <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
    <CardHeader>
      <CardTitle>Employee Feedback</CardTitle>
      <CardDescription>Provide feedback to employees</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label>Select Employee</Label>
        <Select
          value={selectedEmployee?._id || ""}
          onValueChange={(val) => {
            const emp = employees.find((e) => e._id === val);
            setSelectedEmployee(emp || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee._id} value={employee._id}>
                {employee.name} – {employee.department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Feedback</Label>
        <Textarea
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
        />
      </div>

      <Button
        onClick={submitFeedback}
        disabled={!selectedEmployee || !feedback}
      >
        <Send className="h-4 w-4 mr-2" />
        Send Feedback
      </Button>
    </CardContent>
  </Card>

  {/* Sent Feedback History (Admin) */}
<Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
  <CardHeader>
    <CardTitle>Sent Feedback (Admin)</CardTitle>
  </CardHeader>
  <CardContent>
    {sentFeedback.length > 0 ? (
      <ul className="space-y-2">
        {sentFeedback.map((f, idx) => (
          <li
            key={idx}
            className="p-3 border rounded-lg shadow-sm bg-gray-50"
          >
            <p className="font-semibold">
              {f.user?.name || f.employeeName}
              <span className="ml-2 text-xs text-blue-600">
                (by Admin)
              </span>
            </p>
            <p className="text-sm text-gray-600">{f.message}</p>
            <p className="text-xs text-gray-400">
              {new Date(f.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <p>No feedbacks sent yet.</p>
    )}
  </CardContent>
</Card>
</TabsContent>
  </Tabs>
    </div>
    </div>
 );
}
            