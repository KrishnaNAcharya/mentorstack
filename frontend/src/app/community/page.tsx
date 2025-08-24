"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { authAPI, Community } from "@/lib/auth-api";

export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    skills: [] as string[]
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const communitiesData = await authAPI.getCommunities();
      setCommunities(communitiesData);
    } catch (error) {
      console.error('Error loading communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadCommunities();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await authAPI.searchCommunities(searchQuery);
      setCommunities(searchResults);
    } catch (error) {
      console.error('Error searching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    try {
      if (!newCommunity.name.trim()) {
        alert('Community name is required');
        return;
      }

      await authAPI.createCommunity(newCommunity);
      setShowCreateModal(false);
      setNewCommunity({ name: "", description: "", skills: [] });
      setSkillInput("");
      loadCommunities();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create community';
      alert(errorMessage);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !newCommunity.skills.includes(skillInput.trim())) {
      setNewCommunity({
        ...newCommunity,
        skills: [...newCommunity.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setNewCommunity({
      ...newCommunity,
      skills: newCommunity.skills.filter(s => s !== skill)
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading communities...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
              <p className="text-gray-600 mt-2">Connect with like-minded developers and learn together</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Create Community
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4 max-w-md">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search communities..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'DevOps', 'UI/UX Design'].map((category) => (
              <button
                key={category}
                onClick={() => setSearchQuery(category)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <div key={community.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Community Header */}
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">
                    {community.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{community.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{community.description}</p>
              </div>

              {/* Skills */}
              {community.skills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {community.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {community.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                        +{community.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{community._count.members} members</span>
                <span>{community._count.posts} posts</span>
              </div>

              {/* Action */}
              <Link href={`/community/${community.id}`}>
                <button className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  View Community
                </button>
              </Link>
            </div>
          ))}
        </div>

        {communities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏘️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No communities found</h3>
            <p className="text-gray-500 mb-6">Be the first to create a community!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Create Community
            </button>
          </div>
        )}

        {/* Create Community Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Community</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Community Name</label>
                  <input
                    type="text"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter community name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Describe your community"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills/Topics</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Add a skill or topic"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newCommunity.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-emerald-500 hover:text-emerald-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCommunity}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
