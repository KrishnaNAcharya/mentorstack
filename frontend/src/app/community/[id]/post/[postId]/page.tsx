'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import BookmarkButton from '@/components/BookmarkButton';
import { authAPI, CommunityPost, Community } from '@/lib/auth-api';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;
  const postId = params.postId as string;
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

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
                {/* Post Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Posted by {post.userName || `User${post.userId}`}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>in {community.name}</span>
                  </div>
                </div>

                {/* Post Body */}
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {post.content}
                  </div>
                </div>

                {/* Post Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Comments (Coming Soon)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>Share</span>
                    </div>
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
