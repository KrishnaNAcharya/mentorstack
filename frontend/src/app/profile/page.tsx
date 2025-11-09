"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "../../components/Layout";
import AvatarUpload from "../../components/AvatarUpload";
import { authAPI, MenteeProfile, MentorProfile } from "@/lib/auth-api";

type BookmarkTab = 'Questions' | 'Articles' | 'Community Posts';

type Rule = { action: string; points: number; reason: string };

// Format backend action keys (e.g., "mentorship_request_sent") into human-readable labels
function formatActionLabel(action: string): string {
  try {
    let s = action.replaceAll('_', ' ').replaceAll('-', ' ');
    // Collapse multiple spaces
    s = s.split(' ').filter(Boolean).join(' ');
    // Capitalize each word
    s = s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return s;
  } catch {
    return action;
  }
}

const QA_RULES: Rule[] = [
  { action: 'Ask a question', points: 10, reason: 'Encourages asking' },
  { action: 'Post an answer', points: 10, reason: 'Encourages helping' },
  { action: 'Answer gets upvoted', points: 5, reason: 'Quality answer' },
  { action: 'Answer gets downvoted', points: -2, reason: 'Discourages bad answers' },
  { action: 'Answer marked as accepted', points: 30, reason: 'Solved the problem!' },
  { action: 'Your question gets bookmarked', points: 10, reason: 'Useful content' },
];

const ARTICLE_RULES: Rule[] = [
  { action: 'Publish an article', points: 20, reason: 'Knowledge sharing' },
  { action: 'Article gets upvoted', points: 5, reason: 'Quality content' },
  { action: 'Article gets downvoted', points: -2, reason: 'Discourages spam' },
  { action: 'Article gets bookmarked', points: 10, reason: 'Valuable resource' },
];

const COMMUNITY_RULES: Rule[] = [
  { action: 'Create a community', points: 20, reason: 'Building ecosystem' },
  { action: 'Join a community', points: 2, reason: 'Engagement' },
  { action: 'Post in community', points: 10, reason: 'Active participation' },
  { action: 'Community post upvoted', points: 5, reason: 'Quality contribution' },
  { action: 'Community post downvoted', points: -2, reason: 'Spam prevention' },
  { action: 'Community post bookmarked', points: 10, reason: 'Valuable resource' },
];

const MENTORSHIP_RULES: Rule[] = [
  { action: 'Send mentorship request (mentee)', points: 5, reason: 'Taking initiative' },
  { action: 'Accept mentorship request (mentor)', points: 10, reason: 'Helping others' },
];

