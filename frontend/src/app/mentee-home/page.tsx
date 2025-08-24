"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { authAPI, User, Question } from "@/lib/auth-api";

export default function MenteeHomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Newest");
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const userData = await authAPI.getCurrentUser();
        setUser(userData.user);

        // Redirect if not mentee
        if (userData.user.role !== 'mentee') {
          router.push('/home');
          return;
        }

        // Load questions from API (temporarily using mock data)
        // const questionsData = await authAPI.getQuestions();
        // setQuestions(questionsData);
        
        // Mock data for now
        setQuestions([
          {
            id: 1,
            title: "How to get Razorpay API test key without entering my bank details?",
            tags: ["api", "testing", "flutter"],
            createdAt: new Date().toISOString(),
            authorName: "Test User",
            answerCount: 20
          },
          {
            id: 2,
            title: "Vue 3, mapbox: create multiple mapboxes with v-for",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            tags: ["vue", "mapbox", "javascript"],
            createdAt: new Date().toISOString(),
            authorName: "Another User",
            answerCount: 5
          }
        ]);

      } catch (error) {
        console.error('Error loading data:', error);
        // Redirect to login if unauthorized
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

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
            , {user?.name || 'Mentee'}
          </h2>

          {/* Filter Bar */}
          <div className="flex items-center gap-4 mb-8">
            {["Newest", "Active", "Bountied", "Unanswered"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  tab === activeFilter
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

          {/* Questions List */}
          {questions.map((question) => (
            <div key={question.id} className="bg-[var(--color-neutral)] p-6 rounded-xl shadow-md mb-6 hover:shadow-lg transition">
              <div className="text-sm text-[var(--color-tertiary-light)] mb-2">
                @{question.authorName}
              </div>
              <h3 className="font-semibold text-xl mb-3 text-[var(--color-tertiary)] hover:text-[var(--color-primary)] transition">
                {question.title}
              </h3>
              {question.description && (
                <p className="text-[var(--color-tertiary-light)] text-sm leading-relaxed mb-3">
                  {question.description}
                </p>
              )}
              <div className="flex gap-2 mb-3">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-[var(--color-primary)] text-[var(--color-neutral)] rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between text-sm text-[var(--color-tertiary-light)]">
                <span>{question.answerCount} Answers</span>
                <span>{question.createdAt}</span>
              </div>
              {/* Answer Button */}
              <div className="mt-4 pt-4 border-t border-[var(--color-neutral-dark)]">
                <Link href={`/answer-question?id=${question.id}`}>
                  <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
                    Answer this question
                  </button>
                </Link>
              </div>
            </div>
          ))}
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
  );
}
