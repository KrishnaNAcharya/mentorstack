'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { authAPI, Question } from '@/lib/auth-api';
import {
  Bold,
  Italic,
  Code,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Minus,
  Type,
  Image as ImageIcon,
  Table,
  Terminal,
  X,
  Send,
  Lightbulb,
} from "lucide-react";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = parseInt(params.id as string);
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);

  // Summarize feature state
  const [summary, setSummary] = useState("");
  const [summarizeLoading, setSummarizeLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const loadQuestion = async () => {
      if (!questionId) return;
      
      try {
        const questionData = await authAPI.getQuestion(questionId);
        setQuestion(questionData);
      } catch (error) {
        console.error('Error loading question:', error);
        router.push('/questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [questionId, router]);

  const handleSummarizeAnswers = async () => {
    if (!question?.answers || question.answers.length === 0) return;
    setSummarizeLoading(true);
    setShowSummary(false);
    setSummary("");
    try {
      const answers = question.answers.map(a => a.content);
      const res = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Failed to fetch summary");
      const data = await res.json();
      setSummary(data.summary);
      setShowSummary(true);
    } catch (err) {
      setSummary("Error generating summary.");
      setShowSummary(true);
    } finally {
      setSummarizeLoading(false);
    }
  };

  // Rich text formatting functions
  const insertAtCursor = useCallback(
    (before: string, after: string = "", placeholder: string = "") => {
      const textarea = editorRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = answerContent.substring(start, end);
      const textToInsert = selectedText || placeholder;

      const newText =
        answerContent.substring(0, start) +
        before +
        textToInsert +
        after +
        answerContent.substring(end);

      setAnswerContent(newText);

      // Set cursor position after insertion
      setTimeout(() => {
        const newCursorPos = start + before.length + textToInsert.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    },
    [answerContent]
  );

  const formatBold = () => insertAtCursor("**", "**", "bold text");
  const formatItalic = () => insertAtCursor("*", "*", "italic text");
  const formatCode = () => insertAtCursor("`", "`", "code");
  const formatCodeBlock = () => insertAtCursor("```\n", "\n```", "code block");
  const formatLink = () => insertAtCursor("[", "](url)", "link text");
  const formatUnorderedList = () => insertAtCursor("- ", "", "list item");
  const formatOrderedList = () => insertAtCursor("1. ", "", "list item");
  const formatQuote = () => insertAtCursor("> ", "", "quote");
  const formatHeading = () => insertAtCursor("## ", "", "heading");
  const formatDivider = () => insertAtCursor("\n---\n", "", "");

  const insertImage = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    const imageName = file.name.split('.')[0];
    insertAtCursor(`\n![${imageName}](${imageUrl})\n`);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        insertImage(file);
      }
    };
    input.click();
  };

  const insertTable = () => {
    const tableMarkdown = `
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`;
    insertAtCursor(tableMarkdown, "");
  };

  const openCodeEditor = () => {
    setShowCodeEditor(true);
    setCodeContent("");
  };

  const insertCode = () => {
    if (codeContent.trim()) {
      const codeBlock = `\`\`\`${selectedLanguage}\n${codeContent}\n\`\`\`\n\n`;
      insertAtCursor(codeBlock, "");
      setShowCodeEditor(false);
      setCodeContent("");
    }
  };

  const programmingLanguages = [
    "javascript", "typescript", "python", "java", "cpp", "c", "csharp",
    "html", "css", "php", "ruby", "go", "rust", "kotlin", "swift",
    "sql", "json", "xml", "yaml", "bash", "powershell", "dart", "vue",
  ];

  // Toolbar button component
  const ToolbarButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    disabled?: boolean;
  }> = ({ onClick, icon, title, disabled = false }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon}
    </button>
  );

  // Preview renderer (enhanced markdown-like rendering)
  const renderPreview = (content: string) => {
    let html = content;

    // Handle code blocks first (before other processing)
    html = html.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>'
    );

    // Handle tables
    const tableRegex =
      /(\|.*\|[\r\n]+)(\|[\s\-\|:]+\|[\r\n]+)((?:\|.*\|(?:[\r\n]+|$))*)/g;
    html = html.replace(tableRegex, (match, header, separator, rows) => {
      const headerCells = header
        .split("|")
        .filter((cell: string) => cell.trim())
        .map(
          (cell: string) =>
            `<th class="px-4 py-2 bg-gray-100 font-semibold text-left border border-gray-300">${cell.trim()}</th>`
        )
        .join("");

      const rowsHtml = rows
        .split("\n")
        .filter((row: string) => row.trim())
        .map((row: string) => {
          const cells = row
            .split("|")
            .filter((cell: string) => cell.trim())
            .map(
              (cell: string) =>
                `<td class="px-4 py-2 border border-gray-300">${cell.trim()}</td>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

      return `<table class="w-full border-collapse border border-gray-300 my-4">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>`;
    });
    
    // Handle unordered lists
    html = html.replace(/^- (.+)$/gm, (match, item) => {
      return `<li class="mb-1 list-disc ml-6">${item}</li>`;
    });

    // Handle ordered lists
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="mb-1 list-decimal ml-6">$2</li>');

    // Basic formatting
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>'
    );

    // Headings
    html = html.replace(
      /^## (.*$)/gm,
      '<h2 class="text-xl font-bold my-4 text-gray-800">$1</h2>'
    );
    html = html.replace(
      /^### (.*$)/gm,
      '<h3 class="text-lg font-semibold my-3 text-gray-800">$1</h3>'
    );

    // Blockquotes
    html = html.replace(
      /^> (.*$)/gm,
      '<blockquote class="border-l-4 border-blue-400 pl-4 py-2 my-3 bg-blue-50 italic text-gray-700">$1</blockquote>'
    );

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-primary hover:text-primary-light-100 hover:underline font-medium" target="_blank">$1</a>'
    );

    // Images
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg shadow-sm" />'
    );

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="border-gray-300 my-6" />');

    // Convert line breaks (but not inside pre tags)
    html = html.replace(/\n(?![^<]*<\/pre>)/g, "<br />");

    return html;
  };

  const handleSubmitAnswer = async () => {
    if (answerContent.trim().length < 20) return;

    setIsSubmitting(true);
    try {
      // Call the API to submit the answer
      await authAPI.submitAnswer(questionId, answerContent.trim());
      
      // Reload question to show the new answer
      const questionData = await authAPI.getQuestion(questionId);
      setQuestion(questionData);
      
      // Clear the form
      setAnswerContent("");
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = answerContent.trim().length >= 20;

  const goBackToQuestions = () => {
    router.push('/questions');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading question...</div>
        </div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Question not found</div>
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
            onClick={goBackToQuestions}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Questions
          </button>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="flex items-start gap-6">
              {/* Question Content */}
              <div className="flex-1">
                {/* Question Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{question.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Asked by {question.authorName}</span>
                    <span>•</span>
                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Question Body */}
                {question.description && (
                  <div className="prose prose-gray max-w-none mb-6">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                      {question.description}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex gap-2 mb-6">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Answers Section */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {question.answers?.length || 0} Answer{(question.answers?.length || 0) !== 1 ? 's' : ''}
                </h2>
                {question.answers && question.answers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSummarizeAnswers}
                    disabled={summarizeLoading}
                    className="bg-primary-light hover:bg-primary-light-100 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:bg-indigo-300"
                  >
                    {summarizeLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="bg-primary" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Summarize Answers
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Summary Card */}
              {showSummary && summary && (
                <div className="bg-secondary-light-100 border border-primary rounded-xl p-6 mb-8 animate-fade-in">
                  <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Summary
                  </h3>
                  <div className="text-primary-100 leading-relaxed whitespace-pre-line text-base">
                    {summary}
                  </div>
                </div>
              )}

              {question.answers && question.answers.length > 0 ? (
                <div className="space-y-6">
                  {question.answers.map((answer) => (
                    <div key={answer.id} className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-start gap-4">
                        {/* Answer Content */}
                        <div className="flex-1">
                          <div className="mb-4">
                            <div className="text-sm text-gray-500 mb-2">
                              Answered by {answer.authorName} on {new Date(answer.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {answer.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No answers yet</h3>
                  <p className="text-gray-500 mb-6">Be the first to help solve this question!</p>
                </div>
              )}

              {/* Rich Text Answer Form */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>

                <div className="space-y-4">
                  {/* Editor Tabs */}
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setShowPreview(false)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        !showPreview
                          ? "bg-white text-primary shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Write
                    </button>
                    <button
                      onClick={() => setShowPreview(true)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        showPreview
                          ? "bg-white text-primary shadow-sm"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      Preview
                    </button>
                  </div>

                  {/* Rich Text Toolbar */}
                  {!showPreview && (
                    <div className="flex flex-wrap gap-1 p-3 bg-gray-50 rounded-lg border">
                      <ToolbarButton
                        onClick={formatBold}
                        icon={<Bold size={18} />}
                        title="Bold (Ctrl+B)"
                      />
                      <ToolbarButton
                        onClick={formatItalic}
                        icon={<Italic size={18} />}
                        title="Italic (Ctrl+I)"
                      />
                      <ToolbarButton
                        onClick={formatCode}
                        icon={<Code size={18} />}
                        title="Inline Code"
                      />

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      <ToolbarButton
                        onClick={formatLink}
                        icon={<LinkIcon size={18} />}
                        title="Insert Link"
                      />
                      <ToolbarButton
                        onClick={formatUnorderedList}
                        icon={<List size={18} />}
                        title="Bullet List"
                      />
                      <ToolbarButton
                        onClick={formatOrderedList}
                        icon={<ListOrdered size={18} />}
                        title="Numbered List"
                      />

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      <ToolbarButton
                        onClick={formatQuote}
                        icon={<Quote size={18} />}
                        title="Quote"
                      />
                      <ToolbarButton
                        onClick={formatCodeBlock}
                        icon={<Code size={18} />}
                        title="Code Block"
                      />
                      <ToolbarButton
                        onClick={openCodeEditor}
                        icon={<Terminal size={18} />}
                        title="Code Editor"
                      />
                      <ToolbarButton
                        onClick={handleImageUpload}
                        icon={<ImageIcon size={18} />}
                        title="Insert Image"
                      />
                      <ToolbarButton
                        onClick={insertTable}
                        icon={<Table size={18} />}
                        title="Insert Table"
                      />

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      <ToolbarButton
                        onClick={formatHeading}
                        icon={<Type size={18} />}
                        title="Heading"
                      />
                      <ToolbarButton
                        onClick={formatDivider}
                        icon={<Minus size={18} />}
                        title="Horizontal Rule"
                      />
                    </div>
                  )}

                  {/* Code Editor Modal */}
                  {showCodeEditor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            <Terminal className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-bold text-gray-900">
                              Code Editor
                            </h3>
                          </div>
                          <button
                            onClick={() => setShowCodeEditor(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Close code editor"
                            aria-label="Close code editor"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <div className="p-6">
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Programming Language
                            </label>
                            <select
                              value={selectedLanguage}
                              onChange={(e) => setSelectedLanguage(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                              title="Select programming language"
                              aria-label="Select programming language"
                            >
                              {programmingLanguages.map((lang) => (
                                <option key={lang} value={lang}>
                                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Code
                            </label>
                            <div className="relative">
                              <textarea
                                ref={codeEditorRef}
                                value={codeContent}
                                onChange={(e) => setCodeContent(e.target.value)}
                                className="w-full h-80 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                                placeholder={`// Write your ${selectedLanguage} code here...`}
                                onKeyDown={(e) => {
                                  if (e.key === "Tab") {
                                    e.preventDefault();
                                    const start = e.currentTarget.selectionStart;
                                    const end = e.currentTarget.selectionEnd;
                                    const newValue =
                                      codeContent.substring(0, start) +
                                      "  " +
                                      codeContent.substring(end);
                                    setCodeContent(newValue);
                                    setTimeout(() => {
                                      e.currentTarget.setSelectionRange(
                                        start + 2,
                                        start + 2
                                      );
                                    }, 0);
                                  }
                                }}
                              />
                              <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                {selectedLanguage}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
                                Tab
                              </kbd>{" "}
                              to indent
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => setShowCodeEditor(false)}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={insertCode}
                                disabled={!codeContent.trim()}
                                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                  codeContent.trim()
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                Insert Code
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Editor */}
                  {!showPreview ? (
                    <div className="space-y-4">
                      <textarea
                        ref={editorRef}
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder="Write your answer here... Be specific and provide examples when possible. You can use Markdown for formatting."
                        onKeyDown={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            switch (e.key) {
                              case "b":
                                e.preventDefault();
                                formatBold();
                                break;
                              case "i":
                                e.preventDefault();
                                formatItalic();
                                break;
                              case "k":
                                e.preventDefault();
                                formatLink();
                                break;
                            }
                          }
                        }}
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={`${
                            answerContent.length >= 20
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        >
                          {answerContent.length >= 20
                            ? "✓ Good length"
                            : `${20 - answerContent.length} more characters needed`}
                        </span>
                        <span className="text-gray-400">
                          {answerContent.length} characters
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-64 p-4 bg-gray-50 rounded-lg overflow-hidden">
                      {answerContent.trim() ? (
                        <div className="prose max-w-none">
                          <div
                            className="whitespace-pre-wrap break-words text-gray-700"
                            dangerouslySetInnerHTML={{
                              __html: renderPreview(answerContent),
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">
                          Nothing to preview yet...
                        </p>
                      )}
                    </div>
                  )}

                  {/* Formatting Tips */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                      Formatting Tips
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div>
                        <p>
                          <code className="bg-gray-100 px-1 rounded">**bold**</code> →{" "}
                          <strong>bold</strong>
                        </p>
                        <p>
                          <code className="bg-gray-100 px-1 rounded">*italic*</code> →{" "}
                          <em>italic</em>
                        </p>
                        <p>
                          <code className="bg-gray-100 px-1 rounded">`code`</code> →{" "}
                          <code className="bg-gray-100 px-1 rounded">code</code>
                        </p>
                      </div>
                      <div>
                        <p>
                          <code className="bg-gray-100 px-1 rounded">
                            - list item
                          </code>{" "}
                          → • list item
                        </p>
                        <p>
                          <code className="bg-gray-100 px-1 rounded">
                            [link](url)
                          </code>{" "}
                          → link
                        </p>
                        <p>
                          <code className="bg-gray-100 px-1 rounded">## heading</code>{" "}
                          → <strong>heading</strong>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-gray-500">
                        <strong>Keyboard shortcuts:</strong> Ctrl/Cmd + B (bold),
                        Ctrl/Cmd + I (italic), Ctrl/Cmd + K (link)
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!canSubmit || isSubmitting}
                      className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                        canSubmit && !isSubmitting
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Posting...
                        </>
                      ) : (
                        <>
                          Post Your Answer
                          <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
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
