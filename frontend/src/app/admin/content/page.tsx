"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminAPI, Question } from "@/lib/admin-api";
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Pencil,
  ThumbsUp,
  ThumbsDown,
  User
} from "lucide-react";

// request for the questions tab only
// Only questions tab remains per request
type ContentType = 'questions';

export default function ContentAdminPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionDetails, setQuestionDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    loadContent();
  }, [activeTab, currentPage, searchTerm]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getQuestions(currentPage, 20);
      setQuestions(response.questions);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      try {
        await adminAPI.deleteQuestion(questionId);
        loadContent(); // Reload content
      } catch (err) {
        console.error("Failed to delete question:", err);
      }
    }
  };

  const openQuestionDetails = async (q: Question) => {
    setSelectedQuestion(q);
    setShowQuestionModal(true);
    setQuestionDetails(null);
    setEditMode(false);
    setDetailsError(null);
    try {
      setDetailsLoading(true);
      const details = await adminAPI.getQuestionDetails(q.id);
      setQuestionDetails(details);
      setEditTitle(details.title);
      setEditBody(details.body);
    } catch (e: any) {
      setDetailsError(e.message || 'Failed to load question');
    } finally {
      setDetailsLoading(false);
    }
  };

  const saveQuestionEdits = async () => {
    if (!selectedQuestion) return;
    try {
      const payload: { title?: string; body?: string } = {};
      if (editTitle && editTitle !== questionDetails?.title) payload.title = editTitle;
      if (editBody && editBody !== questionDetails?.body) payload.body = editBody;
      if (Object.keys(payload).length === 0) { setEditMode(false); return; }
      await adminAPI.updateQuestion(selectedQuestion.id, payload);
      // refresh details and list
      await openQuestionDetails(selectedQuestion);
      await loadContent();
      setEditMode(false);
    } catch (e) {
      alert((e as any).message || 'Failed to update question');
    }
  };

  const deleteAnswer = async (answerId: number) => {
    if (!questionDetails) return;
    if (!confirm('Delete this answer?')) return;
    try {
      await adminAPI.deleteAnswer(answerId);
      // remove locally without refetch for snappier UX
      setQuestionDetails({
        ...questionDetails,
        answers: questionDetails.answers.filter((a: any) => a.id !== answerId),
        _count: { ...questionDetails._count, answers: Math.max(0, (questionDetails._count?.answers || 1) - 1) }
      });
    } catch (e) {
      alert((e as any).message || 'Failed to delete answer');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredQuestions = () => {
    return questions.filter(question =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // articles removed

  if (loading && questions.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2 drop-shadow-[0_2px_10px_rgba(34,197,94,0.35)]">
              <MessageSquare className="w-7 h-7 text-emerald-400" /> Q&A Content
            </h1>
            <p className="text-sm text-gray-600 mt-1">Moderate questions and answers across the platform.</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="rounded-xl p-[1px] bg-gradient-to-br from-emerald-300/60 via-cyan-300/50 to-emerald-300/60 shadow-[0_10px_30px_-10px_rgba(6,182,212,0.35)]">
              <div className="rounded-xl px-5 py-3 bg-gradient-to-br from-white/75 to-white/55 backdrop-blur-xl border border-emerald-300/60">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/90">Total</span>
                <div className="text-xl font-bold text-emerald-700 -mt-0.5">{questions.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Container */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-300/60 via-cyan-300/50 to-emerald-300/60 shadow-[0_20px_60px_-20px_rgba(6,182,212,0.45)]">
          <div className="rounded-2xl bg-gradient-to-br from-white/85 to-white/65 backdrop-blur-xl border border-emerald-300/60">

          {/* Search */}
          <div className="p-6 border-b border-emerald-200/60">
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search questions...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm rounded-lg bg-white/75 border border-emerald-300/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 placeholder-emerald-600/50 shadow-[0_0_0_3px_rgba(16,185,129,0.08)_inset]"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {(
              <div className="space-y-4">
                {getFilteredQuestions().length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No questions found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? "Try adjusting your search criteria" : "No questions have been posted yet"}
                    </p>
                  </div>
                ) : (
                  getFilteredQuestions().map((question) => (
                    <div key={question.id} className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-300/60 via-cyan-300/50 to-emerald-300/60 shadow-[0_25px_60px_-20px_rgba(6,182,212,0.35)]">
                      <div className="rounded-2xl border border-emerald-300/60 bg-gradient-to-br from-white/90 to-white/70 p-6">
                        <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1" title={question.title}>{question.title}</h3>
                          <p className="text-gray-700/90 mb-4 line-clamp-3">{question.body}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{question.author.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{question._count.answers} answers</span>
                            </div>
                            <span>{formatDate(question.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => openQuestionDetails(question)}
                            className="p-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/80 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditMode(true); setEditTitle(question.title); setEditBody(question.body); openQuestionDetails(question); }}
                            className="p-2 text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50/80 rounded-lg transition-colors"
                            title="Edit Question"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-emerald-200/60 bg-gradient-to-r from-white/80 to-white/70 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/75 border border-emerald-300/60 hover:border-emerald-400 hover:bg-emerald-50/80 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/75 border border-emerald-300/60 hover:border-emerald-400 hover:bg-emerald-50/80 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Question Detail Modal */}
        {showQuestionModal && selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-slate-900/85 to-cyan-900/90 backdrop-blur-sm" />
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-[1px] bg-gradient-to-br from-emerald-300/60 via-cyan-300/50 to-emerald-300/60 shadow-[0_30px_80px_-20px_rgba(6,182,212,0.45)]">
              <div className="rounded-2xl bg-gradient-to-br from-white/92 to-white/82 backdrop-blur-xl border border-emerald-300/60">
              <div className="px-8 pt-6 pb-5 border-b border-emerald-200/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(6,182,212,0.35)]">Question Details</h3>
                  <button onClick={() => setShowQuestionModal(false)} className="rounded-lg p-2 text-emerald-600 hover:text-emerald-700">✕</button>
                </div>
              </div>
              <div className="px-8 py-6 space-y-8">
                {detailsLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
                  </div>
                )}
                {detailsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{detailsError}</div>
                )}
                {(!detailsLoading && !detailsError && questionDetails) && (
                  <>
                    {/* Overview + Edit */}
                    <div className="space-y-3">
                      {!editMode ? (
                        <>
                          <h4 className="text-xl font-semibold text-gray-900 tracking-tight">{questionDetails.title}</h4>
                          <p className="text-sm text-gray-700/90 leading-relaxed whitespace-pre-wrap">{questionDetails.body}</p>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 border border-emerald-300/60 rounded-lg bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-500/80" />
                          <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={6} className="w-full px-3 py-2 border border-emerald-300/60 rounded-lg bg-white/85 focus:outline-none focus:ring-2 focus:ring-emerald-500/80" />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {questionDetails.author?.name} • {new Date(questionDetails.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <div className="flex items-center gap-2">
                          {!editMode ? (
                            <button onClick={() => setEditMode(true)} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/75 border border-cyan-300/60 text-cyan-700 hover:bg-cyan-50/80">Edit</button>
                          ) : (
                            <>
                              <button onClick={saveQuestionEdits} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-[0_8px_24px_-8px_rgba(6,182,212,0.4)]">Save</button>
                              <button onClick={() => { setEditMode(false); setEditTitle(questionDetails.title); setEditBody(questionDetails.body); }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/75 border border-emerald-300/60 text-emerald-700 hover:bg-emerald-50/80">Cancel</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Answer list with the delete functionalities*/}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold tracking-wide text-emerald-700/90 uppercase">Answers ({questionDetails._count?.answers ?? 0})</h5>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {questionDetails.answers?.length > 0 ? questionDetails.answers.map((a: any) => (
                          <div key={a.id} className="rounded-lg p-3 bg-gradient-to-br from-white/85 to-white/70 ring-1 ring-emerald-300/60 shadow-[0_12px_30px_-12px_rgba(6,182,212,0.3)]">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">{a.body}</p>
                                <div className="mt-1 flex items-center gap-3 text-[10px] text-gray-500">
                                  <span>By {a.author?.name || 'Unknown'}</span>
                                  <span>↑ {a.upvotes} • ↓ {a.downvotes}</span>
                                  <span>{new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                              </div>
                              <button onClick={() => deleteAnswer(a.id)} className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md" title="Delete Answer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )) : (
                          <p className="text-xs text-gray-500">No answers yet.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-emerald-200/60">
                  <button onClick={() => setShowQuestionModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium bg-white/75 border border-emerald-300/60 text-emerald-700 hover:bg-emerald-50/80">Close</button>
                </div>
              </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
