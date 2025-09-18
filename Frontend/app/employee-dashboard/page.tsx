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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Target, TrendingUp, User, CheckCircle, XCircle, Star, FileText } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import api from "@/lib/apiClient";
import { auth } from "@/lib/firebaseClient"
import { generatePayslip } from "@/lib/generatePayslip";


export default function EmployeeDashboardData() {
  const [employeeData, setEmployeeData] = useState(null)
  const [performanceData, setPerformanceData] = useState([])
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [payrollData, setPayrollData] = useState([])
  const [feedbackData, setFeedbackData] = useState([])
  const [attendanceStatus, setAttendanceStatus] = useState("present")
  const [todayMarked, setTodayMarked] = useState(false)
  const [goals, setGoals] = useState([])
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState<{ open: boolean; goal?: any }>({ open: false })
  const [newGoal, setNewGoal] = useState({ title: "", description: "", deadline: "" })
  const [progress, setProgress] = useState<number>(0)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; goalId: string | null }>({open: false, goalId: null,})
  const [leaveRequest, setLeaveRequest] = useState({ type: "casual", startDate: "", endDate: "", reason: "" })
  const [userLoaded, setUserLoaded] = useState(false)
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [thisMonthPerformance, setThisMonthPerformance] = useState<any>(null);


  useEffect(() => {
  // Listen for Firebase auth changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log("No user logged in, redirecting...")
        window.location.href = "/"
        return
      }
      console.log("Current user:", user)
      await fetchDashboardData()
      setUserLoaded(true)
    })

    return () => unsubscribe()
  }, [])



  const fetchDashboardData = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      // Employee profile
      const profileRes = await api.get("/api/users/me")
      const profile = profileRes.data
      setEmployeeData(profile)

      // Performance
      const perfRes = await api.get("/api/performances/me")
      const perf = perfRes.data.map((p) => ({
        month: p.period,
        productivity: p.score || 0,
        goals: p.notes ? 100 : 0,
      })).reverse()
      setPerformanceData(perf)

      const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-09"
      const monthPerf = perfRes.data.find((p: any) => p.period === currentMonth);
      setThisMonthPerformance(monthPerf || null);

      // Attendance
const attendanceRes = await api.get("/api/attendance/me")
const rawAttendance = attendanceRes.data


const attendance = rawAttendance.map((a) => ({
  date: new Date(a.date),
  status: a.status,
  hours: a.hours || 8,
}))

// ✅ Save formatted for UI
setAttendanceData(
  attendance.map((a) => ({
    ...a,
    date: a.date.toLocaleDateString(),
  }))
)

// ✅ Detect today's attendance
const today = new Date()
today.setHours(0, 0, 0, 0)
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

setTodayMarked(
  attendance.some((a) => {
    const d = new Date(a.date)
    return d >= today && d < tomorrow
  })
)

      // Leaves
      const leaveRes = await api.get("/api/leaves/me")
      const leaves = leaveRes.data.map((l) => ({
        type: l.type,
        startDate: new Date(l.from).toLocaleDateString(),
        endDate: new Date(l.to).toLocaleDateString(),
        status: l.status,
      }))
      setLeaveData(leaves)

      // Goals
      const goalsRes = await api.get("/api/goals/me")
      setGoals(goalsRes.data)

      // Payroll
      const payrollRes = await api.get("/api/payroll/me")
      setPayrollData(payrollRes.data)

      // Feedback
      const feedbackRes = await api.get("/api/feedbacks/me")
      setFeedbackData(feedbackRes.data.map((f) => ({
        id: f._id,
        sender: f.senderRole,
        message: f.message,
        date: new Date(f.date).toLocaleDateString(),
      })))

    } catch (err) {
      console.error("Failed to fetch employee dashboard data:", err)
    }
  }

  // Leave request
  const submitLeaveRequest = async () => {
    try {
      const user = auth.currentUser
      if (!user) return

      await api.post("/api/leaves", {
        type: leaveRequest.type,
        from: leaveRequest.startDate,
        to: leaveRequest.endDate,
        reason: leaveRequest.reason,
      })

      const leavesRes = await api.get("/api/leaves/me")
      const leaves = leavesRes.data.map((l) => ({
        type: l.type,
        startDate: new Date(l.from).toLocaleDateString(),
        endDate: new Date(l.to).toLocaleDateString(),
        status: l.status,
      }))
      setLeaveData(leaves)
      setLeaveRequest({ type: "casual", startDate: "", endDate: "", reason: "" })
    } catch (err) {
      console.error("Failed to submit leave request:", err)
    }
  }

  // Mark attendance
const markAttendance = async () => {
  try {
    const user = auth.currentUser
    if (!user) return

    const newRecord = await api
      .post("/api/attendance", { status: attendanceStatus })
      .then((res) => res.data)

    const formattedRecord = {
      date: new Date(newRecord.date).toLocaleDateString(),
      status: newRecord.status,
      hours: newRecord.hours || 8,
    }

    // ✅ prepend the new record to history
    setAttendanceData((prev) => [formattedRecord, ...prev])

    // ✅ mark today as completed
    setTodayMarked(true)
  } catch (err) {
    console.error("Failed to mark attendance:", err)
  }
}