function ReputationInfoSection({ title, emoji, rules }: Readonly<{ title: string; emoji: string; rules: Rule[] }>) {
  return (
    <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-surface-dark)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" aria-hidden>{emoji}</span>
        <h5 className="text-lg font-semibold" style={{ color: 'var(--color-tertiary)' }}>{title}</h5>
      </div>
      <ul className="space-y-2">
        {rules.map((r) => (
          <li key={`${title}-${r.action}`} className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium" style={{ color: 'var(--color-tertiary)' }}>{r.action}</div>
              <div className="text-xs" style={{ color: 'var(--color-tertiary-light)' }}>{r.reason}</div>
            </div>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap self-center"
              style={{
                backgroundColor: r.points >= 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                color: 'var(--color-neutral)'
              }}
              aria-label={`${r.points >= 0 ? '+' : ''}${r.points} points`}
            >
              {r.points >= 0 ? `+${r.points}` : r.points}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReputationInfoModal({ onClose }: Readonly<{ onClose: () => void }>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    globalThis.addEventListener('keydown', onKey as any);
    return () => globalThis.removeEventListener('keydown', onKey as any);
  }, [onClose]);

  return (
    <dialog open aria-labelledby="rep-info-title" className="fixed inset-0 z-50 p-0 m-0 bg-transparent">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        title="Close"
        onClick={onClose}
        className="fixed inset-0 bg-black/60"
      />
      {/* Modal container */}
      <div className="fixed inset-0 p-4 flex items-center justify-center pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-xl border animate-fadeInUp"
          style={{ backgroundColor: 'var(--color-neutral)', borderColor: 'var(--color-surface-dark)' }}
        >
          <div className="p-5 border-b" style={{ borderColor: 'var(--color-surface-dark)' }}>
            <div className="flex items-center justify-between">
              <h4 id="rep-info-title" className="text-xl font-bold" style={{ color: 'var(--color-tertiary)' }}>How reputation works</h4>
              <button
                onClick={onClose}
                className="rounded-full w-8 h-8 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--color-surface-light)', color: 'var(--color-tertiary)' }}
                aria-label="Close"
                title="Close"
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-tertiary-light)' }}>
              Earn points for helpful activity across the platform. Higher reputation unlocks more trust and visibility.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReputationInfoSection title="Question & Answer" emoji="❓" rules={QA_RULES} />
              <ReputationInfoSection title="Articles" emoji="📄" rules={ARTICLE_RULES} />
              <ReputationInfoSection title="Communities" emoji="💬" rules={COMMUNITY_RULES} />
              <ReputationInfoSection title="Mentorship" emoji="🤝" rules={MENTORSHIP_RULES} />
            </div>
            <div className="text-xs" style={{ color: 'var(--color-tertiary-light)' }}>
              Note: Focus on creating high-quality, helpful contributions.
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

// Helper component to reduce cognitive complexity of main ProfilePage
function TabContent(props: Readonly<{
  activeTab: string;
  menteeProfile: MenteeProfile | null;
  mentorProfile: MentorProfile | null;
  profile: (MenteeProfile | MentorProfile) | null;
  router: ReturnType<typeof useRouter>;
  bookmarks: any; // could refine
  bookmarkedSubTab: BookmarkTab;
  setBookmarkedSubTab: (v: BookmarkTab) => void;
  reputationHistory: Array<{ id: number; points: number; action: string; description?: string | null; createdAt: string }>;
  repLoading: boolean;
  repError: string | null;
}>) {
  const { activeTab, menteeProfile, mentorProfile, profile, router, bookmarks, bookmarkedSubTab, setBookmarkedSubTab, reputationHistory, repLoading, repError } = props;
  const [showRepInfo, setShowRepInfo] = useState(false);
  if (!profile) return null;
  const questions = (menteeProfile?.questions || mentorProfile?.questions || []);
  return (
    <>
      {activeTab === "My Questions" && (
        <div className="animate-fadeIn">
          {(questions.length > 0) ? (
            <div className="space-y-4">
              {questions.map((question: any, index: number) => (
                <button
                  key={question.id}
                  onClick={() => router.push(`/questions/${question.id}`)}
                  className="text-left w-full rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeInUp focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--color-surface-dark)',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <h4 className="font-semibold mb-2 transition-colors duration-300" style={{ color: 'var(--color-tertiary)' }}>{question.title}</h4>
                  {question.description && (
                    <p className="text-sm mb-3" style={{ color: 'var(--color-tertiary-light)' }}>{question.description}</p>
                  )}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {question.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-neutral)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs" style={{ color: 'var(--color-tertiary-light)' }}>
                    {new Date(question.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fadeIn">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ backgroundColor: 'var(--color-surface-light)' }}>
                <span className="text-2xl">❓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-tertiary)' }}>No questions yet</h3>
              <p className="mb-6" style={{ color: 'var(--color-tertiary-light)' }}>Start your learning journey by asking your first question.</p>
              <Link href="/ask-question">
                <button className="px-6 py-3 font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-neutral)' }}>
                  Ask Your First Question
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
      {activeTab === "Posts" && (
        <div className="animate-fadeIn">
          {((menteeProfile?.communityPosts || []).length > 0) ? (
            <div className="space-y-4">
              {(menteeProfile?.communityPosts || []).map((post: any, index: number) => (
                <button
                  key={post.id}
                  onClick={() => router.push(`/community/${post.communityId}/post/${post.id}`)}
                  className="text-left w-full rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeInUp focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--color-surface-dark)',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-tertiary)' }}>{post.title}</h4>
                  <p className="text-sm mb-3 line-clamp-3" style={{ color: 'var(--color-tertiary-light)' }}>{post.content}</p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-tertiary-light)' }}>
                    <span>in {post.communityName}</span>
                    <span>•</span>
                    <span>{post.upvotes - post.downvotes} votes</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fadeIn">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ backgroundColor: 'var(--color-surface-light)' }}>
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-tertiary)' }}>No community posts yet</h3>
              <p style={{ color: 'var(--color-tertiary-light)' }}>Join a community and share your thoughts!</p>
            </div>
          )}
        </div>
      )}
      {activeTab === "Articles" && (
        <div className="animate-fadeIn">
          {((menteeProfile?.articles || mentorProfile?.articles || []).length > 0) ? (
            <div className="space-y-4">
              {(menteeProfile?.articles || mentorProfile?.articles || []).map((article: any, index: number) => (
                <button
                  key={article.id}
                  onClick={() => router.push(`/articles/${article.id}`)}
                  className="text-left w-full rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeInUp focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--color-surface-dark)',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-tertiary)' }}>{article.title}</h4>
                  <p className="text-sm mb-3 line-clamp-3" style={{ color: 'var(--color-tertiary-light)' }}>{article.content}</p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-tertiary-light)' }}>
                    {'upvotes' in article && 'downvotes' in article && (
                      <>
                        <span>{article.upvotes - article.downvotes} votes</span>
                        <span>•</span>
                      </>
                    )}
                    <span>Published on {new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fadeIn">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ backgroundColor: 'var(--color-surface-light)' }}>
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-tertiary)' }}>No articles yet</h3>
              <p className="mb-6" style={{ color: 'var(--color-tertiary-light)' }}>Share your knowledge by writing your first article.</p>
              <Link href="/create-article">
                <button className="px-6 py-3 font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-neutral)' }}>
                  Write Your First Article
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
      {activeTab === "Answered" && (
        <div className="animate-fadeIn">
          {((menteeProfile?.answeredQuestions || mentorProfile?.answers || []).length > 0) ? (
            <div className="space-y-4">
              {(menteeProfile?.answeredQuestions || mentorProfile?.answers || []).map((answer: any, index: number) => {
                const questionId = 'questionId' in answer ? answer.questionId : answer.question.id;
                const questionTitle = 'questionTitle' in answer ? answer.questionTitle : answer.question.title;
                const hasVotes = 'upvotes' in answer && 'downvotes' in answer;
                return (
                  <button
                    key={answer.id}
                    onClick={() => router.push(`/questions/${questionId}`)}
                    className="text-left w-full rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeInUp focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--color-surface-dark)',
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--color-tertiary)' }}>Re: {questionTitle}</h4>
                    <p className="text-sm mb-3 line-clamp-3" style={{ color: 'var(--color-tertiary-light)' }}>{answer.content}</p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-tertiary-light)' }}>
                      {hasVotes && (
                        <>
                          <span>{answer.upvotes - answer.downvotes} votes</span>
                          <span>•</span>
                        </>
                      )}
                      <span>Answered on {new Date(answer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 animate-fadeIn">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-float" style={{ backgroundColor: 'var(--color-surface-light)' }}>
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-tertiary)' }}>No answers yet</h3>
              <p style={{ color: 'var(--color-tertiary-light)' }}>Start helping others by answering questions!</p>
            </div>
          )}
        </div>
      )}
      {activeTab === "Bookmarked" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="-mx-6 px-6" style={{ borderBottom: '1px solid var(--color-surface-dark)' }}>
            <div className="flex gap-6 overflow-x-auto">
              {([
                { key: 'Questions', count: bookmarks?.questions.length || 0 },
                { key: 'Articles', count: bookmarks?.articles.length || 0 },
                { key: 'Community Posts', count: bookmarks?.posts.length || 0 },
              ] as Array<{ key: 'Questions' | 'Articles' | 'Community Posts'; count: number }>).map(({ key, count }) => (
                <button
                  key={key}
                  onClick={() => setBookmarkedSubTab(key)}
                  className="py-3 font-medium border-b-2 transition-all duration-300 whitespace-nowrap hover:scale-105"
                  style={{
                    borderColor: bookmarkedSubTab === key ? 'var(--color-secondary)' : 'transparent',
                    color: bookmarkedSubTab === key ? 'var(--color-secondary)' : 'var(--color-tertiary-light)'
                  }}
                  aria-current={bookmarkedSubTab === key ? 'page' : undefined}
                >
                  {key}
                  <span className="ml-2 text-xs" style={{ color: 'var(--color-tertiary-light)' }}>{count}</span>
                </button>
              ))}
            </div>
          </div>
          {bookmarkedSubTab === 'Questions' && (
            <div className="animate-fadeIn">
              {bookmarks && bookmarks.questions.length > 0 ? (
                <div className="space-y-3">
                  {bookmarks.questions.map((b: any, index: number) => (
                    <div key={`q-${b.questionId}`} className="rounded-lg p-3 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeInUp" style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-surface-dark)', animationDelay: `${index * 0.05}s` }}>
                      <a className="font-medium hover:underline" style={{ color: 'var(--color-secondary)' }} href={`/questions/${b.questionId}`}>{b.title}</a>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-tertiary-light)' }}>Saved {new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--color-tertiary-light)' }}>No bookmarked questions.</div>
              )}
            </div>
          )}
          {bookmarkedSubTab === 'Articles' && (
            <div className="animate-fadeIn">
              {bookmarks && bookmarks.articles.length > 0 ? (
                <div className="space-y-3">
                  {bookmarks.articles.map((b: any, index: number) => (
                    <div key={`a-${b.articleId}`} className="rounded-lg p-3 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeInUp" style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-surface-dark)', animationDelay: `${index * 0.05}s` }}>
                      <a className="font-medium hover:underline" style={{ color: 'var(--color-secondary)' }} href={`/article/${b.articleId}`}>{b.title}</a>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-tertiary-light)' }}>Saved {new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--color-tertiary-light)' }}>No bookmarked articles.</div>
              )}
            </div>
          )}
          {bookmarkedSubTab === 'Community Posts' && (
            <div className="animate-fadeIn">
              {bookmarks && bookmarks.posts.length > 0 ? (
                <div className="space-y-3">
                  {bookmarks.posts.map((b: any, index: number) => (
                    <div key={`p-${b.postId}`} className="rounded-lg p-3 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeInUp" style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-surface-dark)', animationDelay: `${index * 0.05}s` }}>
                      <a className="font-medium hover:underline" style={{ color: 'var(--color-secondary)' }} href={`/community/${b.communityId}/post/${b.postId}`}>{b.title}</a>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-tertiary-light)' }}>Saved {new Date(b.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--color-tertiary-light)' }}>No bookmarked posts.</div>
              )}
            </div>
          )}
        </div>
      )}
      {activeTab === "Reputation" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="text-xl font-semibold" style={{ color: 'var(--color-tertiary)' }}>Reputation History</h4>
              <button
                onClick={() => setShowRepInfo(true)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition hover:scale-110 focus:outline-none focus:ring-2"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  color: 'var(--color-neutral)'
                }}
                aria-label="How reputation works"
                title="How reputation works"
              >
                i
              </button>
            </div>
            <div className="text-sm" style={{ color: 'var(--color-tertiary-light)' }}>
              Total: <span className="font-semibold" style={{ color: 'var(--color-tertiary)' }}>{profile.reputation}</span>
            </div>
          </div>
          {repLoading && (<div style={{ color: 'var(--color-tertiary-light)' }}>Loading...</div>)}
          {repError && (<div style={{ color: 'var(--color-primary)' }}>{repError}</div>)}
          {!repLoading && !repError && reputationHistory.length === 0 && (<div style={{ color: 'var(--color-tertiary-light)' }}>No reputation events yet.</div>)}
          <div className="space-y-3">
            {reputationHistory.map((entry, index) => (
              <div key={entry.id} className="rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fadeInUp" style={{ backgroundColor: 'var(--color-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-surface-dark)', animationDelay: `${index * 0.04}s` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-tertiary)' }}>{formatActionLabel(entry.action)}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-tertiary-light)' }}>{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: entry.points >= 0 ? 'var(--color-primary)' : 'var(--color-secondary)', color: 'var(--color-neutral)' }}>{entry.points >= 0 ? `+${entry.points}` : entry.points}</span>
                </div>
              </div>
            ))}
          </div>
          {showRepInfo && <ReputationInfoModal onClose={() => setShowRepInfo(false)} />}
        </div>
      )}
    </>
  );
}

export default function ProfilePage() {
  const [menteeProfile, setMenteeProfile] = useState<MenteeProfile | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [userRole, setUserRole] = useState<'mentor' | 'mentee' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("My Questions");
  const [reputationHistory, setReputationHistory] = useState<Array<{ id: number; points: number; action: string; description?: string | null; createdAt: string }>>([]);
  const [repLoading, setRepLoading] = useState(false);
  const [repError, setRepError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<{
    questions: Array<{ questionId: number; title: string; createdAt: string }>;
    articles: Array<{ articleId: number; title: string; createdAt: string }>;
    posts: Array<{ postId: number; title: string; communityId: number; communityName?: string; createdAt: string }>;
  } | null>(null);
  const [bookmarkedSubTab, setBookmarkedSubTab] = useState<BookmarkTab>('Questions');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // First get current user to determine role
        const user = await authAPI.getCurrentUser();
        setUserRole(user.user.role);

        if (user.user.role === 'mentee') {
          // Get mentee profile
          const profileData = await authAPI.getMenteeProfile();
          setMenteeProfile(profileData);
          setActiveTab("My Questions");
        } else if (user.user.role === 'mentor') {
          // Get mentor profile
          const profileData = await authAPI.getMentorProfile();
          setMentorProfile(profileData);
          setActiveTab("My Questions");
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // Load bookmarks when Bookmarked tab becomes active for mentees
  useEffect(() => {
    const loadBookmarks = async () => {
      if (activeTab !== "Bookmarked") return;
      try {
        const res = await authAPI.getMyBookmarks();
        setBookmarks(res);
      } catch (e) {
        console.error("Failed to load bookmarks", e);
        setBookmarks({ questions: [], articles: [], posts: [] });
      }
    };
    loadBookmarks();
  }, [activeTab]);

  // Lazy load reputation when tab activated
  useEffect(() => {
    const loadReputation = async () => {
      if (activeTab !== 'Reputation') return;
      setRepLoading(true);
      setRepError(null);
      try {
        const res = await authAPI.getReputationHistory(1, 100);
        setReputationHistory(res.entries);
      } catch (e: any) {
        setRepError(e.message || 'Failed to load reputation history');
      } finally {
        setRepLoading(false);
      }
    };
    loadReputation();
  }, [activeTab]);

  const handleSaveProfile = async () => {
    if (!menteeProfile && !mentorProfile) return;
    
    try {
      if (userRole === 'mentee' && menteeProfile) {
        await authAPI.updateMenteeProfile({
          name: menteeProfile.name,
          bio: menteeProfile.bio,
          skills: menteeProfile.skills
        });
      } else if (userRole === 'mentor' && mentorProfile) {
        await authAPI.updateMentorProfile({
          name: mentorProfile.name,
          bio: mentorProfile.bio,
          skills: mentorProfile.skills,
          location: mentorProfile.location || undefined
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64" style={{ backgroundColor: 'var(--color-neutral-dark)' }}>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
            <div className="text-lg" style={{ color: 'var(--color-tertiary)' }}>Loading profile...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!menteeProfile && !mentorProfile) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64" style={{ backgroundColor: 'var(--color-neutral-dark)' }}>
          <div className="text-lg" style={{ color: 'var(--color-tertiary)' }}>Profile not found</div>
        </div>
      </Layout>
    );
  }

  const profile = menteeProfile || mentorProfile;
  if (!profile) return null;

  return (
    <Layout>
      <div className="flex flex-1 p-8 gap-8 overflow-auto" style={{ backgroundColor: 'var(--color-neutral-dark)' }}>
        {/* Main Profile Content */}
        <div className="flex-1">
          {/* Profile Header with gradient and animation */}
          <div 
            className="rounded-2xl shadow-sm border p-8 mb-6 animate-fadeIn hover:shadow-lg transition-all duration-300"
            style={{
              backgroundColor: 'var(--color-neutral)',
              borderColor: 'var(--color-surface-dark)'
            }}
          >
            <div className="flex items-start gap-6">
              {/* Profile Picture with Upload */}
              <AvatarUpload
                currentAvatarUrl={profile.avatarUrl || null}
                onUploadSuccess={(newUrl) => {
                  if (menteeProfile) {
                    setMenteeProfile({ ...menteeProfile, avatarUrl: newUrl });
                  } else if (mentorProfile) {
                    setMentorProfile({ ...mentorProfile, avatarUrl: newUrl });
                  }
                }}
                onDeleteSuccess={() => {
                  if (menteeProfile) {
                    setMenteeProfile({ ...menteeProfile, avatarUrl: null });
                  } else if (mentorProfile) {
                    setMentorProfile({ ...mentorProfile, avatarUrl: null });
                  }
                }}
                size="xl"
                editable={true}
              />
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 animate-slideInRight">
                  <h1 className="text-3xl font-bold" style={{ color: 'var(--color-tertiary)' }}>{profile.name}</h1>
                  <span style={{ color: 'var(--color-tertiary-light)' }}>User{profile.id}</span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: userRole === 'mentor' ? 'var(--color-surface-light)' : 'var(--color-primary)',
                      color: userRole === 'mentor' ? 'var(--color-secondary)' : 'var(--color-neutral)'
                    }}
                  >
                    {userRole === 'mentor' ? '🎓 Mentor' : '📚 Mentee'}
                  </span>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="ml-auto p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90"
                    style={{
                      color: 'var(--color-tertiary-light)',
                      backgroundColor: 'var(--color-surface-light)'
                    }}
                    title="Edit profile"
                    aria-label="Edit profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4 animate-fadeIn">
                    <textarea
                      value={profile.bio}
                      onChange={(e) => {
                        if (menteeProfile) {
                          setMenteeProfile({...menteeProfile, bio: e.target.value});
                        } else if (mentorProfile) {
                          setMentorProfile({...mentorProfile, bio: e.target.value});
                        }
                      }}
                      className="w-full p-3 rounded-lg resize-none transition-all duration-300 focus:ring-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-surface-dark)',
                        color: 'var(--color-tertiary)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      rows={2}
                      placeholder="Write a short description about yourself"
                    />
                    {userRole === 'mentor' && mentorProfile && (
                      <input
                        type="text"
                        value={mentorProfile.location || ''}
                        onChange={(e) => setMentorProfile({...mentorProfile, location: e.target.value})}
                        className="w-full p-3 rounded-lg transition-all duration-300 focus:ring-2 focus:outline-none"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          borderColor: 'var(--color-surface-dark)',
                          color: 'var(--color-tertiary)',
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                        placeholder="Location (optional)"
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 animate-fadeIn">
                    <p className="mb-4" style={{ color: 'var(--color-tertiary)' }}>{profile.bio}</p>
                    {userRole === 'mentor' && mentorProfile?.location && (
                      <p className="text-sm" style={{ color: 'var(--color-tertiary-light)' }}>📍 {mentorProfile.location}</p>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3 animate-fadeInUp">
                  <Link href="/ask-question">
                    <button 
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-surface-light)',
                        color: 'var(--color-secondary)'
                      }}
                    >
                      ❓ Ask Question
                    </button>
                  </Link>
                  <Link href="/create-article">
                    <button 
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-surface-light)',
                        color: 'var(--color-secondary)'
                      }}
                    >
                      ✍️ Write Article
                    </button>
                  </Link>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-tertiary)'
                    }}
                  >
                    {isEditing ? '❌ Cancel' : '✏️ Edit Profile'}
                  </button>
                  {isEditing && (
                    <button 
                      onClick={handleSaveProfile}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fadeIn"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-neutral)'
                      }}
                    >
                      💾 Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div 
            className="rounded-2xl shadow-lg border animate-fadeIn"
            style={{
              backgroundColor: 'var(--color-neutral)',
              borderColor: 'var(--color-surface-dark)'
            }}
          >
            {/* Tab Navigation */}
            <div 
              className="px-6"
              style={{ 
                borderBottom: '1px solid var(--color-surface-dark)'
              }}
            >
              <div className="flex gap-8">
                {["My Questions", "Articles", "Posts", "Answered", "Bookmarked", "Reputation"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="py-4 font-medium border-b-2 transition-all duration-300 hover:scale-105"
                    style={{
                      borderColor: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                      color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-tertiary-light)'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Unified Tabs for Both Roles */}
              {profile && (
                <TabContent
                  activeTab={activeTab}
                  menteeProfile={menteeProfile}
                  mentorProfile={mentorProfile}
                  profile={profile}
                  router={router}
                  bookmarks={bookmarks}
                  bookmarkedSubTab={bookmarkedSubTab}
                  setBookmarkedSubTab={setBookmarkedSubTab}
                  reputationHistory={reputationHistory}
                  repLoading={repLoading}
                  repError={repError}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 flex flex-col gap-6">
          {/* Personal Details */}
          <div 
            className="rounded-2xl shadow-lg p-6 animate-fadeIn"
            style={{
              backgroundColor: 'var(--color-neutral)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--color-surface-dark)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-tertiary)' }}>📋 Personal Details</h3>
            
            <div className="space-y-4">
              <div aria-label="Email">
                <div className="block text-sm font-medium mb-1" style={{ color: 'var(--color-tertiary-light)' }}>Email</div>
                <p style={{ color: 'var(--color-tertiary)' }}>{profile.email}</p>
              </div>

              <div aria-label="Joined">
                <div className="block text-sm font-medium mb-1" style={{ color: 'var(--color-tertiary-light)' }}>Joined</div>
                <p style={{ color: 'var(--color-tertiary)' }}>{new Date(profile.joinedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>

              <div aria-label="Reputation">
                <div className="block text-sm font-medium mb-1" style={{ color: 'var(--color-tertiary-light)' }}>Reputation</div>
                <p style={{ color: 'var(--color-tertiary)' }}>{profile.reputation}</p>
              </div>
            </div>
          </div>

          {/* Skills/Knows About */}
          <div 
            className="rounded-2xl shadow-lg p-6 animate-fadeIn"
            style={{
              backgroundColor: 'var(--color-neutral)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--color-surface-dark)',
              animationDelay: '0.1s'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-tertiary)' }}>🎯 Knows about</h3>
            
            {isEditing ? (
              <div className="space-y-2">
                {((userRole === 'mentee' ? menteeProfile?.skills : mentorProfile?.skills) || []).map((skill, index) => (
                  <div key={skill || `skill-${index}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => {
                        if (userRole === 'mentee' && menteeProfile) {
                          const newSkills = [...menteeProfile.skills];
                          newSkills[index] = e.target.value;
                          setMenteeProfile({...menteeProfile, skills: newSkills});
                        } else if (userRole === 'mentor' && mentorProfile) {
                          const newSkills = [...mentorProfile.skills];
                          newSkills[index] = e.target.value;
                          setMentorProfile({...mentorProfile, skills: newSkills});
                        }
                      }}
                      className="flex-1 p-2 rounded-lg transition-all duration-300 focus:ring-2 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--color-surface-dark)',
                        color: 'var(--color-tertiary)'
                      }}
                      placeholder="Enter skill"
                      aria-label={`Skill ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        if (userRole === 'mentee' && menteeProfile) {
                          const newSkills = menteeProfile.skills.filter((_, i) => i !== index);
                          setMenteeProfile({...menteeProfile, skills: newSkills});
                        } else if (userRole === 'mentor' && mentorProfile) {
                          const newSkills = mentorProfile.skills.filter((_, i) => i !== index);
                          setMentorProfile({...mentorProfile, skills: newSkills});
                        }
                      }}
                      className="transition-all duration-300 hover:scale-110"
                      style={{ color: 'var(--color-tertiary-light)' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    if (userRole === 'mentee' && menteeProfile) {
                      setMenteeProfile({...menteeProfile, skills: [...menteeProfile.skills, ""]});
                    } else if (userRole === 'mentor' && mentorProfile) {
                      setMentorProfile({...mentorProfile, skills: [...mentorProfile.skills, ""]});
                    }
                  }}
                  className="w-full p-2 rounded-lg border border-dashed transition-all duration-300 hover:scale-105"
                  style={{
                    borderColor: 'var(--color-surface-dark)',
                    color: 'var(--color-tertiary-light)'
                  }}
                >
                  + Add Skill
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {((userRole === 'mentee' ? menteeProfile?.skills : mentorProfile?.skills) || []).map((skill, index) => (
                  <div 
                    key={skill || `skill-${index}`} 
                    className="w-full h-6 rounded-full animate-fadeInUp"
                    style={{ 
                      backgroundColor: 'var(--color-surface)',
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div 
                      className="h-full rounded-full flex items-center px-3"
                      style={{
                        background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))'
                      }}
                    >
                      <span className="text-xs font-medium" style={{ color: 'var(--color-neutral)' }}>{skill}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div 
            className="rounded-2xl shadow-lg p-6 animate-fadeIn"
            style={{
              backgroundColor: 'var(--color-neutral)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--color-surface-dark)',
              animationDelay: '0.2s'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-tertiary)' }}>📊 Activity</h3>

            <div className="space-y-4">
              {userRole === 'mentee' && menteeProfile && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-tertiary-light)' }}>Questions Asked</span>
                    <span className="font-semibold" style={{ color: 'var(--color-tertiary)' }}>{menteeProfile.stats.questionsAsked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-tertiary-light)' }}>Bookmarks</span>
                    <span className="font-semibold" style={{ color: 'var(--color-tertiary)' }}>{menteeProfile.stats.bookmarksCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-tertiary-light)' }}>Mentorship Requests</span>
                    <span className="font-semibold" style={{ color: 'var(--color-tertiary)' }}>{menteeProfile.stats.mentorshipRequestsCount}</span>
                  </div>
                </>
              )}
              {userRole === 'mentor' && mentorProfile && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-tertiary-light)' }}>Answers Provided</span>
                    <span className="font-semibold" style={{ color: 'var(--color-tertiary)' }}>{mentorProfile.stats.answersProvided}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-tertiary-light)' }}>Articles Written</span>
                    <span className="font-semibold" style={{ color: 'var(--color-tertiary)' }}>{mentorProfile.stats.articlesWritten}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-tertiary-light)' }}>Mentees Connected</span>
                    <span className="font-semibold" style={{ color: 'var(--color-tertiary)' }}>{mentorProfile.stats.menteesConnected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-tertiary-light)' }}>Requests Received</span>
                    <span className="font-semibold" style={{ color: 'var(--color-tertiary)' }}>{mentorProfile.stats.mentorshipRequests}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
