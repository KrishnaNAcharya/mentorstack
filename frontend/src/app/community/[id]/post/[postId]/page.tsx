'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import BookmarkButton from '@/components/BookmarkButton';
import ArticleImageUpload from '@/components/ArticleImageUpload';
import { authAPI, CommunityPost, Community } from '@/lib/auth-api';
import { Edit, Trash2, Save, XCircle } from 'lucide-react';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;
  const postId = params.postId as string;
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize initial images to prevent infinite loop in ArticleImageUpload
  const existingImageUrlsString = JSON.stringify(existingImageUrls);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedInitialImages = useMemo(() => existingImageUrls, [existingImageUrlsString]);

  useEffect(() => {
    const loadData = async () => {
      if (!communityId || !postId) return;
      
      try {
        // Load community and posts data
        const [communityData, postsData] = await Promise.all([
          authAPI.getCommunity(parseInt(communityId)),
          authAPI.getCommunityPosts(parseInt(communityId))
        ]);

        setCommunity(communityData);
        
        // Find the specific post
        const foundPost = postsData.find(p => p.id === parseInt(postId));
        if (foundPost) {
          setPost(foundPost);
        } else {
          // Post not found, redirect back
          router.push(`/community/${communityId}`);
          return;
        }
        
        // Get current user ID
        try {
          const userResponse = await authAPI.getCurrentUser();
          setCurrentUserId(userResponse.user.id);
        } catch (error) {
          console.error('Error getting current user:', error);
        }
        
        // Check if user is a member
        try {
          const membershipData = await authAPI.checkCommunityMembership(parseInt(communityId));
          setIsMember(membershipData.isMember);
        } catch {
          setIsMember(false);
        }
      } catch (error) {
        console.error('Error loading post data:', error);
        router.push(`/community/${communityId}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [communityId, postId, router]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!post) return;
    
    try {
      await authAPI.voteOnCommunityPost(parseInt(communityId), post.id, voteType);
      // Reload posts to update vote counts and userVote status
      const updatedPosts = await authAPI.getCommunityPosts(parseInt(communityId));
      const updatedPost = updatedPosts.find(p => p.id === post.id);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote';
      alert(errorMessage);
    }
  };

  const handleEditPost = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditTags(post.tags || []);
    setExistingImageUrls(post.imageUrls || []);
    setEditImages([]);
    setIsEditing(true);
  };

  const handleSavePost = async () => {
    if (!post || !editTitle.trim() || !editContent.trim()) return;

    setIsSubmitting(true);
    try {
      // Use FormData only if there are new images or existing images, otherwise use JSON
      if (editImages.length > 0 || existingImageUrls.length > 0) {
        const formData = new FormData();
        formData.append('title', editTitle.trim());
        formData.append('content', editContent.trim());
        formData.append('existingImageUrls', JSON.stringify(existingImageUrls));
        formData.append('tags', JSON.stringify(editTags));

        // Add new images
        editImages.forEach((image) => {
          formData.append('images', image);
        });

        const updatedPost = await authAPI.updateCommunityPost(parseInt(communityId), post.id, formData);
        setPost(updatedPost);
      } else {
        // No images at all, send as JSON
        const updatedPost = await authAPI.updateCommunityPost(parseInt(communityId), post.id, {
          title: editTitle.trim(),
          content: editContent.trim(),
          tags: editTags
        });
        setPost(updatedPost);
      }
      
      // Exit edit mode and reset edit states
      setIsEditing(false);
      setEditImages([]);
      setExistingImageUrls([]);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.deleteCommunityPost(parseInt(communityId), post.id);
      router.push(`/community/${communityId}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !editTags.includes(tagInput.trim())) {
      setEditTags([...editTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(t => t !== tagToRemove));
  };

  const goBackToCommunity = () => {
    router.push(`/community/${communityId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading post...</div>
        </div>
      </Layout>
    );
  }

  if (!post || !community) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Post not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <button
            onClick={goBackToCommunity}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {community.name}
          </button>
        </div>

        {/* Post Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="flex gap-6">
              {/* Vote Buttons */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => handleVote('upvote')}
                  className={`p-3 rounded-lg transition-colors ${
                    post.userVote === 'upvote'
                      ? 'text-purple-700 bg-purple-100 border-2 border-purple-300'
                      : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
                  }`}
                  disabled={!isMember}
                  title="Upvote"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                
                <span className="text-xl font-bold text-gray-700 py-2">
                  {post.upvotes - post.downvotes}
                </span>
                
                <button
                  onClick={() => handleVote('downvote')}
                  className={`p-3 rounded-lg transition-colors ${
                    post.userVote === 'downvote'
                      ? 'text-red-700 bg-red-100 border-2 border-red-300'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  disabled={!isMember}
                  title="Downvote"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Post Content */}
              <div className="flex-1">
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Post</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={10}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add a tag..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-emerald-600 hover:text-emerald-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Images (optional, max 5)</label>
                      <ArticleImageUpload
                        onImagesChange={setEditImages}
                        onExistingImagesChange={setExistingImageUrls}
                        maxImages={5}
                        initialImages={memoizedInitialImages}
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSavePost}
                        disabled={isSubmitting || !editTitle.trim() || !editContent.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
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
                  <>
                    {/* Post Header */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
                        {currentUserId === (post.authorId || post.userId) && (
                          <div className="flex gap-2">
                            <button
                              onClick={handleEditPost}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={handleDeletePost}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Posted by {post.userName || `User${post.userId}`}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>in {community.name}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post Body */}
                    <div className="prose prose-gray max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                        {post.content}
                      </div>
                      
                      {/* Post Images */}
                      {post.imageUrls && post.imageUrls.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {post.imageUrls.map((imageUrl, index) => (
                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={imageUrl}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Post Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <BookmarkButton kind="post" id={post.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