// Create goal
const createGoal = async () => {
  try {
    const res = await api.post("/api/goals", newGoal);
    // Add new goal at the top of the list
    setGoals([res.data, ...goals]);
    setNewGoal({ title: "", description: "", deadline: "" });
    setOpenCreate(false);
  } catch (err) {
    console.error("Failed to create goal:", err);
  }
}

const deleteGoal = async (goalId: string) => {
  try {
    await api.delete(`/api/goals/${goalId}`)
    setGoals(goals.filter((g) => g._id !== goalId))
  } catch (err) {
    console.error("Failed to delete goal:", err)
  }
}


// Update goal progress
const updateProgress = async (goalId: string) => {
  try {
    // Determine new status
    const newStatus = progress >= 100 ? "completed" : "in-progress";

    const res = await api.put(`/api/goals/${goalId}`, {
      progress,
      status: newStatus,
    });

    // Update local state
    setGoals(goals.map((g) => (g._id === goalId ? res.data : g)));

    // Close dialog
    setOpenUpdate({ open: false, goalId: null });
    setProgress(0);
  } catch (err) {
    console.error("Failed to update progress:", err);
  }
};


  if (!userLoaded) return <p>Loading dashboard...</p>


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {employeeData?.name}</h1>
                <p className="text-sm text-gray-500">{employeeData?.position} • {employeeData?.department}</p>
              </div>
            </div>
            <Button
  variant="outline"
  onClick={async () => {
    try {
      await auth.signOut(); // ✅ clear Firebase session
      window.location.href = "/"; // redirect to login/landing
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }}
>
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
          "Employee ID": employeeData?.employeeId,
          "Full Name": employeeData?.name,
          "Department": employeeData?.department,
          "Position": employeeData?.position,
          "Email": employeeData?.email,
          "Join Date": new Date(employeeData?.joinedOn).toLocaleDateString(),
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
      <div className="text-2xl font-bold">
        {thisMonthPerformance ? `${thisMonthPerformance.score || 0}%` : "-"}
      </div>
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
        {attendanceData.filter(a => a.status !== "absent").length}/{attendanceData.length} 
      </div>
      <p className="text-xs opacity-80">Days Present / Work</p>
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
    <CardHeader className="flex justify-between pb-2">
      <CardTitle className="text-sm font-medium">Goals</CardTitle>
      <Star className="h-4 w-4 text-white/80" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {goals.filter((g) => g.status === "completed").length}/{goals.length}
      </div>
      <p className="text-xs opacity-80">Completed</p>
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
    <CardHeader className="flex justify-between pb-2">
      <CardTitle className="text-sm font-medium">Leaves Taken</CardTitle>
      <Calendar className="h-4 w-4 text-white/80" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {leaveData.filter(l => l.status === "approved").length} 
      </div>
      <p className="text-xs opacity-80">Approved</p>
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
            <p className="text-sm text-green-700 font-medium">
              ✓ Attendance marked successfully for today
            </p>
          )}
        </CardContent>
      </Card>

      {/* Attendance History */}
      <div className="space-y-3">
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
              <span className="font-medium text-gray-700">{record.date}</span>
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
                {record.status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">{record.hours}h worked</p>
            </div>
          </Card>
        ))}
      </div>
    </TabsContent>
          
                   {/* Goals Tab */}
