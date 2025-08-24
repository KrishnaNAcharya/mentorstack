"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MS</span>
              </div>
              <span className="text-xl font-bold text-slate-800">MentorStack</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-600 hover:text-slate-800 font-medium">
                Profile
              </button>
              <button 
                onClick={() => router.push('/')}
                className="text-slate-600 hover:text-slate-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Welcome to MentorStack! 🎉
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your account has been created successfully. You&apos;re now ready to start your mentorship journey.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Find Mentors</h3>
            <p className="text-slate-600 mb-4">Connect with experienced professionals in your field</p>
            <button className="w-full py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition">
              Browse Mentors
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">❓</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Ask Questions</h3>
            <p className="text-slate-600 mb-4">Get answers from the community</p>
            <button 
              onClick={() => router.push('/ask-question')}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Ask Question
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🏘️</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Join Communities</h3>
            <p className="text-slate-600 mb-4">Connect with like-minded individuals</p>
            <button className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
              Explore Communities
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Activity</h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌟</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nothing here yet!</h3>
            <p className="text-slate-500 mb-6">Start your journey by asking a question or connecting with mentors.</p>
            <button 
              onClick={() => router.push('/questions')}
              className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition"
            >
              View All Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
