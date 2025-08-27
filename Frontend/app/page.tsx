// app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users, TrendingUp, Shield, X, MapPin, Phone, Mail, Linkedin } from "lucide-react";
import { login, register, getMe } from "@/lib/auth";

export default function LandingPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "", role: "employee" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    employeeId: "",
    department: "",
    role: "employee",
  });
  const [showAuth, setShowAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If already logged in, route by role
    (async () => {
      const me = await getMe();
      if (me?.role === "hr" || me?.role === "admin") window.location.href = "/hr-dashboard";
      else if (me?.role === "employee") window.location.href = "/employee-dashboard";
    })();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showAuth && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAuth(false);
      }
    }
    if (showAuth) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const user = await login(loginData.email, loginData.password);
      // route by actual user role (ignore the select here, it’s just for UI)
      if (user.role === "hr" || user.role === "admin") window.location.href = "/hr-dashboard";
      else window.location.href = "/employee-dashboard";
    } catch (err: any) {
      alert(err?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const user = await register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        employeeId: signupData.employeeId,
        department: signupData.department,
        role: signupData.role as any,
      });
      if (user.role === "hr" || user.role === "admin") window.location.href = "/hr-dashboard";
      else window.location.href = "/employee-dashboard";
    } catch (err: any) {
      alert(err?.response?.data?.message || "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* BG + Navbar + Hero — unchanged visuals */}
      <section className="relative w-full">
        <motion.div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/bg.jpg')" }}
          initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} />
        <div className="absolute inset-0 bg-black/50"></div>

        <header className="absolute top-0 left-0 w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-10 w-10 text-white" />
              <span className="ml-6 text-4xl font-bold text-white"><i>Sutra</i></span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-200 hover:text-white">Features</a>
              <a href="#about" className="text-gray-200 hover:text-white">About</a>
              <a href="#contact" className="text-gray-200 hover:text-white">Contact</a>
            </nav>
            <button onClick={() => setShowAuth(true)} className="text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700">
              Login / Sign Up
            </button>
          </div>
        </header>

        <div className="relative z-10 flex flex-col justify-center items-center h-screen text-center px-4">
          <motion.h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight leading-tight"
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
            Modern Employee Dashboard
          </motion.h1>
          <motion.p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed tracking-wide"
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}>
            Streamline your workforce with real-time performance tracking, goals management, attendance monitoring, and integrated salary disbursement.
          </motion.p>
          <motion.button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-700 transition"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }}>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4"><i>Sutra – The Thread of Workforce Harmony</i></h2>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-snug tracking-wide italic">
              Step into the future of employee management with Sutra. Designed to streamline every 
              aspect of workforce operations, Sutra lets you track performance in real time,set 
              meaningful goals, and monitor progress effortlessly. Attendance, payroll, and HR 
              processes become seamless, giving your team more time to focus on what truly matters.
              </p><br></br>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-snug tracking-wide italic">
              Sutra connects people, departments, and management in one intuitive platform. 
              By automating routine tasks and providing actionable insights, it empowers HR 
              teams to make smarter, faster decisions. Transparency, clarity, and productivity 
              are at the core of every interaction, ensuring your organization runs like a 
              well-orchestrated machine.
              </p><br></br>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-snug tracking-wide italic">
              Every employee is supported, every manager is informed, and every process is 
              simplified. Experience a workforce where efficiency meets harmony, collaboration 
              thrives, and growth is inevitable. Sutra isn’t just software—it’s the thread 
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
                EmployeeHub Pvt. Ltd.
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
                support@employeehub.com
                <br />
                hr@employeehub.com
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-2">
                <Linkedin className="h-4 w-4 text-blue-700 mr-2" />
                <h3 className="text-sm font-semibold">Social Media</h3>
              </div>
              <p className="text-gray-600 text-xs">
                LinkedIn: /employeehub
                <br />
                Twitter: @employeehub
              </p>
            </div>
          </div>
        </div>
      </section>

      {showAuth && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            <button onClick={() => setShowAuth(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" aria-label="Close modal">
              <X className="h-6 w-6" />
            </button>

            <CardHeader className="p-4 border-b">
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Login or create your account</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" type="email" value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                    </div>
                    {/* Role select kept for UX but BE decides actual role */}
                    <div className="space-y-2">
                      <Label htmlFor="login-role">Role (display only)</Label>
                      <Select value={loginData.role} onValueChange={(value) => setLoginData({ ...loginData, role: value })}>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Please wait..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input id="signup-name" value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input id="signup-email" type="email" value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" type="password" value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-id">Employee ID</Label>
                        <Input id="signup-id" value={signupData.employeeId}
                          onChange={(e) => setSignupData({ ...signupData, employeeId: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-department">Department</Label>
                        <Select value={signupData.department}
                          onValueChange={(value) => setSignupData({ ...signupData, department: value })}>
                          <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                          <SelectContent className="z-[10000]">
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Human Resources">Human Resources</SelectItem>
                            <SelectItem value="Operation">Operation</SelectItem>
                            <SelectItem value="Legal">Legal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-role">Role</Label>
                        <Select value={signupData.role} onValueChange={(value) => setSignupData({ ...signupData, role: value as any })}>
                          <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent className="z-[10000]">
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Please wait..." : "Sign Up"}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </div>
        </div>
      )}
    </>
  );
}
