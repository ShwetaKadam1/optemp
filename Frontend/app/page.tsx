"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, TrendingUp, Shield, X, MapPin, Phone, Mail, Linkedin } from "lucide-react"
import { initializeApp, getApps } from "firebase/app"
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"

// ✅ Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, 
}
console.log("Firebase config:", firebaseConfig);

// ✅ Initialize Firebase only once
if (!getApps().length) initializeApp(firebaseConfig)
const auth = getAuth()

export default function LandingPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "", role: "employee" })
  const [signupData, setSignupData] = useState({
    name: "", email: "", password: "", contact: "", employeeId: "", department: "", role: "employee"
  })
  const [showAuth, setShowAuth] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // ✅ Close modal when clicking outside
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      showAuth &&
      modalRef.current &&
      !modalRef.current.contains(event.target as Node)
    ) {
      setShowAuth(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside)
  return () => document.removeEventListener("mousedown", handleClickOutside)
}, [showAuth]);


  // ✅ Login with Firebase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      const token = await userCredential.user.getIdToken()
      localStorage.setItem("firebaseToken", token) // store token for backend
      setShowAuth(false)
      window.location.href = loginData.role === "hr" ? "/hr-dashboard" : "/employee-dashboard"
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Login failed")
    }
  }

  // ✅ Sign up with Firebase + MongoDB
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // 1️⃣ Sign up in Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      signupData.email,
      signupData.password
    );
    await updateProfile(userCredential.user, { displayName: signupData.name });
    const token = await userCredential.user.getIdToken();
    localStorage.setItem("firebaseToken", token);

    // 2️⃣ Upsert user in MongoDB backend
    // Make sure your backend has an endpoint like POST /api/users/me
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/users/me`, {
      method: "PUT", // upsert
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Firebase token
      },
      body: JSON.stringify({
        name: signupData.name,
        email: signupData.email,
        contact: signupData.contact,
        employeeId: signupData.employeeId,
        department: signupData.department,
        role: signupData.role,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to save user in DB");
    }

    // 3️⃣ Close modal and redirect
    setShowAuth(false);
    window.location.href = signupData.role === "hr" ? "/hr-dashboard" : "/employee-dashboard";
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Signup failed");
  }
};

  return (
    <>
      {/* ✅ Shared Background Wrapper */}
      <section className="relative w-full">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.jpg')" }}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Navbar */}
        <header className="absolute top-0 left-0 w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6">
            <div className="flex items-center">
              <img
                  src="/logo.png" // ✅ place your logo in /public/logo.png
                  alt="CoreVista Logo"
                  className="h-16 w-auto"/>
                  <span className="ml-4 text-4xl font-bold text-white"><i>CoreVista</i></span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-200 hover:text-white">Features</a>
              <a href="#about" className="text-gray-200 hover:text-white">About</a>
              <a href="#contact" className="text-gray-200 hover:text-white">Contact</a>
            </nav>
            <button
              onClick={() => setShowAuth(true)}
              className="text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Login / Sign Up
            </button>
          </div>
        </header>

        {/* Hero */}
        <div className="relative z-10 flex flex-col justify-center items-center h-screen text-center px-4">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight leading-tight"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Modern Employee Dashboard
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed tracking-wide"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            Streamline your workforce with real-time performance tracking, goals management,
            attendance monitoring, and integrated salary disbursement.
          </motion.p>
          <motion.button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-700 transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            Explore Features
          </motion.button>
        </div>

        {/* Features */}
        <section className="relative z-10 py-20" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold">Features</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white/90 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl p-6">
                <CardHeader>
                  <TrendingUp className="h-14 w-14 text-blue-600 mb-4 rounded-full bg-blue-100 flex items-center justify-center" />
                  <CardTitle>Real-time Analytics</CardTitle>
                  <CardDescription>
                    Track performance metrics, attendance, and productivity with live dashboards
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-white/90 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl p-6">
                <CardHeader>
                  <Users className="h-14 w-14 text-green-600 mb-4 rounded-full bg-green-100 flex items-center justify-center shadow-sm"/>
                  <CardTitle>Goal Management</CardTitle>
                  <CardDescription>
                    Set, track, and achieve goals with comprehensive progress monitoring
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-white/90 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl p-6">
                <CardHeader>
                  <Shield className="h-14 w-14 text-purple-600 mb-4 rounded-full bg-purple-100 flex items-center justify-center shadow-sm" />
                  <CardTitle>Secure Payroll</CardTitle>
                  <CardDescription>
                    Integrated salary disbursement with Stripe and automated payslip generation
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="relative z-10 py-16 flex justify-center">
          <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg p-8 shadow-sm hover:shadow-md transition text-center bg-white/90">
              <h2 className="text-3xl font-bold text-gray-900 mb-4"><i>CoreVista – A clear view into the core</i></h2>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-snug tracking-wide italic">
                Step into the future of employee management with CoreVista. Designed to streamline every 
                aspect of workforce operations, CoreVista lets you track performance in real time,set 
                meaningful goals, and monitor progress effortlessly. Attendance, payroll, and HR 
                processes become seamless, giving your team more time to focus on what truly matters.
              </p>
              <br />
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-snug tracking-wide italic">
                CoreVista connects people, departments, and management in one intuitive platform. 
                By automating routine tasks and providing actionable insights, it empowers HR 
                teams to make smarter, faster decisions. Transparency, clarity, and productivity 
                are at the core of every interaction, ensuring your organization runs like a 
                well-orchestrated machine.
              </p>
              <br />
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-snug tracking-wide italic">
                Every employee is supported, every manager is informed, and every process is 
                simplified. Experience a workforce where efficiency meets harmony, collaboration 
                thrives, and growth is inevitable. CoreVista isn’t just software—it’s the thread 
                that weaves your people, processes, and potential into a single, powerful fabric.
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 bg-gray-100 relative z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
          <p className="text-sm text-gray-600 mb-6">We’d love to hear from you. Get in touch with us!</p>
          <div className="grid md:grid-cols-4 gap-4 text-left">
            <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                <h3 className="text-sm font-semibold">Head Office</h3>
              </div>
              <p className="text-gray-600 text-xs">
                CoreVista Pvt. Ltd.
                <br />
                123 Business Avenue,
                <br />
                Mumbai, Maharashtra, India - 400001
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-2">
                <Phone className="h-4 w-4 text-green-600 mr-2" />
                <h3 className="text-sm font-semibold">Phone</h3>
              </div>
              <p className="text-gray-600 text-xs">
                +91 98765 43210
                <br />
                Mon - Fri, 9 AM - 6 PM
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-2">
                <Mail className="h-4 w-4 text-red-600 mr-2" />
                <h3 className="text-sm font-semibold">Email</h3>
              </div>
              <p className="text-gray-600 text-xs">
                support@gmail.com
                <br />
                hr@gmail.com
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-2">
                <Linkedin className="h-4 w-4 text-blue-700 mr-2" />
                <h3 className="text-sm font-semibold">Social Media</h3>
              </div>
              <p className="text-gray-600 text-xs">
                LinkedIn: /CoreVista
                <br />
                Twitter: @CoreVista
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Auth Modal */}
{showAuth && (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
    onClick={() => setShowAuth(false)} // close when overlay clicked
  >
    <div
      ref={modalRef}
      className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] p-4 relative flex flex-col"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      <button
        onClick={() => setShowAuth(false)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
        aria-label="Close modal"
      >
        <X className="h-6 w-6" />
      </button>

      <CardHeader>
        <CardTitle>Get Started</CardTitle>
        <CardDescription>Login or create your account</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login" className="overflow-y-auto max-h-[60vh]">
            <form onSubmit={handleLogin} className="space-y-4">
              <Label>Email</Label>
              <Input
                type="email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                required
              />
              <Label>Password</Label>
              <Input
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
              />
              <Label>Role</Label>
              <Select
                value={loginData.role}
                onValueChange={(v) =>
                  setLoginData({ ...loginData, role: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </TabsContent>

          {/* Signup Form */}
          <TabsContent
            value="signup"
            className= "flex justify-center items-start h-full p-2">
            <form
              onSubmit={handleSignup}
              className="space-y-4 w-full max-w-md flex flex-col"
            >
              <div className="flex-1 overflow-y-auto space-y-4">
                <Label>Full Name</Label>
                <Input
                  value={signupData.name}
                  onChange={(e) =>
                    setSignupData({ ...signupData, name: e.target.value })
                  }
                  required
                />
                <Label>Email</Label>
                <Input
                  type="email"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                  required
                />
                <Label>Password (Atleast 6 Characters)</Label>
                <Input
                  type="password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  required
                />
                <Label>Contact</Label>
                <Input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={signupData.contact}
                  onChange={(e) =>
                    setSignupData({ ...signupData, contact: e.target.value })
                  }
                  required
                />
                <Label>Employee ID</Label>
                <Input
                  value={signupData.employeeId}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      employeeId: e.target.value,
                    })
                  }
                  required
                />
                <Label>Department</Label>
                <Select
                  value={signupData.department}
                  onValueChange={(v) =>
                    setSignupData({ ...signupData, department: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="operation">Operation</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
                <Label>Role</Label>
                <Select
                  value={signupData.role}
                  onValueChange={(v) =>
                    setSignupData({ ...signupData, role: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full mt-2">
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  </div>
)}
    </>
  )
}