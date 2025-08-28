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

        // Allow both mentees and mentors to access questions page
        if (userData.user.role !== 'mentee' && userData.user.role !== 'mentor') {
          router.push('/home');
          return;
        }

        // Load questions from API
        const questionsData = await authAPI.getQuestions();
        setQuestions(questionsData);

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
      <section className="flex flex-1 p-8 overflow-auto">
        {/* Questions Feed */}
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Welcome to{" "}
            <span className="text-[var(--color-primary-dark)]">
              MentorStack
            </span>
            , {user?.name || (user?.role === 'mentor' ? 'Mentor' : 'Mentee')}
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
            {user?.role === 'mentee' && (
              <Link href="/ask-question">
                <button className="ml-auto bg-[var(--color-primary-dark)] text-[var(--color-neutral)] px-5 py-2 rounded-lg font-medium shadow-lg hover:bg-[var(--color-primary)] transition">
                  Ask Question
                </button>
              </Link>
            )}
          </div>

          {/* Questions List */}
          {questions.map((question) => (
            <div key={question.id} className="bg-[var(--color-neutral)] p-6 rounded-xl shadow-md mb-6 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                {/* Question Content */}
                <div className="flex-1">
                  <div className="text-sm text-[var(--color-tertiary-light)] mb-2">
                    @{question.authorName}
                  </div>
                  <h3 
                    className="font-semibold text-xl mb-3 text-[var(--color-tertiary)] hover:text-[var(--color-primary)] transition cursor-pointer"
                    onClick={() => router.push(`/questions/${question.id}`)}
                  >
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
                    <span>{question.answerCount || 0} Answers</span>
                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
