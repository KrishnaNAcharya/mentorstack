"use client";

import { useState } from "react";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth-api";

export default function Home() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignupClick = () => {
    router.push('/role-selection');
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (error) setError(""); // Clear error when user types
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authAPI.login(loginData);
      console.log("Login successful:", result);
      // Redirect to home page after successful login
      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };
=======

export default function Home() {
  const [tab, setTab] = useState<"login" | "signup">("login");
>>>>>>> aaa24fa6b2b65d5ed93d1ec26ecb25cf260bea40

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700">
      <div className="flex w-full max-w-5xl min-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Section - Form */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-secondary-dark mb-2">
            {tab === "login" ? "Welcome back" : "Create Account"}
          </h1>
          <p className="text-secondary-light mb-10">
            {tab === "login"
              ? "Please sign in to your account"
              : "Join MentorStack today"}
          </p>

          {/* Tabs */}
          <div className="flex mb-8 bg-slate-50 rounded-xl p-1">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                tab === "login"
                  ? "bg-white text-secondary-dark shadow"
                  : "text-slate-500"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                tab === "signup"
                  ? "bg-white text-secondary-dark shadow"
                  : "text-slate-500"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
<<<<<<< HEAD
          {tab === "login" ? (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block mb-2 font-medium text-primary-dark">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  placeholder="Enter your email"
                  required
                  className="w-full p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-primary-dark">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  placeholder="Enter your password"
                  required
                  className="w-full p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
=======
          <form className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-primary-dark">Email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-primary-dark">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
              />
              {tab === "login" && (
>>>>>>> aaa24fa6b2b65d5ed93d1ec26ecb25cf260bea40
                <a
                  href="#"
                  className="text-primary text-sm font-medium float-right mt-2 hover:underline"
                >
                  Forgot password?
                </a>
<<<<<<< HEAD
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-gradient-to-r bg-primary text-white font-semibold rounded-xl shadow-lg hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border-2 border-slate-100">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Ready to get started?</h3>
                <p className="text-slate-600 mb-6">
                  Choose your role to create a personalized experience tailored just for you.
                </p>
                <button
                  onClick={handleSignupClick}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Choose Your Role & Sign Up
                </button>
              </div>
            </div>
          )}
=======
              )}
            </div>

            {tab === "signup" && (
              <div>
                <label className="block mb-2 font-medium ">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 mt-4 bg-gradient-to-r bg-primary text-white font-semibold rounded-xl shadow-lg hover:bg-secondary transition"
            >
              {tab === "login" ? "Sign in" : "Sign up"}
            </button>
          </form>
>>>>>>> aaa24fa6b2b65d5ed93d1ec26ecb25cf260bea40

          {/* Divider */}
          <div className="relative my-8 text-center text-slate-400">
            <span className="bg-white px-4 relative z-10">or continue with</span>
            <div className="absolute left-0 top-1/2 w-full h-px bg-slate-200 -z-0" />
          </div>

          {/* Social Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 py-3 border-2 border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:border-[#06a395] hover:bg-emerald-50 transition">
              <span className="text-slate-700 font-medium">Google</span>
            </button>
            {/* <button className="flex-1 py-3 border-2 border-slate-200 rounded-xl flex items-center justify-center gap-2 hover:border-[#06a395] hover:bg-emerald-50 transition">
              <span className="text-slate-700 font-medium">Facebook</span>
            </button> */}
          </div>
        </div>

        {/* Right Section - Branding */}
        <div className="flex-1 bg-gradient-to-br bg-surface flex flex-col items-center justify-center relative">
          <div className="w-32 h-32 bg-gradient-to-br bg-primary rounded-2xl shadow-xl flex items-center justify-center mb-6">
            <span className="text-4xl font-extrabold text-neutral">MS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-emerald-800 mb-2">MentorStack</h2>
          <p className="text-emerald-700 font-medium">
            Empowering growth through mentorship
          </p>
          <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 opacity-10" />
        </div>
      </div>
    </div>
  );
}