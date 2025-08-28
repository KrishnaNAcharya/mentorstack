'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Article as APIArticle, authAPI, Tag } from '@/lib/auth-api';
import Layout from '@/components/Layout';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<APIArticle[]>([]);
  const [categories, setCategories] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userVotes, setUserVotes] = useState<Record<number, 'upvote' | 'downvote' | null>>({});
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesResponse, categoriesData] = await Promise.all([
          authAPI.getArticles(1, 10, selectedCategory === 'All' ? undefined : selectedCategory),
          authAPI.getPopularTags()
        ]);
        setArticles(articlesResponse.articles);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Check if there's a category in URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [selectedCategory, searchParams]);

  const fetchArticles = async (category?: string) => {
    try {
      const response = await authAPI.getArticles(1, 10, category);
      setArticles(response.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleVote = async (articleId: number, voteType: 'upvote' | 'downvote') => {
    try {
      await authAPI.voteOnArticle(articleId, voteType);
      
      // Update user vote state
      const currentVote = userVotes[articleId];
      const newVote = currentVote === voteType ? null : voteType;
      setUserVotes(prev => ({ ...prev, [articleId]: newVote }));
      
      // Refresh articles to get updated vote counts
      fetchArticles(selectedCategory === 'All' ? undefined : selectedCategory);
    } catch (error) {
      console.error('Error voting on article:', error);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      await fetchArticles(category === 'All' ? undefined : category);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (selectedCategory === 'All') return true;
    return article.tags && article.tags.some(tag => 
      tag.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  });

  const getCategoryFromTitle = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('react') || titleLower.includes('javascript') || titleLower.includes('frontend')) return 'Frontend';
    if (titleLower.includes('node') || titleLower.includes('api') || titleLower.includes('database')) return 'Backend';
    if (titleLower.includes('ai') || titleLower.includes('machine learning')) return 'AI';
    return 'Web Development';
  };

  const getArticleImage = (articleId: number) => {
    // Generate different placeholder images for variety
    const images = [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Programming
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Code
      'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Data
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Charts
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Web design
    ];
    return images[articleId % images.length];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Articles</h1>
          <Link href="/create-article">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              ➕ Create a Post
            </button>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCategoryChange('All')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryChange(category.name)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.name
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6">
          {filteredArticles.map(article => (
            <div key={article.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="flex">
                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">📅 {new Date(article.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                    <a href={`/article/${article.id}`} className="hover:text-blue-600 transition-colors">
                      {article.title}
                    </a>
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {article.content.replace(/[#*`]/g, '').substring(0, 180)}...
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {getCategoryFromTitle(article.title)}
                      </span>
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        By {article.authorName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {/* Vote Buttons with SVG Arrows */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(article.id, 'upvote')}
                          className={`p-2 rounded-lg transition-colors ${
                            userVotes[article.id] === 'upvote'
                              ? 'text-purple-700 bg-purple-100 border-2 border-purple-300'
                              : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
                          }`}
                          title="Upvote article"
                          aria-label="Upvote article"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
                          {article.upvotes - article.downvotes}
                        </span>
                        <button
                          onClick={() => handleVote(article.id, 'downvote')}
                          className={`p-2 rounded-lg transition-colors ${
                            userVotes[article.id] === 'downvote'
                              ? 'text-red-700 bg-red-100 border-2 border-red-300'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title="Downvote article"
                          aria-label="Downvote article"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Image */}
                <div className="w-48 h-40 bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0">
                  <Image 
                    src={getArticleImage(article.id)}
                    alt={article.title}
                    width={192}
                    height={160}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient background
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-500 text-xl font-medium">📄 No articles found</div>
            <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </Layout>
  );
}