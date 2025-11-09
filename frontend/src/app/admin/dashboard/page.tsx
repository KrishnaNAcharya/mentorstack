
"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminModals from "@/components/admin/AdminModals";
import { adminAPI, OverviewStats } from "@/lib/admin-api";
import { Users, MessageSquare, FileText, BookOpen, Eye, Gauge } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
  
  // Data states for modals
  const [usersData, setUsersData] = useState<any>(null);
  const [questionsData, setQuestionsData] = useState<any>(null);
  const [articlesData, setArticlesData] = useState<any>(null);
  const [communitiesData, setCommunitiesData] = useState<any>(null);
  // Advanced analytics state
  const [mentorImpact, setMentorImpact] = useState<any[] | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminAPI.getOverviewStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    // Preload advanced analytics (non-blocking)
    (async () => {
      try {
        const mi = await adminAPI.getMentorImpact(15);
        setMentorImpact(mi.mentors);
  } catch (e) { console.warn('Failed to preload mentor impact', e); }
    })();
  }, []);

  // View button handlers
  const openUsersModal = async () => {
    setShowUsersModal(true);
    if (!usersData) {
      try {
        const data = await adminAPI.getUsers();
        setUsersData(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    }
  };

  const openQuestionsModal = async () => {
    setShowQuestionsModal(true);
    if (!questionsData) {
      try {
        const data = await adminAPI.getQuestions();
        setQuestionsData(data);
      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    }
  };

  const openArticlesModal = async () => {
    setShowArticlesModal(true);
    if (!articlesData) {
      try {
        const data = await adminAPI.getArticles();
        setArticlesData(data);
      } catch (err) {
        console.error("Failed to load articles:", err);
      }
    }
  };

  const openCommunitiesModal = async () => {
    setShowCommunitiesModal(true);
    if (!communitiesData) {
      try {
        const data = await adminAPI.getCommunities();
        setCommunitiesData(data);
      } catch (err) {
        console.error("Failed to load communities:", err);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Error loading dashboard</div>
            <div className="text-gray-600">{error}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to MentorStack Control Center</h1>
              <p className="text-teal-100">Comprehensive analytics and management for your mentorship platform</p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm">System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm">All Services Running</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-4xl">🚀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats?.users.total || 0}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <div className="mb-4" />
            <button
              onClick={openUsersModal}
              className="w-full bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>

          {/* Questions Card */}
          <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats?.content.questions ?? 0}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Questions</h3>
            <div className="mb-4" />
            <button
              onClick={openQuestionsModal}
              className="w-full bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>

          {/* Articles Card */}
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats?.content.articles ?? 0}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Articles</h3>
            <div className="mb-4" />
            <button
              onClick={openArticlesModal}
              className="w-full bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>

          {/* Communities Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats?.content.communities ?? 0}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Communities</h3>
            <div className="mb-4" />
            <button
              onClick={openCommunitiesModal}
              className="w-full bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>
        </div>

          {/* Bottom Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-bold text-gray-900">User Distribution</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-teal-50 border-l-4 border-teal-500 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Mentors</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">{stats?.users.mentors || 0}</div>
                  <div className="text-sm text-gray-500">30.0%</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-teal-50 border-l-4 border-teal-500 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Mentees</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">{stats?.users.mentees || 0}</div>
                  <div className="text-sm text-gray-500">30.0%</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">Admins</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{stats?.users.admins || 0}</div>
                  <div className="text-sm text-gray-500">40.0%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mentorship Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-bold text-gray-900">Mentorship Metrics</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-500 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold mb-1">{stats?.mentorship.connections || 0}</div>
                <div className="text-sm opacity-90">Active Connections</div>
              </div>
              <div className="bg-blue-500 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold mb-1">{stats?.mentorship.requests || 0}</div>
                <div className="text-sm opacity-90">Total Requests</div>
              </div>
              <div className="bg-green-500 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold mb-1">{stats?.mentorship.acceptedRequests || 0}</div>
                <div className="text-sm opacity-90">Accepted Requests</div>
              </div>
              <div className="bg-orange-500 rounded-xl p-4 text-white text-center">
                <div className="text-2xl font-bold mb-1">{stats?.mentorship.pendingRequests || 0}</div>
                <div className="text-sm opacity-90">Pending Requests</div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">Success Rate</div>
              <div className="text-3xl font-bold text-green-600">
                {(() => {
                  const accepted = stats?.mentorship.acceptedRequests || 0;
                  const total = stats?.mentorship.requests || 0;
                  if (!total) return '0%';
                  const pct = Math.round((accepted / total) * 100);
                  return `${pct}%`;
                })()}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 xl:grid-cols-1 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <Gauge className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">Mentor Quality & Impact</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-3 font-medium">Mentor</th>
                    <th className="py-2 pr-3 font-medium">Impact Score</th>
                    <th className="py-2 pr-3 font-medium">Active Mentorships</th>
                    <th className="py-2 pr-3 font-medium">Messages Sent</th>
                    <th className="py-2 pr-3 font-medium">Avg Reply (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {(mentorImpact || []).slice(0, 10).map(m => (
                    <tr key={m.mentorId} className="border-b last:border-b-0 hover:bg-teal-50/40">
                      <td className="py-2 pr-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 text-xs font-semibold">
                          {m.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 truncate max-w-[140px]" title={m.name}>{m.name}</span>
                      </td>
                      <td className="py-2 pr-3 font-semibold text-teal-700">{m.impactScore}</td>
                      <td className="py-2 pr-3">{m.sessions}</td>
                      <td className="py-2 pr-3">{m.messagesSent}</td>
                      <td className="py-2 pr-3">{m.avgResponseMinutes ?? '—'}</td>
                    </tr>
                  ))}
                  {!mentorImpact && (
                    <tr><td colSpan={5} className="py-6 text-center text-gray-400">Loading mentor impact…</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <AdminModals
        isUsersModalOpen={showUsersModal}
        setIsUsersModalOpen={setShowUsersModal}
        usersData={usersData?.users || null}
        isQuestionsModalOpen={showQuestionsModal}
        setIsQuestionsModalOpen={setShowQuestionsModal}
        questionsData={questionsData?.questions || null}
        isArticlesModalOpen={showArticlesModal}
        setIsArticlesModalOpen={setShowArticlesModal}
        articlesData={articlesData?.articles || null}
        isCommunitiesModalOpen={showCommunitiesModal}
        setIsCommunitiesModalOpen={setShowCommunitiesModal}
        communitiesData={communitiesData?.communities || null}
      />
    </AdminLayout>
  );
}
