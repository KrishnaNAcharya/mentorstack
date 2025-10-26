"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { authAPI } from "@/lib/auth-api";

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<{
    questions: Array<{ questionId: number; title: string; createdAt: string }>;
    articles: Array<{ articleId: number; title: string; createdAt: string }>;
    posts: Array<{ postId: number; title: string; communityId: number; communityName?: string; createdAt: string }>;
  }>({
    questions: [],
    articles: [],
    posts: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'articles' | 'posts'>('questions');

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const data = await authAPI.getMyBookmarks();
      setBookmarks(data);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      alert('Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (type: 'question' | 'article' | 'post', id: number) => {
    try {
      if (type === 'question') {
        await authAPI.removeQuestionBookmark(id);
      } else if (type === 'article') {
        await authAPI.removeArticleBookmark(id);
      } else {
        await authAPI.removeCommunityPostBookmark(id);
      }
      // Reload bookmarks
      await loadBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      alert('Failed to remove bookmark. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading bookmarks...</div>
        </div>
      </Layout>
    );
  }

  const totalBookmarks = bookmarks.questions.length + bookmarks.articles.length + bookmarks.posts.length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookmarks</h1>
          <p className="text-gray-600">
            {totalBookmarks === 0 
              ? "You haven't bookmarked anything yet"
              : `You have ${totalBookmarks} bookmark${totalBookmarks === 1 ? '' : 's'}`
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'questions'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Questions ({bookmarks.questions.length})
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'articles'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Articles ({bookmarks.articles.length})
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Community Posts ({bookmarks.posts.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {bookmarks.questions.length > 0 ? (
                  bookmarks.questions.map((bookmark) => (
                    <div
                      key={bookmark.questionId}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/questions/${bookmark.questionId}`)}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-emerald-600 mb-1">
                          {bookmark.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Bookmarked on {new Date(bookmark.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark('question', bookmark.questionId)}
                        className="ml-4 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📑</div>
                    <p className="text-gray-500">No bookmarked questions yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="space-y-4">
                {bookmarks.articles.length > 0 ? (
                  bookmarks.articles.map((bookmark) => (
                    <div
                      key={bookmark.articleId}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/article/${bookmark.articleId}`)}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-emerald-600 mb-1">
                          {bookmark.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Bookmarked on {new Date(bookmark.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark('article', bookmark.articleId)}
                        className="ml-4 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📰</div>
                    <p className="text-gray-500">No bookmarked articles yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Community Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {bookmarks.posts.length > 0 ? (
                  bookmarks.posts.map((bookmark) => (
                    <div
                      key={bookmark.postId}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/community/${bookmark.communityId}/post/${bookmark.postId}`)}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-emerald-600 mb-1">
                          {bookmark.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {bookmark.communityName && (
                            <>
                              in <span className="font-medium">{bookmark.communityName}</span> •{' '}
                            </>
                          )}
                          Bookmarked on {new Date(bookmark.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark('post', bookmark.postId)}
                        className="ml-4 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">💬</div>
                    <p className="text-gray-500">No bookmarked community posts yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
