"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import jsPDF from "jspdf";
import { generatePayslip } from "@/lib/generatePayslip";


const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6",
];

export default function HRDashboard() {
  const [userLoaded, setUserLoaded] = useState(false);
  const [hrData, setHrData] = useState<any>(null);
  const [employeeData, setEmployeeData] = useState(null)
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [deptBudgets, setDeptBudgets] = useState<{ [key: string]: number }>({});
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [payrollStatus, setPayrollStatus] = useState<{ [key: string]: string }>({});
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [sentFeedback, setSentFeedback] = useState<any[]>([]);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showPerformanceMap, setShowPerformanceMap] = useState<{ [key: string]: boolean }>({});

  
  useEffect(() => {
    // Listen for Firebase auth changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log("No user logged in, redirecting...");
        window.location.href = "/";
        return;
      }
      console.log("Current user:", user);
      await fetchDashboardData();
      setUserLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // HR profile
     // Employee profile
           const profileRes = await api.get("/api/users/me")
           const profile = profileRes.data
           setHrData(profile)

      // Employees
      const empRes = await api.get("/api/users/all");
const users = empRes.data;
setEmployees(users);

      // Performance
      const perfRes = await api.get("/api/performances");
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
const deptRes = await api.get("/api/departments");
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

      // Employee dashboard payroll fetch
const payrollRes = await api.get("/api/payroll");
setPayrollData(payrollRes.data); // only that employee’s payroll info


      // Feedback
      const fbRes = await api.get("/api/feedbacks");
  setSentFeedback(
    fbRes.data.map((f: any) => ({
      employeeName: f.user?.name || "-",
      message: f.message,
      date: new Date(f.createdAt || f.date).toISOString().slice(0, 10),
      senderRole: f.senderRole,
    }))
  );
} catch (err) {
  console.error("Error fetching HR feedback:", err);
}
  };

  // Pay salary
const handlePaySalary = async (payrollId: string) => {
  try {
    await api.patch(`/api/payroll/${payrollId}/pay`);
    setPayrollData((prev) =>
      prev.map((p) =>
        p._id === payrollId ? { ...p, status: "paid" } : p
      )
    );
  } catch (err) {
    console.error("Error paying salary:", err);
  }
};


  const submitFeedback = async () => {
  if (!selectedEmployee || !feedback) return;
  try {
    await api.post("/api/feedbacks", {
      userId: selectedEmployee._id,
      message: feedback,
    });

    setSentFeedback((prev) => [
      {
        employeeName: selectedEmployee.name,
        message: feedback,
        createdAt: new Date().toISOString(), // ✅ always use createdAt
      },
      ...prev,
    ]);

    setFeedback("");
    setSelectedEmployee(null);
  } catch (err) {
    console.error("Failed to submit feedback:", err);
  }
};

  const togglePerformance = (empId: string) => {
  setShowPerformanceMap((prev) => ({ ...prev, [empId]: !prev[empId] }));
};

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/";
  };

  if (!userLoaded) return <p>Loading HR dashboard...</p>;

  // Compute average performance per department
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
      HR Dashboard Loaded ✅
    </h1>
      {/* ✅ Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {hrData?.dashboardTitle || "HR Dashboard"}
                </h1>
                <p className="text-sm text-gray-500">
                  {hrData?.name || "Shweta Kadam"}
                  {hrData?.role ? ` • ${hrData.role}` : ""}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* ✅ Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* ✅ Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
          {/* HR Profile */}
  <Card className="bg-white shadow-lg hover:shadow-xl transition">
    <CardHeader>
      <CardTitle>HR Profile</CardTitle>
      <CardDescription>Your details</CardDescription>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      {Object.entries({
        "Employee ID":  "123emp",
        "Full Name": hrData?.name,
        "Role": hrData?.role,
        "Department":"Human Resources",
        "Email": hrData?.email,
        "Join Date": "2025-09-07",
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
      {payrollData
        .filter((p) => {
          // only current month
          const currentMonth = new Date().toISOString().slice(0, 7);
          return p.period?.startsWith(currentMonth);
        })
        .reduce((acc, p) => acc + (p.net || 0), 0)
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
    <CardHeader>
      <CardTitle>Employee Data</CardTitle>
      <CardDescription>View all employees</CardDescription>
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
              <p className="text-sm text-muted-foreground">
                {emp.role} • {emp.department}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Badge variant="outline">{emp.employeeId}</Badge>
            <Badge variant={emp.status === "active" ? "default" : "secondary"}>
              {emp.status || "active"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedEmployee(emp)}
            >
              View Details
            </Button>
          </div>
        </Card>
      ))}
    </CardContent>
  </Card>

  {/* ✅ Sliding Panel */}
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

      {/* Performance Button */}
      <div className="mt-6">
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowPerformance(!showPerformance)}
        >
          {showPerformance ? "Hide Performance" : "View Performance"}
        </Button>
      </div>

      {/* Performance Chart */}
      {showPerformance && selectedEmployee.performance?.length > 0 && (
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
</TabsContent>

        {/* ✅ Payroll Tab */}
{/* ✅ Payroll Tab (HR Dashboard) */}
<TabsContent value="payroll" className="space-y-6">
  <Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
    <CardHeader>
      <CardTitle>Salary Disbursement</CardTitle>
      <CardDescription>View and process monthly salary payments</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {payrollData.length === 0 ? (
        <p className="text-muted-foreground">No payroll records found.</p>
      ) : (
        payrollData.map((payroll) => {
          const emp = payroll.user; // employee info from populated payroll
          const netAmount = payroll.net;
          const status = payroll.status;

          return (
            <Card
              key={payroll._id}
              className="p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md rounded-lg"
            >
              {/* Employee + Period Info */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">₹</span>
                </div>
                <div>
                  <h4 className="font-medium">{payroll.user?.name} ({payroll.user?.employeeId}) • {payroll.user?.department}</h4>
        <p className="text-sm text-muted-foreground">
           Period: {payroll.period} • Net: ₹{payroll.net.toLocaleString()}
        </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {status === "paid" ? (
                  <Badge variant="default">Paid</Badge>
                ) : status === "processing" ? (
                  <Badge variant="secondary">Processing...</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handlePaySalary(payroll._id)}
                  >
                    Pay Salary
                  </Button>
                )}
                {status === "paid" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generatePayslip(payroll, hrData?.name || "HR Admin")}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Payslip
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      )}
    </CardContent>
  </Card>
</TabsContent>


          {/* ✅ Departments Tab */}
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
              ₹{(deptBudgets[dept._id] || 0).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    ))}
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

  {/* Sent Feedback History (HR) */}
<Card className="bg-white shadow-md hover:shadow-lg rounded-lg">
  <CardHeader>
    <CardTitle>Sent Feedback (HR)</CardTitle>
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
              <span className="ml-2 text-xs text-green-600">
                (by HR)
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
            