<TabsContent value="goals" className="space-y-6">
  {/* Create Goal Button */}
  <Button
    onClick={() => setOpenCreate(true)}
    className="bg-blue-600 hover:bg-blue-700 text-white"
  >
    + Create Goal
  </Button>

  {/* Goals List */}
{goals.map((goal) => (
  <Card key={goal._id} className="bg-white/90 shadow-lg hover:shadow-xl transition">
    <CardHeader className="flex flex-col items-start space-y-2">
      <div className="flex justify-between w-full items-start">
        <CardTitle className="text-left">{goal.title}</CardTitle>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpenUpdate({ open: true, goal })}
          >
            Update Progress
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteDialog({ open: true, goalId: goal._id })}
          >
            Delete
          </Button>
        </div>
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
        <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
      </div>
    </CardContent>
  </Card>
))}

  {/* Create Goal Dialog */}
  <Dialog open={openCreate} onOpenChange={setOpenCreate}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Goal</DialogTitle>
      </DialogHeader>
      <Input
        placeholder="Title"
        value={newGoal.title}
        onChange={(e) =>
          setNewGoal({ ...newGoal, title: e.target.value })
        }
      />
      <Textarea
        placeholder="Description"
        value={newGoal.description}
        onChange={(e) =>
          setNewGoal({ ...newGoal, description: e.target.value })
        }
      />
      <Input
        type="date"
        value={newGoal.deadline}
        onChange={(e) =>
          setNewGoal({ ...newGoal, deadline: e.target.value })
        }
      />
      <DialogFooter>
        <Button
          onClick={createGoal}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Save Goal
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Update Progress Dialog */}
  <Dialog
    open={openUpdate.open}
    onOpenChange={(val) =>
      setOpenUpdate({ open: val, goal: openUpdate.goal })
    }
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Update Progress</DialogTitle>
      </DialogHeader>
      {openUpdate.goal && (
        <>
          <p className="text-sm mb-2">Goal: {openUpdate.goal.title}</p>
          <Input
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
          />
          <DialogFooter>
            <Button
              onClick={() => updateProgress(openUpdate.goal._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  </Dialog>

  <Dialog
  open={deleteDialog.open}
  onOpenChange={(val) => setDeleteDialog({ ...deleteDialog, open: val })}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Delete</DialogTitle>
    </DialogHeader>
    <p className="my-4 text-sm">
      Are you sure you want to delete this goal? This action cannot be undone.
    </p>
    <DialogFooter className="flex justify-end space-x-2">
      <Button
        variant="outline"
        onClick={() => setDeleteDialog({ open: false, goalId: null })}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          if (deleteDialog.goalId) deleteGoal(deleteDialog.goalId)
          setDeleteDialog({ open: false, goalId: null })
        }}
      >
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
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

            {/* Leave History / Status Card */}
            <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
              <CardHeader>
                <CardTitle>Leave Status</CardTitle>
                <CardDescription>Track your leave requests and their approval status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaveData.map((leave, idx) => (
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
                      {leave.status.toUpperCase()}
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
    "Employee ID": employeeData?.employeeId,
    "Full Name": employeeData?.name,
    "Position": employeeData?.position,
    "Department": employeeData?.department,
    "Base Salary": payrollData[0]?.base != null ? `Rs.${payrollData[0].base.toLocaleString()}` : "Rs.0",
    "Bonus": payrollData[0]?.bonus != null ? `Rs.${payrollData[0].bonus.toLocaleString()}` : "Rs.0",
    "Deductions":payrollData[0]?.deductions != null ? `Rs.${payrollData[0].deductions.toLocaleString()}` : "Rs.0",
    "Net Salary": payrollData[0]?.net != null ? `Rs.${payrollData[0].net.toLocaleString()}` : "Rs.0",
    "Join Date": employeeData?.joinedOn ? new Date(employeeData.joinedOn).toLocaleDateString() : "N/A",
  }).map(([label, value], idx) => (
    <div key={idx}>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  ))}
</CardContent>
</Card>

  {/* Salary Breakdown */}
{payrollData.map((pay) => (
  <Card
    key={pay._id}
    className="bg-white/90 shadow-lg hover:shadow-xl transition"
  >
    
    <CardHeader>
      <CardTitle>Salary Breakdown - {pay.period}</CardTitle>
      <CardDescription>Details of your earnings and deductions</CardDescription>
    </CardHeader>
    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Gross Salary", value: `Rs.${((pay.base || 0) + (pay.bonus || 0)).toLocaleString()}` },
        { label: "Bonus", value: `Rs.${pay.bonus?.toLocaleString() || 0}` },
        { label: "Deductions", value:`Rs.${pay.deductions?.toLocaleString() || 0}` },
        { label: "Net Salary", value: `Rs.${pay.net?.toLocaleString() || 0}` },
        { label: "Status", value: pay.status },
      ].map((item, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="text-lg font-semibold text-gray-800">{item.value}</p>
        </div>
      ))}
      {/* ✅ Button placed after loop */}
      <div className="col-span-2 md:col-span-4 flex justify-center mt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            generatePayslip(pay, pay.processedBy || "HR Admin")
          }
        >
          <FileText className="h-4 w-4 mr-1" />
          Download Payslip
        </Button>
      </div>
    </CardContent>
  </Card>
))}

  {/* Salary Payment Status */}
  <Card className="bg-white/90 shadow-lg hover:shadow-xl transition">
  <CardHeader>
    <CardTitle>Salary Payment Status</CardTitle>
    <CardDescription>Track your recent salary payments</CardDescription>
  </CardHeader>
  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {payrollData.map((pay) => (
      <div
        key={pay._id}
        className={`p-4 rounded-lg border flex justify-between items-center transition ${
          pay.status === "paid" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div>
          <p className="font-medium">{pay.period}</p>
          <p className="text-sm text-muted-foreground">Net: Rs.{pay.net?.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Status: {pay.status}</p>
        </div>
        <div>
          {pay.status === "paid" ? (
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
    <CardDescription>Feedback from your Admin and HR</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {feedbackData.length === 0 ? (
      <p className="text-sm text-gray-500">No feedback available</p>
    ) : (
      feedbackData.map((feedback) => (
        <div
          key={feedback.id}
          className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-800">{feedback.sender}</span>
            <span className="text-xs text-gray-500">{feedback.date}</span>
          </div>
          <p className="text-sm text-gray-700">{feedback.message}</p>
        </div>
      ))
    )}
  </CardContent>
</Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
