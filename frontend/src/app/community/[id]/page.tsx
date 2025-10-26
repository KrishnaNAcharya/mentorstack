"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import ArticleImageUpload from "../../../components/ArticleImageUpload";
import { authAPI, Community, CommunityPost } from "@/lib/auth-api";
import { Edit, Trash2, Save, XCircle } from "lucide-react";

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = parseInt(params.id as string);

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    images: [] as File[]
  });
  const [newTag, setNewTag] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isEditingCommunity, setIsEditingCommunity] = useState(false);
  const [editCommunityData, setEditCommunityData] = useState({
    name: "",
    description: "",
    skills: [] as string[]
  });
  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!communityId) return;
      
      try {
        const [communityData, postsData] = await Promise.all([
          authAPI.getCommunity(communityId),
          authAPI.getCommunityPosts(communityId)
        ]);

        setCommunity(communityData);
        setPosts(postsData);
        
        // Get current user ID
        try {
          const userResponse = await authAPI.getCurrentUser();
          setCurrentUserId(userResponse.user.id);
        } catch (error) {
          console.error('Error getting current user:', error);
        }
        
        // Check if user is a member
        try {
          const membershipData = await authAPI.checkCommunityMembership(communityId);
          setIsMember(membershipData.isMember);
        } catch {
          console.log('Not authenticated or error checking membership');
          setIsMember(false);
        }
      } catch (error) {
        console.error('Error loading community data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [communityId]);

  const loadCommunityData = async () => {
    try {
      const [communityData, postsData] = await Promise.all([
        authAPI.getCommunity(communityId),
        authAPI.getCommunityPosts(communityId)
      ]);

      setCommunity(communityData);
      setPosts(postsData);
      
      // Check if user is a member
      try {
        const membershipData = await authAPI.checkCommunityMembership(communityId);
        setIsMember(membershipData.isMember);
      } catch {
        setIsMember(false);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    try {
      await authAPI.joinCommunity(communityId);
      setIsMember(true);
      // Reload community data to update member count
      loadCommunityData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join community';
      alert(errorMessage);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await authAPI.leaveCommunity(communityId);
      setIsMember(false);
      // Reload community data to update member count
      loadCommunityData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave community';
      alert(errorMessage);
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!newPost.title.trim() || !newPost.content.trim()) {
        alert('Title and content are required');
        return;
      }

      // Use FormData only if there are images, otherwise use JSON
      if (newPost.images.length > 0) {
        const formData = new FormData();
        formData.append('title', newPost.title.trim());
        formData.append('content', newPost.content.trim());
        formData.append('tags', JSON.stringify(newPost.tags));

        // Add images
        newPost.images.forEach((image) => {
          formData.append('images', image);
        });

        await authAPI.createCommunityPost(communityId, formData);
      } else {
        // No images, send as JSON
        await authAPI.createCommunityPost(communityId, {
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          tags: newPost.tags
        });
      }

      setShowCreatePost(false);
      setNewPost({ title: "", content: "", tags: [], images: [] });
      setNewTag("");
      // Reload posts
      const updatedPosts = await authAPI.getCommunityPosts(communityId);
      setPosts(updatedPosts);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      alert(errorMessage);
    }
  };

  const handleVote = async (postId: number, voteType: 'upvote' | 'downvote') => {
    try {
      await authAPI.voteOnCommunityPost(communityId, postId, voteType);
      // Reload posts to update vote counts
      const updatedPosts = await authAPI.getCommunityPosts(communityId);
      setPosts(updatedPosts);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote';
      alert(errorMessage);
    }
  };

  const handleEditCommunity = () => {
    if (!community) return;
    setEditCommunityData({
      name: community.name,
      description: community.description || "",
      skills: community.skills || []
    });
    setIsEditingCommunity(true);
  };

  const handleSaveCommunity = async () => {
    if (!community || !editCommunityData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await authAPI.updateCommunity(community.id, editCommunityData);
      await loadCommunityData();
      setIsEditingCommunity(false);
    } catch (error) {
      console.error('Error updating community:', error);
      alert('Failed to update community. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!community) return;
    
    if (!confirm(`Are you sure you want to delete "${community.name}"? This will delete all posts and cannot be undone.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.deleteCommunity(community.id);
      router.push('/community');
    } catch (error) {
      console.error('Error deleting community:', error);
      alert('Failed to delete community. Please try again.');
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !editCommunityData.skills.includes(skillInput.trim())) {
      setEditCommunityData({
        ...editCommunityData,
        skills: [...editCommunityData.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditCommunityData({
      ...editCommunityData,
      skills: editCommunityData.skills.filter(s => s !== skillToRemove)
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading community...</div>
        </div>
      </Layout>
    );
  }

  if (!community) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Community not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Community Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          {isEditingCommunity ? (
            /* Edit Mode */
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Community</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editCommunityData.name}
                  onChange={(e) => setEditCommunityData({...editCommunityData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editCommunityData.description}
                  onChange={(e) => setEditCommunityData({...editCommunityData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editCommunityData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSaveCommunity}
                  disabled={isSubmitting || !editCommunityData.name.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditingCommunity(false)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="flex items-start gap-6">
              {/* Community Icon */}
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-3xl font-bold">
                  {community.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Community Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                  {currentUserId === community.createdById && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditCommunity}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteCommunity}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{community.description}</p>
                
                {/* Skills */}
                {community.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {community.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <span>{community._count.members} members</span>
                  <span>{community._count.posts} posts</span>
                  <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  {isMember ? (
                    <>
                      <button
                        onClick={() => router.push(`/community/${communityId}/discussions`)}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Discussions
                      </button>
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Create Post
                      </button>
                      <button
                        onClick={handleLeaveCommunity}
                        className="px-6 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Leave Community
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleJoinCommunity}
                      className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Join Community
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Posts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Posts Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
              </div>

              {/* Posts List */}
              <div className="divide-y divide-gray-200">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post.id} className="p-6">
                      <div className="flex gap-4">
                        {/* Vote Buttons */}
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => handleVote(post.id, 'upvote')}
                            className={`p-2 rounded-lg transition-colors ${
                              post.userVote === 'upvote'
                                ? 'text-purple-700 bg-purple-100 border-2 border-purple-300'
                                : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
                            }`}
                            disabled={!isMember}
                            title="Upvote"
                            aria-label="Upvote post"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <span className="text-sm font-medium text-gray-700">
                            {post.upvotes - post.downvotes}
                          </span>
                          <button
                            onClick={() => handleVote(post.id, 'downvote')}
                            className={`p-2 rounded-lg transition-colors ${
                              post.userVote === 'downvote'
                                ? 'text-red-700 bg-red-100 border-2 border-red-300'
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                            disabled={!isMember}
                            title="Downvote"
                            aria-label="Downvote post"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 cursor-pointer" onClick={() => router.push(`/community/${communityId}/post/${post.id}`)}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{post.title}</h3>
                          <p className="text-gray-600 mb-3 line-clamp-3">{post.content}</p>
                          
                          {/* Post Images */}
                          {post.imageUrls && post.imageUrls.length > 0 && (
                            <div className="mb-3 flex gap-2 overflow-x-auto">
                              {post.imageUrls.slice(0, 3).map((imageUrl, index) => (
                                <div key={index} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                  <img
                                    src={imageUrl}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {post.imageUrls.length > 3 && (
                                <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-medium">
                                  +{post.imageUrls.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {post.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            Posted {new Date(post.createdAt).toLocaleDateString()} by {post.userName || `User${post.userId}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-6">Be the first to start a discussion!</p>
                    {isMember && (
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Create First Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Info</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Members</label>
                  <p className="text-2xl font-bold text-gray-900">{community._count.members}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Posts</label>
                  <p className="text-2xl font-bold text-gray-900">{community._count.posts}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                  <p className="text-gray-900">{new Date(community.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Post</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={6}
                    placeholder="Write your post content here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Optional)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTag.trim() && !newPost.tags.includes(newTag.trim())) {
                            setNewPost({...newPost, tags: [...newPost.tags, newTag.trim()]});
                            setNewTag("");
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTag.trim() && !newPost.tags.includes(newTag.trim())) {
                          setNewPost({...newPost, tags: [...newPost.tags, newTag.trim()]});
                          setNewTag("");
                        }
                      }}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                    >
                      Add
                    </button>
                  </div>
                  {newPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => setNewPost({...newPost, tags: newPost.tags.filter((_, i) => i !== index)})}
                            className="hover:text-emerald-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images <span className="text-sm text-gray-500">(Optional)</span>
                  </label>
                  <ArticleImageUpload
                    onImagesChange={(images) => setNewPost({...newPost, images})}
                    maxImages={5}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewTag("");
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Create Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
