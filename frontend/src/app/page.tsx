"use client";

import { useState } from "react";

export default function Home() {
  const [tab, setTab] = useState<"login" | "signup">("login");

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
                <a
                  href="#"
                  className="text-primary text-sm font-medium float-right mt-2 hover:underline"
                >
                  Forgot password?
                </a>
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