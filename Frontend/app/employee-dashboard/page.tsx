"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Target, TrendingUp, User, CheckCircle, XCircle, Star } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import api from "@/lib/api"            // axios client created earlier
import { useAuth } from "@/lib/auth-context" // auth context created earlier

export default function EmployeeDashboard() {
  // get logged-in user (expects auth-context from earlier)
  const { user } = useAuth()

  // use employee ID from logged-in user when available
  const employeeIdFromUser = user?.employeeId || user?._id || "EMP001"

  // --- state that used to be static / mock
  const [employeeData, setEmployeeData] = useState<any>({
    id: employeeIdFromUser,
    name: "Loading...",
    department: "",
    position: "",
    email: "",
    joinDate: "",
    salary: 0,
  })

  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [attendanceStatus, setAttendanceStatus] = useState("present")
  const [todayMarked, setTodayMarked] = useState(false)
  const [goals, setGoals] = useState<any[]>([])
  const [leaveRequest, setLeaveRequest] = useState({ type: "", reason: "", startDate: "", endDate: "" })
  const [leaveHistory, setLeaveHistory] = useState<any[]>([])
  const [feedbackData, setFeedbackData] = useState<any[]>([])
  const [salaryHistory, setSalaryHistory] = useState<any[]>([])
  const [leaveBalance, setLeaveBalance] = useState({
    vacation: 0,
    sick: 0,
    personal: 0,
    emergency: 0,
  })

  // base url from env or fallback
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  // --- fetch all required data once user/employeeId available
  useEffect(() => {
    if (!employeeIdFromUser) return

    const fetchAll = async () => {
      try {
        // employee profile
        try {
          const { data } = await api.get(`${API_BASE}/employees/${employeeIdFromUser}`)
          if (data) setEmployeeData(data)
        } catch (e) {
          // fallback: if endpoint not present, try /users/:id or keep existing state
          console.warn("employee fetch:", e)
        }

        // performance/time-series (if available)
        try {
          const { data } = await api.get(`${API_BASE}/performance/${employeeIdFromUser}`)
          // expected shape: [{ month: 'Jan', productivity: 85, goals: 90 }, ...]
          if (Array.isArray(data)) setPerformanceData(data)
        } catch (e) {
          console.warn("performance fetch:", e)
        }

        // attendance history
        try {
          const { data } = await api.get(`${API_BASE}/attendance/${employeeIdFromUser}`)
          // expected: [{ date: '2025-08-01', status: 'present', hours: 8 }, ...] OR monthly aggregated
          if (Array.isArray(data)) setAttendanceData(data)
        } catch (e) {
          console.warn("attendance fetch:", e)
        }

        // goals
        try {
          const { data } = await api.get(`${API_BASE}/goals/${employeeIdFromUser}`)
          if (Array.isArray(data)) setGoals(data)
        } catch (e) {
          console.warn("goals fetch:", e)
        }

        // leaves
        try {
          const { data } = await api.get(`${API_BASE}/leaves/${employeeIdFromUser}`)
          if (Array.isArray(data)) setLeaveHistory(data)
        } catch (e) {
          console.warn("leaves fetch:", e)
        }

        // feedback
        try {
          const { data } = await api.get(`${API_BASE}/feedback/${employeeIdFromUser}`)
          if (Array.isArray(data)) setFeedbackData(data)
        } catch (e) {
          console.warn("feedback fetch:", e)
        }

        // payroll / salary history
        try {
          const { data } = await api.get(`${API_BASE}/payments/${employeeIdFromUser}`)
          if (Array.isArray(data)) setSalaryHistory(data)
        } catch (e) {
          console.warn("payments fetch:", e)
        }

        // leave balance (optional endpoint)
        try {
          const { data } = await api.get(`${API_BASE}/leaves/balance/${employeeIdFromUser}`)
          if (data) setLeaveBalance(data)
        } catch (e) {
          // fallback keep default
        }
      } catch (error) {
        console.error("Error fetching employee dashboard data:", error)
      }
    }

    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeIdFromUser])

  // --- handlers that call backend and refresh local state

  const markAttendance = async () => {
    try {
      // POST /attendance  body: { employeeId, status } (adjust to your backend)
      const { data } = await api.post(`${API_BASE}/attendance`, {
        employeeId: employeeIdFromUser,
        status: attendanceStatus,
      })
      setTodayMarked(true)
      alert("Attendance marked successfully")
      // refetch attendance list
      try {
        const res = await api.get(`${API_BASE}/attendance/${employeeIdFromUser}`)
        if (Array.isArray(res.data)) setAttendanceData(res.data)
      } catch (e) {
        console.warn("refetch attendance failed", e)
      }
    } catch (error: any) {
      console.error("Failed to mark attendance:", error)
      alert(error?.response?.data?.message || "Failed to mark attendance")
    }
  }

  const submitLeaveRequest = async () => {
    // basic validation
    if (!leaveRequest.type || !leaveRequest.startDate || !leaveRequest.endDate) {
      alert("Please choose leave type and dates")
      return
    }
    try {
      // POST /leaves (or /leave) body: { employeeId, type, startDate, endDate, reason }
      const { data } = await api.post(`${API_BASE}/leaves`, {
        employeeId: employeeIdFromUser,
        type: leaveRequest.type,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        reason: leaveRequest.reason,
      })
      alert("Leave request submitted")
      setLeaveRequest({ type: "", reason: "", startDate: "", endDate: "" })
      // refresh leaveHistory
      const res = await api.get(`${API_BASE}/leaves/${employeeIdFromUser}`)
      if (Array.isArray(res.data)) setLeaveHistory(res.data)
    } catch (error: any) {
      console.error("Failed to submit leave:", error)
      alert(error?.response?.data?.message || "Failed to submit leave request")
    }
  }

  const submitFeedback = async (message: string) => {
    if (!message) {
      alert("Please enter feedback message")
      return
    }
    try {
      await api.post(`${API_BASE}/feedback`, {
        employeeId: employeeIdFromUser,
        message,
      })
      alert("Feedback submitted")
      // refresh feedback list
      const res = await api.get(`${API_BASE}/feedback/${employeeIdFromUser}`)
      if (Array.isArray(res.data)) setFeedbackData(res.data)
    } catch (error: any) {
      console.error("Failed to submit feedback:", error)
      alert(error?.response?.data?.message || "Failed to submit feedback")
    }
  }

  // small helper to compute completed goals if API doesn't provide aggregated stat
  const completedGoalsCount = () => (goals?.filter?.((g: any) => g.status === "completed")?.length || 0)

  // --- local temporary feedback input
  const [feedbackInput, setFeedbackInput] = useState("")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {employeeData.name}</h1>
                <p className="text-sm text-gray-500">{employeeData.position} • {employeeData.department}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="leaves">Leaves</TabsTrigger>
            <TabsTrigger value="salary">Salary</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Profile Info */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Employee Profile</CardTitle>
                <CardDescription>Your personal and professional information</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {Object.entries({
                  "Employee ID": employeeData.id,
                  "Full Name": employeeData.name,
                  "Department": employeeData.department,
                  "Position": employeeData.position,
                  "Email": employeeData.email,
                  "Join Date": employeeData.joinDate,
                }).map(([label, value], idx) => (
                  <div key={idx}>
                    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
                    <p className="text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceData?.length ? `${Math.round((performanceData.reduce((s, p) => s + (p.productivity || 0), 0) / performanceData.length))}%` : "—"}</div>
                  <p className="text-xs opacity-80">Productivity Score</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                  <Clock className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {attendanceData?.length ? `${attendanceData.filter(a => a.status === "present").length}/${attendanceData.length}` : "—"}
                  </div>
                  <p className="text-xs opacity-80">Days Present</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Goals</CardTitle>
                  <Star className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {completedGoalsCount()}/{goals.length || 0}
                  </div>
                  <p className="text-xs opacity-80">Completed</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                  <Calendar className="h-4 w-4 text-white/80" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveBalance?.vacation ?? 0}</div>
                  <p className="text-xs opacity-80">Vacation Days</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Your productivity and goal completion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="productivity" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="goals" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            {/* Mark Today's Attendance */}
            <Card className="bg-white shadow-md hover:shadow-lg transition rounded-lg">
              <CardHeader>
                <CardTitle>Mark Today's Attendance</CardTitle>
                <CardDescription>Record your attendance for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Select value={attendanceStatus} onValueChange={setAttendanceStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="half-day">Half Day</SelectItem>
                      <SelectItem value="work-from-home">Work From Home</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={markAttendance}
                    disabled={todayMarked}
                    className={`font-medium ${
                      attendanceStatus === "present"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : attendanceStatus === "absent"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : attendanceStatus === "half-day"
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {todayMarked ? "Marked" : "Mark Attendance"}
                  </Button>
                </div>
                {todayMarked && (
                  <p className="text-sm text-green-700 font-medium">✓ Attendance marked successfully for today</p>
                )}
              </CardContent>
            </Card>

            {/* Attendance History */}
            <div className="space-y-3">
              {attendanceData.length === 0 && (
                <p className="text-sm text-muted-foreground">No attendance records found.</p>
              )}
              {attendanceData.map((record, index) => (
                <Card
                  key={index}
                  className={`flex items-center justify-between p-4 shadow-sm rounded-lg transition hover:shadow-md ${
                    record.status === "present"
                      ? "bg-green-50 border border-green-200"
                      : record.status === "absent"
                      ? "bg-red-50 border border-red-200"
                      : record.status === "work-from-home"
                      ? "bg-indigo-50 border border-indigo-200"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {record.status === "present" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : record.status === "absent" ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : record.status === "work-from-home" ? (
                      <Clock className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Target className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className="font-medium text-gray-700">{record.date || record.createdAt?.split("T")[0]}</span>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`px-2 py-1 text-sm font-semibold rounded ${
                        record.status === "present"
                          ? "bg-green-100 text-green-800"
                          : record.status === "absent"
                          ? "bg-red-100 text-red-800"
                          : record.status === "work-from-home"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {String(record.status).replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">{record.hours ?? "-"}h worked</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            {goals.length === 0 && <p className="text-sm text-muted-foreground">No goals found.</p>}
            {goals.map((goal: any) => (
              <Card key={goal.id || goal._id} className="bg-white/90 shadow-lg hover:shadow-xl transition">
                <CardHeader className="flex flex-col items-start space-y-2">
                  <div className="flex justify-between w-full items-start">
                    <CardTitle className="text-left">{goal.title}</CardTitle>
                    <Button size="sm" variant="outline">
                      Update Progress
                    </Button>
                  </div>
                  <Badge
                    className={`inline-flex rounded-full text-xs font-semibold px-2 py-0.5 ${
                      goal.status === "completed"
                        ? "bg-green-500 text-white"
                        : goal.status === "in-progress"
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                        : "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                    }`}
                  >
                    {goal.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress
                    value={goal.progress}
                    className="h-3 rounded-full bg-white/30"
                    style={{ background: "linear-gradient(to right, #3b82f6, #6366f1)" }}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>Deadline: {goal.deadline}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Leaves Tab */}
          <TabsContent value="leaves" className="space-y-6">
            {/* Request Leave Card */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Request Leave</CardTitle>
                <CardDescription>Submit a new leave request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Leave Type</Label>
                    <Select
                      value={leaveRequest.type}
                      onValueChange={(value) => setLeaveRequest({ ...leaveRequest, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                        <SelectItem value="emergency">Emergency Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={leaveRequest.startDate}
                      onChange={(e) => setLeaveRequest({ ...leaveRequest, startDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={leaveRequest.endDate}
                    onChange={(e) => setLeaveRequest({ ...leaveRequest, endDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Please provide a reason for your leave request..."
                    value={leaveRequest.reason}
                    onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                  />
                </div>

                <Button
                  onClick={submitLeaveRequest}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm rounded-md px-4 py-2"
                >
                  Submit Leave Request
                </Button>
              </CardContent>
            </Card>

            {/* Leave Balance Card */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Leave Balance</CardTitle>
                <CardDescription>Your remaining leave days for this year</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { count: leaveBalance.vacation ?? 0, label: "Vacation Days", color: "text-blue-600" },
                  { count: leaveBalance.sick ?? 0, label: "Sick Days", color: "text-green-600" },
                  { count: leaveBalance.personal ?? 0, label: "Personal Days", color: "text-purple-600" },
                  { count: leaveBalance.emergency ?? 0, label: "Emergency Days", color: "text-orange-600" },
                ].map((item, idx) => (
                  <div key={idx} className="text-left p-4 border rounded-lg">
                    <div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Leave History / Status Card */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Leave Status</CardTitle>
                <CardDescription>Track your leave requests and their approval status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaveHistory.length === 0 && <p className="text-sm text-muted-foreground">No leave requests yet.</p>}
                {leaveHistory.map((leave, idx) => (
                  <Card key={idx} className="p-3 shadow-sm border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{leave.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.startDate} to {leave.endDate}
                      </p>
                    </div>
                    <Badge
                      className={`min-w-[90px] py-1 text-sm font-semibold rounded-md text-center ${
                        leave.status === "approved"
                          ? "bg-green-500 text-white"
                          : leave.status === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-600 text-white"
                      }`}
                      aria-label={`Leave status: ${leave.status}`}
                    >
                      {String(leave.status).toUpperCase()}
                    </Badge>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salary Tab */}
          <TabsContent value="salary" className="space-y-6">
            {/* Salary Information */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Salary Information</CardTitle>
                <CardDescription>Your current salary details and employee info</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {Object.entries({
                  "Employee ID": employeeData.id,
                  "Full Name": employeeData.name,
                  "Position": employeeData.position,
                  "Department": employeeData.department,
                  "Base Salary": `Rs.${employeeData.salary?.toLocaleString?.() ?? employeeData.salary}`,
                  "Join Date": employeeData.joinDate,
                }).map(([label, value], idx) => (
                  <div key={idx}>
                    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
                    <p className="text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Salary Breakdown */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Salary Breakdown</CardTitle>
                <CardDescription>Details of your earnings and deductions</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* If salaryHistory or payroll breakdown available from backend, map it here */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">Base Salary</p>
                  <p className="text-lg font-semibold text-gray-800">Rs.{employeeData.salary?.toLocaleString?.() ?? employeeData.salary}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">Bonus</p>
                  <p className="text-lg font-semibold text-gray-800">Rs.5,000</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">Deductions</p>
                  <p className="text-lg font-semibold text-gray-800">Rs.1,200</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">Net Salary</p>
                  <p className="text-lg font-semibold text-gray-800">Rs.{(Number(employeeData.salary || 0) + 5000 - 1200).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Salary Payment Status */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Salary Payment Status</CardTitle>
                <CardDescription>Track your recent salary payments</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salaryHistory.length === 0 && <p className="text-sm text-muted-foreground">No payment records found.</p>}
                {salaryHistory.map((pay: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border flex justify-between items-center transition ${
                      pay.status === "Paid" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{pay.month || pay.period}</p>
                      <p className="text-sm text-muted-foreground">Amount: Rs.{pay.amount}</p>
                      <p className="text-sm text-muted-foreground">Paid on: {pay.date || pay.paidAt?.split?.("T")?.[0]}</p>
                    </div>
                    <div>
                      {pay.status === "Paid" ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>Feedback from your manager and HR</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {feedbackData.length === 0 && <p className="text-sm text-muted-foreground">No feedback yet.</p>}
                {feedbackData.map((feedback) => (
                  <div
                    key={feedback.id || feedback._id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">{feedback.sender || feedback.fromName || "HR"}</span>
                      <span className="text-xs text-gray-500">{feedback.date || feedback.createdAt?.split?.("T")?.[0]}</span>
                    </div>
                    <p className="text-sm text-gray-700">{feedback.message || feedback.text}</p>
                  </div>
                ))}

                {/* Submit feedback input */}
                <div className="mt-4">
                  <Label>Send Feedback / Request</Label>
                  <Textarea value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} placeholder="Write your feedback or request..." />
                  <div className="mt-2">
                    <Button onClick={() => { submitFeedback(feedbackInput); setFeedbackInput(""); }}>Send</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
