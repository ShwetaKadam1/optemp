// Mock data for the employee management system
export const employees = [
  {
    id: "EMP001",
    name: "John Doe",
    department: "IT",
    position: "Senior Developer",
    email: "john.doe@company.com",
    joinDate: "2023-01-15",
    salary: 75000,
    status: "active",
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    department: "Marketing",
    position: "Marketing Manager",
    email: "jane.smith@company.com",
    joinDate: "2023-02-01",
    salary: 65000,
    status: "active",
  },
  {
    id: "EMP003",
    name: "Mike Johnson",
    department: "Sales",
    position: "Sales Representative",
    email: "mike.johnson@company.com",
    joinDate: "2023-03-10",
    salary: 55000,
    status: "active",
  },
  {
    id: "EMP004",
    name: "Sarah Wilson",
    department: "HR",
    position: "HR Specialist",
    email: "sarah.wilson@company.com",
    joinDate: "2023-01-20",
    salary: 60000,
    status: "active",
  },
  {
    id: "EMP005",
    name: "David Brown",
    department: "Finance",
    position: "Financial Analyst",
    email: "david.brown@company.com",
    joinDate: "2023-04-05",
    salary: 70000,
    status: "active",
  },
]

export const departments = [
  { name: "IT", count: 15, budget: 1200000, head: "John Doe" },
  { name: "Marketing", count: 8, budget: 520000, head: "Jane Smith" },
  { name: "Sales", count: 12, budget: 660000, head: "Mike Johnson" },
  { name: "Finance", count: 6, budget: 420000, head: "David Brown" },
  { name: "HR", count: 5, budget: 300000, head: "Sarah Wilson" },  
  { name: "Operation", count: 10, budget: 490000, head: "Lily Jones" },
  { name: "Legal", count: 4, budget:520000, head: "Maya Potter" },
]

export const performanceData = [
  { month: "Jan", productivity: 85, goals: 90 },
  { month: "Feb", productivity: 88, goals: 85 },
  { month: "Mar", productivity: 92, goals: 95 },
  { month: "Apr", productivity: 87, goals: 88 },
  { month: "May", productivity: 94, goals: 92 },
  { month: "Jun", productivity: 91, goals: 89 },
]

export const departmentPerformance = [
  { department: "IT", performance: 92 },
  { department: "Marketing", performance: 88 },
  { department: "Sales", performance: 85 },
  { department: "Finance", performance: 87 },
  { department: "HR", performance: 90 },
  { department: "Operation", performance: 82 },
  { department: "Legal", performance: 79 },
]

export const attendanceData = [
  { date: "2024-01-15", status: "present", hours: 8 },
  { date: "2024-01-16", status: "present", hours: 8.5 },
  { date: "2024-01-17", status: "absent", hours: 0 },
  { date: "2024-01-18", status: "present", hours: 7.5 },
  { date: "2024-01-19", status: "present", hours: 8 },
  { date: "2024-01-20", status: "work-from-home", hours: 8 },
  { date: "2024-01-21", status: "present", hours: 8 },
]

export const goals = [
  {
    id: 1,
    employeeId: "EMP001",
    title: "Complete React Migration",
    description: "Migrate legacy components to React",
    progress: 75,
    deadline: "2024-02-28",
    status: "in-progress",
  },
  {
    id: 2,
    employeeId: "EMP001",
    title: "Improve Code Coverage",
    description: "Increase test coverage to 90%",
    progress: 60,
    deadline: "2024-03-15",
    status: "in-progress",
  },
  {
    id: 3,
    employeeId: "EMP001",
    title: "Team Leadership Training",
    description: "Complete leadership development program",
    progress: 100,
    deadline: "2024-01-30",
    status: "completed",
  },
]

export const feedbackData = [
  {
    id: 1,
    employeeId: "EMP001",
    fromUserId: "HR001",
    fromUserName: "Sarah Johnson",
    feedback:
      "Excellent work on the React migration project. Your attention to detail and proactive communication have been outstanding.",
    rating: 5,
    createdAt: "2024-01-13",
  },
  {
    id: 2,
    employeeId: "EMP001",
    fromUserId: "MGR001",
    fromUserName: "Mike Chen",
    feedback: "Great improvement in team collaboration. Keep up the excellent work!",
    rating: 4,
    createdAt: "2024-01-06",
  },
]

export const leaveRequests = [
  {
    id: 1,
    employeeId: "EMP001",
    type: "vacation",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
    reason: "Family vacation",
    status: "approved",
    approvedBy: "HR001",
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    employeeId: "EMP001",
    type: "sick",
    startDate: "2024-01-17",
    endDate: "2024-01-17",
    reason: "Flu symptoms",
    status: "approved",
    approvedBy: "HR001",
    createdAt: "2024-01-16",
  },
]

export const leaveBalance = {
  vacation: 18,
  sick: 5,
  personal: 3,
  emergency: 2,
}

// Simulate API calls with promises
export const mockAPI = {
  // Employee operations
  getEmployees: () => Promise.resolve(employees),
  getEmployee: (id: string) => Promise.resolve(employees.find((emp) => emp.id === id)),

  // Attendance operations
  markAttendance: (employeeId: string, status: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Attendance marked for ${employeeId}: ${status}`)
        resolve({ success: true, message: "Attendance marked successfully" })
      }, 500)
    })
  },

  getAttendance: (employeeId: string) => Promise.resolve(attendanceData),

  // Goal operations
  getGoals: (employeeId: string) => Promise.resolve(goals.filter((goal) => goal.employeeId === employeeId)),
  updateGoalProgress: (goalId: number, progress: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const goal = goals.find((g) => g.id === goalId)
        if (goal) {
          goal.progress = progress
          if (progress === 100) goal.status = "completed"
        }
        resolve({ success: true })
      }, 500)
    })
  },

  // Leave operations
  submitLeaveRequest: (leaveData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Leave request submitted:", leaveData)
        resolve({ success: true, message: "Leave request submitted successfully" })
      }, 500)
    })
  },

  getLeaveRequests: (employeeId: string) =>
    Promise.resolve(leaveRequests.filter((req) => req.employeeId === employeeId)),

  // Feedback operations
  submitFeedback: (feedbackData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Feedback submitted:", feedbackData)
        resolve({ success: true, message: "Feedback submitted successfully" })
      }, 500)
    })
  },

  getFeedback: (employeeId: string) => Promise.resolve(feedbackData.filter((fb) => fb.employeeId === employeeId)),

  // Payroll operations
  processSalaryPayment: (employeeId: string, amount: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate Stripe API call
        const transactionId = `txn_${Date.now()}_${employeeId}`
        console.log(`Salary payment processed for ${employeeId}: $${amount} (Transaction: ${transactionId})`)

        // Simulate PDF payslip generation
        console.log(`PDF payslip generated for ${employeeId}`)

        resolve({
          success: true,
          transactionId,
          message: "Salary payment processed successfully",
        })
      }, 2000) // Simulate API delay
    })
  },

  // Department operations
  getDepartments: () => Promise.resolve(departments),
  getDepartmentPerformance: () => Promise.resolve(departmentPerformance),
}
