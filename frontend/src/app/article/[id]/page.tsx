"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { authAPI, Article } from "../../../lib/auth-api";
import BookmarkButton from "@/components/BookmarkButton";
import Layout from "../../../components/Layout";

export default function ArticleView() {
    const { id } = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);

    const fetchArticle = useCallback(async () => {
            try {
                setLoading(true);
                const response = await authAPI.getArticle(Number(id));
                setArticle(response);
                // set initial user vote if provided by API
                const typed = response as Article & { userVote?: 'upvote' | 'downvote' | null };
                setUserVote(typed.userVote ?? null);
                setError(null);
            } catch (err) {
            console.error("Error fetching article:", err);
            setError("Failed to load article");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchArticle();
        }
    }, [id, fetchArticle]);

    const handleVote = async (voteType: "upvote" | "downvote") => {
        if (!article) return;

        // Optimistic update: compute new local state
        const previous: Article & { userVote?: 'upvote' | 'downvote' | null } = {
            id: article.id,
            title: article.title,
            content: article.content,
            imageUrls: article.imageUrls,
            authorName: article.authorName,
            authorBio: article.authorBio,
            authorAvatar: article.authorAvatar,
            upvotes: article.upvotes,
            downvotes: article.downvotes,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            userVote
        };

        const currently = userVote;
        const newVote = currently === voteType ? null : voteType;

        // Adjust counts locally
        const upvotes = article.upvotes;
        const downvotes = article.downvotes;

        let newUp = upvotes;
        let newDown = downvotes;

        // Remove previous vote effect
        if (currently === 'upvote') newUp = Math.max(0, newUp - 1);
        if (currently === 'downvote') newDown = Math.max(0, newDown - 1);

        // Apply new vote
        if (newVote === 'upvote') newUp += 1;
        if (newVote === 'downvote') newDown += 1;

        setArticle(prev => prev ? { ...prev, upvotes: newUp, downvotes: newDown } : prev);
        setUserVote(newVote);

        try {
            await authAPI.voteOnArticle(article.id, voteType);
            // Server handled it, nothing more to do
        } catch (err) {
            console.error("Error voting on article:", err);
            // Revert to previous state on error
            setArticle(previous);
            setUserVote(previous.userVote ?? null);
            alert('Failed to register vote. Please try again.');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const renderContent = (content: string) => {
        // Simple markdown-like rendering
        let html = content;
        
        // Code blocks with syntax highlighting (light background for contrast)
        html = html.replace(
            /```(\w+)?\n([\s\S]*?)```/g,
            '<pre class="bg-gray-100 text-gray-900 border border-gray-200 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm"><code>$2</code></pre>'
        );

        // Inline code (light background, dark text)
        html = html.replace(
            /`([^`]+)`/g,
            '<code class="bg-gray-100 text-gray-900 px-2 py-1 rounded text-sm font-mono">$1</code>'
        );
        
        // Headers
        html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-10 mb-5">$1</h1>');
        
        // Bold and italic
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        
        // Links
        html = html.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Line breaks
        html = html.replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">');
        html = html.replace(/\n/g, '<br/>');
        
        return `<p class="text-gray-700 leading-relaxed mb-4">${html}</p>`;
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-[var(--color-neutral-dark)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                        <p className="text-[var(--color-tertiary)] mt-4">Loading article...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !article) {
        return (
            <Layout>
                <div className="min-h-screen bg-[var(--color-neutral-dark)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--color-tertiary)] mb-2">
                            {error || "Article not found"}
                        </h3>
                        <button
                            onClick={() => router.push("/articles")}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                        >
                            Back to Articles
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto p-6">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Articles
                    </button>

                    {/* Article Header */}
                    <article className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        {/* Featured Image */}
                        {article.imageUrls && article.imageUrls.length > 0 && (
                            <div className="relative h-64 md:h-80">
                                <Image
                                    src={article.imageUrls[0]}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            </div>
                        )}

                        <div className="p-8">
                            {/* Article Meta */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {article.authorName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-semibold">{article.authorName}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span>{formatDate(article.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Article Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                {article.title}
                            </h1>

                            {/* Article Actions */}
                            <div className="flex items-center justify-between mb-8 py-4 border-y border-gray-200">
                                <div className="flex items-center gap-4">
                                    {/* Vote Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleVote("upvote")}
                                            className={`p-2 rounded-lg transition-colors ${
                                                userVote === "upvote"
                                                    ? "text-purple-700 bg-purple-100 border-2 border-purple-300"
                                                    : "text-gray-400 hover:text-purple-500 hover:bg-purple-50"
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
                                            onClick={() => handleVote("downvote")}
                                            className={`p-2 rounded-lg transition-colors ${
                                                userVote === "downvote"
                                                    ? "text-red-700 bg-red-100 border-2 border-red-300"
                                                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
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
                                <div className="flex items-center">
                                    <BookmarkButton kind="article" id={article.id} />
                                </div>
                            </div>

                            {/* Article Content */}
                            <div 
                                className="prose prose-slate prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
                            />

                        </div>
                    </article>

                    
                </div>
            </div>
        </Layout>
    );
}
