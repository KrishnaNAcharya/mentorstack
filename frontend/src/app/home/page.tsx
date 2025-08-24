"use client";

<<<<<<< HEAD
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
=======
import Link from "next/link";
import Layout from "../../components/Layout";

export default function QuestionPage() {
  return (
    <Layout>
      {/* Feed */}
      <section className="flex flex-1 p-8 gap-8 overflow-auto">
        {/* Left - Questions Feed */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-6">
            Welcome to{" "}
            <span className="text-[var(--color-primary-dark)]">
              MentorStack
            </span>
            , John Doh
          </h2>

          {/* Filter Bar */}
          <div className="flex items-center gap-4 mb-8">
            {["Newest", "Active", "Bountied", "Unanswered"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  tab === "Newest"
                    ? "bg-[var(--color-primary)] text-white shadow"
                    : "bg-[var(--color-neutral)] text-[var(--color-tertiary)] border border-[var(--color-neutral-dark)] hover:bg-[var(--color-neutral-dark)]"
                }`}
              >
                {tab}
              </button>
            ))}
            <Link href="/ask-question">
              <button className="ml-auto bg-[var(--color-primary-dark)] text-[var(--color-neutral)] px-5 py-2 rounded-lg font-medium shadow-lg hover:bg-[var(--color-primary)] transition">
                Ask Question
              </button>
            </Link>
          </div>

          {/* Example Question Card */}
          <div className="bg-[var(--color-neutral)] p-6 rounded-xl shadow-md mb-6 hover:shadow-lg transition">
            <Link href="/questions/1" className="block">
              <div className="text-sm text-[var(--color-tertiary-light)] mb-2">
                @Username
              </div>
              <h3 className="font-semibold text-xl mb-3 text-[var(--color-tertiary)] hover:text-[var(--color-primary)] transition">
                How to get Razorpay API test key without entering my bank
                details?
              </h3>
              <div className="flex gap-2 mb-3">
                {["api", "testing", "flutter"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-[var(--color-primary)] text-[var(--color-neutral)] rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between text-sm text-[var(--color-tertiary-light)]">
                <span>20 Answers</span>
                <span>2 mins ago</span>
              </div>
            </Link>

            {/* Answer Button */}
            <div className="mt-4 pt-4 border-t border-[var(--color-neutral-dark)]">
              <Link href="/answer-question?id=1">
                <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
                  Answer this question
                </button>
              </Link>
            </div>
          </div>

          {/* Another Example */}
          <div className="bg-[var(--color-neutral)] p-6 rounded-xl shadow-md mb-6 hover:shadow-lg transition">
            <Link href="/questions/2" className="block">
              <div className="text-sm text-[var(--color-tertiary-light)] mb-2">
                @Username
              </div>
              <h3 className="font-semibold text-xl mb-3 text-[var(--color-tertiary)] hover:text-[var(--color-primary)] transition">
                Vue 3, mapbox: create multiple mapboxes with v-for
              </h3>
              <p className="text-[var(--color-tertiary-light)] text-sm leading-relaxed mb-3">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
                ut enim quis libero accumsan malesuada sed nec orci.
              </p>
              <div className="flex gap-2 mb-3">
                {["vue", "mapbox", "javascript"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-[var(--color-primary)] text-[var(--color-neutral)] rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between text-sm text-[var(--color-tertiary-light)]">
                <span>5 Answers</span>
                <span>1 hour ago</span>
              </div>
            </Link>

            {/* Answer Button */}
            <div className="mt-4 pt-4 border-t border-[var(--color-neutral-dark)]">
              <Link href="/answer-question?id=2">
                <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
                  Answer this question
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right - Hot Topics + Blogs */}
        <aside className="w-72 flex flex-col gap-8">
          <div className="bg-[var(--color-neutral)] p-5 rounded-xl shadow-md">
            <h4 className="font-semibold mb-4 text-[var(--color-tertiary)]">
              Hot Topics
            </h4>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="bg-[var(--color-primary)] text-[var(--color-neutral)] px-3 py-1 rounded-full">
                  Razorpay
                </span>
                <span className="text-[var(--color-tertiary-light)]">x20</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="bg-[var(--color-primary)] text-[var(--color-neutral)] px-3 py-1 rounded-full">
                  Next.js
                </span>
                <span className="text-[var(--color-tertiary-light)]">x20</span>
              </li>
            </ul>
          </div>

          <div className="bg-[var(--color-neutral)] p-5 rounded-xl shadow-md">
            <h4 className="font-semibold mb-4 text-[var(--color-tertiary)]">
              Featured Blogs
            </h4>
            <ul className="space-y-3 text-sm">
              {Array(4)
                .fill("Table of InterpolatingFunction")
                .map((blog, i) => (
                  <li
                    key={i}
                    className="hover:text-[var(--color-primary)] cursor-pointer transition"
                  >
                    {blog}
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </section>
    </Layout>
>>>>>>> aaa24fa6b2b65d5ed93d1ec26ecb25cf260bea40
  );
}
