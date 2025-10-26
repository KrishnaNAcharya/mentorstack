"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "../../lib/auth-api";
import Layout from "../../components/Layout";

interface TagData {
  name: string;
  articleCount: number;
  questionCount: number;
  communityCount: number;
  count: number;
  color: string;
}

export default function Tags() {
  const router = useRouter();
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const allTags = await authAPI.getAllTags();
      // Map the API response to TagData format
      const mappedTags = allTags.map(tag => ({
        name: tag.name,
        articleCount: tag.articleCount,
        questionCount: tag.questionCount,
        communityCount: tag.communityPostCount, // Backend still uses communityPostCount for now
        count: tag.totalCount,
        color: tag.color
      }));
      setTags(mappedTags);
      setError(null);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTagClick = (tagName: string) => {
    // Navigate to the unified tag detail page
    router.push(`/tags/${encodeURIComponent(tagName)}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800 mb-4">
                Explore Topics
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover articles, questions, and community discussions organized by topics and skills
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  {filteredTags.length} topics found
                </span>
                <select 
                  title="Sort topics"
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tags Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-slate-500 mt-2">Loading topics...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Failed to load topics</h3>
              <p className="text-slate-500 mb-4">{error}</p>
              <button 
                onClick={fetchTags}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTags.map((tag, index) => (
                <div
                  key={index}
                  onClick={() => handleTagClick(tag.name)}
                  className={`${tag.color} border-2 border-transparent hover:border-emerald-300 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg group`}
                >
                  <div className="text-center">
                    <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                      {tag.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      {tag.count} {tag.count === 1 ? 'item' : 'items'}
                    </p>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      {tag.questionCount > 0 && (
                        <div>{tag.questionCount} question{tag.questionCount !== 1 ? 's' : ''}</div>
                      )}
                      {tag.articleCount > 0 && (
                        <div>{tag.articleCount} article{tag.articleCount !== 1 ? 's' : ''}</div>
                      )}
                      {tag.communityCount > 0 && (
                        <div>{tag.communityCount} communit{tag.communityCount !== 1 ? 'ies' : 'y'}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredTags.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No topics found</h3>
              <p className="text-slate-500">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
