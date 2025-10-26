'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, OverviewStats } from '@/lib/admin-api';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  TrendingUp,
  Shield,
  LogOut,
  BarChart3
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    try {
      if (!adminAPI.isAuthenticated()) {
        router.push('/admin/login');
        return;
      }

      const { admin } = await adminAPI.getCurrentAdmin();
      setAdminName(admin.name);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminAPI.getOverviewStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminAPI.logout();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {adminName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <span className="text-2xl font-bold">{stats?.users.total || 0}</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">Total Users</h3>
            <div className="mt-2 text-xs opacity-75">
              <span>Mentors: {stats?.users.mentors || 0}</span> | <span>Mentees: {stats?.users.mentees || 0}</span>
            </div>
          </div>

          {/* Questions Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <MessageSquare className="w-8 h-8" />
              <span className="text-2xl font-bold">{stats?.content.questions || 0}</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">Questions</h3>
            <div className="mt-2 text-xs opacity-75">
              Answers: {stats?.content.answers || 0}
            </div>
          </div>

          {/* Articles Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8" />
              <span className="text-2xl font-bold">{stats?.content.articles || 0}</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">Articles</h3>
            <div className="mt-2 text-xs opacity-75">
              Published content
            </div>
          </div>

          {/* Communities Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8" />
              <span className="text-2xl font-bold">{stats?.content.communities || 0}</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">Communities</h3>
            <div className="mt-2 text-xs opacity-75">
              Posts: {stats?.content.communityPosts || 0}
            </div>
          </div>
        </div>

        {/* Mentorship Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Mentorship Activity</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Connections</span>
                <span className="text-2xl font-bold text-green-400">{stats?.mentorship.connections || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Requests</span>
                <span className="text-2xl font-bold text-blue-400">{stats?.mentorship.requests || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
              >
                Manage Users
              </button>
              <button
                onClick={() => router.push('/admin/communities')}
                className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
              >
                Manage Communities
              </button>
              <button
                onClick={() => router.push('/admin/content')}
                className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition"
              >
                Content Moderation
              </button>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <p className="text-blue-200 text-center">
            <Shield className="inline w-5 h-5 mr-2" />
            Admin dashboard is in development. More features coming soon!
          </p>
        </div>
      </main>
    </div>
  );
}
