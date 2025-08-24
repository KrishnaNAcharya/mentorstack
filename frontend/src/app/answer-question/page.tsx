"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bold,
  Italic,
  Underline,
  Code,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Table,
  Quote,
  Minus,
  Type,
  Eye,
  Send,
  Lightbulb,
  Terminal,
  X,
} from "lucide-react";

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  votes: number;
  answers: number;
  createdAt: string;
}

interface Answer {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  votes: number;
  isAccepted: boolean;
}

const AnswerQuestionPage: React.FC = () => {
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);

  const searchParams = useSearchParams();
  const questionId = searchParams.get("id") || "1";

  // Mock questions data - in real app, this would come from API
  const questionsData: Record<string, Question> = {
    "1": {
      id: "1",
      title:
        "How to get Razorpay API test key without entering my bank details?",
      content: `I'm trying to integrate Razorpay payment gateway in my Flutter application for testing purposes. However, when I try to get the test API key from the Razorpay dashboard, it's asking me to enter my bank account details and complete KYC verification.

Is there a way to get test API keys without completing the full verification process? I just want to test the integration in my development environment.

What I've tried:
- Creating a Razorpay account
- Navigating to the API Keys section
- Looking for test/sandbox options

The system keeps redirecting me to complete bank verification before I can access any keys.`,
      author: "@username",
      tags: ["api", "testing", "flutter", "razorpay", "payment-gateway"],
      votes: 15,
      answers: 2,
      createdAt: "2 hours ago",
    },
    "2": {
      id: "2",
      title: "Vue 3, mapbox: create multiple mapboxes with v-for",
      content: `I'm working on a Vue 3 application where I need to display multiple Mapbox maps using v-for directive. Each map should show different data and be interactive.

I'm having trouble initializing multiple Mapbox instances properly. When I use v-for, only the first map renders correctly, and the others either don't show up or have rendering issues.

Here's what I'm trying to achieve:
- Display 3-4 maps in a grid layout
- Each map shows different geographical data
- All maps should be fully interactive

Current approach:
\`\`\`vue
<div v-for="location in locations" :key="location.id">
  <div :id="'map-' + location.id" class="map-container"></div>
</div>
\`\`\`

The maps either overlap or don't initialize properly. Any suggestions on the correct approach?`,
      author: "@username",
      tags: ["vue", "mapbox", "javascript"],
      votes: 8,
      answers: 1,
      createdAt: "1 hour ago",
    },
  };

  // Mock answers data
  const answersData: Record<string, Answer[]> = {
    "1": [
      {
        id: "1",
        content: `You don't need to complete KYC verification to get test API keys from Razorpay. Here's how you can get them:

**Step 1: Create Razorpay Account**
- Go to Razorpay Dashboard
- Sign up with your email

**Step 2: Access Test Mode**
- After login, you'll be in TEST mode by default
- Look for the toggle at the top that says "TEST MODE"

**Step 3: Generate Test Keys**
- Go to Settings → API Keys
- Click on "Generate Test Key"
- You'll get both Key ID and Key Secret

**Important Notes:**
- Test keys work without KYC verification
- You can process test transactions up to ₹100
- Use test card numbers provided in Razorpay docs

Here are some test card numbers you can use:
\`\`\`
4111 1111 1111 1111 (Visa)
5555 5555 5555 4444 (Mastercard)
\`\`\`

Hope this helps! Let me know if you face any issues.`,
        author: "@dev_expert",
        createdAt: "1 hour ago",
        votes: 12,
        isAccepted: true,
      },
      {
        id: "2",
        content: `Adding to the previous answer, here's a Flutter code example of how to implement Razorpay with test keys:

\`\`\`dart
import 'package:razorpay_flutter/razorpay_flutter.dart';

class PaymentService {
  late Razorpay _razorpay;

  void initializeRazorpay() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
  }

  void startPayment() {
    var options = {
      'key': 'rzp_test_your_test_key_here', // Your test key
      'amount': 10000, // Amount in paise (100.00 INR)
      'name': 'Test Payment',
      'description': 'Payment for testing',
      'prefill': {
        'contact': '9876543210',
        'email': 'test@example.com'
      }
    };
    
    try {
      _razorpay.open(options);
    } catch (e) {
      debugPrint('Error: \$e');
    }
  }
}
\`\`\`

Make sure you have the razorpay_flutter package added to your pubspec.yaml!`,
        author: "@flutter_dev",
        createdAt: "45 minutes ago",
        votes: 8,
        isAccepted: false,
      },
    ],
    "2": [
      {
        id: "1",
        content: `The issue you're facing is common when working with multiple Mapbox instances. Here's the correct approach:

**Solution: Use \`nextTick\` and unique container references**

\`\`\`vue
<template>
  <div class="maps-grid">
    <div 
      v-for="location in locations" 
      :key="location.id"
      class="map-container"
    >
      <div 
        :ref="'mapContainer' + location.id"
        :id="'map-' + location.id" 
        class="map-box"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import mapboxgl from 'mapbox-gl'

const locations = ref([
  { id: 1, lng: -70.9, lat: 42.35, name: 'Boston' },
  { id: 2, lng: -74.006, lat: 40.7128, name: 'New York' },
  { id: 3, lng: -118.2437, lat: 34.0522, name: 'Los Angeles' }
])

const maps = ref({})

onMounted(async () => {
  await nextTick()
  
  locations.value.forEach(location => {
    const map = new mapboxgl.Map({
      container: \`map-\${location.id}\`,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [location.lng, location.lat],
      zoom: 10
    })
    
    maps.value[location.id] = map
  })
})
\`\`\`

**Key Points:**
1. Use \`nextTick()\` to ensure DOM elements are rendered
2. Store map instances in a reactive object
3. Each map needs a unique container ID
4. Initialize maps after the component is mounted`,
        author: "@vue_master",
        createdAt: "30 minutes ago",
        votes: 5,
        isAccepted: false,
      },
    ],
  };

  useEffect(() => {
    // Load question data based on ID
    const questionData = questionsData[questionId];
    if (questionData) {
      setQuestion(questionData);
      setAnswers(answersData[questionId] || []);
    }
  }, [questionId]);

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

  const insertImage = () => {
    const imageUrl = prompt("Enter image URL:");
    if (imageUrl) {
      insertAtCursor("![", `](${imageUrl})`, "alt text");
    }
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
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "c",
    "csharp",
    "html",
    "css",
    "php",
    "ruby",
    "go",
    "rust",
    "kotlin",
    "swift",
    "sql",
    "json",
    "xml",
    "yaml",
    "bash",
    "powershell",
    "dart",
    "vue",
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
        .filter((cell) => cell.trim())
        .map(
          (cell) =>
            `<th class="px-4 py-2 bg-gray-100 font-semibold text-left border border-gray-300">${cell.trim()}</th>`
        )
        .join("");

      const rowsHtml = rows
        .split("\n")
        .filter((row) => row.trim())
        .map((row) => {
          const cells = row
            .split("|")
            .filter((cell) => cell.trim())
            .map(
              (cell) =>
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

    // Handle unordered lists (convert to proper <ul><li> structure)
    const unorderedListRegex = /^(\s*)- (.+)$/gm;
    let listItems = [];
    let inList = false;

    html = html.replace(/^- (.+)$/gm, (match, item) => {
      if (!inList) {
        inList = true;
        return `<ul class="list-disc ml-6 my-2"><li class="mb-1">${item}</li>`;
      }
      return `<li class="mb-1">${item}</li>`;
    });

    // Close unordered lists
    html = html.replace(/(<li class="mb-1">.*?<\/li>)(?!\s*<li)/g, "$1</ul>");

    // Handle ordered lists
    html = html.replace(
      /^(\d+)\. (.+)$/gm,
      (match, num, item, offset, string) => {
        const prevMatch = string.slice(0, offset).match(/^(\d+)\. (.+)$/gm);
        const nextMatch = string
          .slice(offset + match.length)
          .match(/^(\d+)\. (.+)$/m);

        let result = "";
        if (
          !prevMatch ||
          prevMatch.length === 0 ||
          !prevMatch[prevMatch.length - 1].match(/^\d+\./)
        ) {
          result += '<ol class="list-decimal ml-6 my-2">';
        }
        result += `<li class="mb-1">${item}</li>`;
        if (!nextMatch) {
          result += "</ol>";
        }
        return result;
      }
    );

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
      '<a href="$2" class="text-blue-600 hover:text-blue-800 hover:underline font-medium" target="_blank">$1</a>'
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

  const handleSubmit = async () => {
    if (answerContent.trim().length < 20) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Answer submitted:", answerContent);
    setAnswerContent("");
    setIsSubmitting(false);
  };

  const canSubmit = answerContent.trim().length >= 20;

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-light via-neutral to-surface-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-tertiary mb-4">
            Question not found
          </h2>
          <Link href="/home">
            <button className="bg-primary text-white px-6 py-2 rounded-lg">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-light via-neutral to-surface-light">
      <style jsx>{`
        .floating-card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .input-field {
          transition: all 0.3s ease;
          border: 2px solid transparent;
          background: rgba(255, 255, 255, 0.8);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .input-field:focus {
          background: rgba(255, 255, 255, 1);
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .answer-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .answer-card:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }

        .accepted-answer {
          border-left: 4px solid #10b981;
          background: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.05) 0%,
            rgba(255, 255, 255, 0.9) 100%
          );
        }

        .vote-button {
          transition: all 0.2s ease;
        }

        .vote-button:hover {
          transform: scale(1.1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .code-block {
          background: #1a1a1a;
          color: #f8f8f2;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          font-family: "Fira Code", "Consolas", monospace;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .shadow-primary {
          box-shadow: 0 10px 25px -5px var(--color-primary-light),
            0 4px 6px -2px var(--color-primary-light);
        }
      `}</style>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Back Button */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center mb-6">
            <Link
              href="/questions"
              className="flex items-center text-xl text-gray-600 hover:text-primary transition-colors group mr-6"
            >
              <svg
                className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </div>

          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-full mb-4 shadow-primary">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-tertiary mb-2">
            Help solve this question
          </h1>
          <p className="text-lg text-gray-600">
            Share your knowledge and help the community
          </p>
        </div>

        {/* Question Card */}
        <div className="floating-card rounded-2xl p-8 mb-8 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-tertiary mb-4 leading-tight">
                {question.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {question.author}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {question.createdAt}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  {question.answers} answers
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center ml-6">
              <button className="vote-button p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <span className="text-xl font-bold text-tertiary py-2">
                {question.votes}
              </span>
              <button className="vote-button p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700 mb-6">
            <div className="whitespace-pre-line">{question.content}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Existing Answers */}
        {answers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-tertiary mb-6 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                />
              </svg>
              {answers.length} Answer{answers.length !== 1 ? "s" : ""}
            </h3>

            <div className="space-y-6">
              {answers.map((answer) => (
                <div
                  key={answer.id}
                  className={`answer-card rounded-2xl p-6 ${
                    answer.isAccepted ? "accepted-answer" : ""
                  } animate-fade-in`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {answer.isAccepted && (
                        <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Accepted Answer
                        </div>
                      )}
                      <span className="text-sm text-gray-500">
                        {answer.author}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {answer.createdAt}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <button className="vote-button p-1 rounded hover:bg-gray-100">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <span className="text-lg font-semibold text-tertiary py-1">
                        {answer.votes}
                      </span>
                      <button className="vote-button p-1 rounded hover:bg-gray-100">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="prose max-w-none text-gray-700">
                    <div className="whitespace-pre-line">{answer.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rich Text Answer Form */}
        <div className="floating-card rounded-2xl p-8 animate-fade-in">
          <h3 className="text-2xl font-bold text-tertiary mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Your Answer
          </h3>

          <div className="space-y-6">
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
                  onClick={insertImage}
                  icon={<Image size={18} />}
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
                      <Terminal className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-bold text-tertiary">
                        Code Editor
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowCodeEditor(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                          className="w-full h-80 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder={`// Write your ${selectedLanguage} code here...`}
                          style={{
                            lineHeight: "1.5",
                            tabSize: "2",
                          }}
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
                              ? "bg-primary text-white hover:bg-primary-dark shadow-primary"
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
                  className="input-field w-full h-64 p-4 rounded-xl resize-none focus:outline-none break-words font-mono text-sm"
                  placeholder="Write your answer here... Be specific and provide examples when possible. You can use Markdown for formatting."
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
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
                        ? "text-primary"
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
              <div className="min-h-64 p-4 bg-gray-50 rounded-xl overflow-hidden">
                {answerContent.trim() ? (
                  <div className="prose max-w-none">
                    <div
                      className="whitespace-pre-wrap break-words text-gray-700"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
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
            <div className="glassmorphism rounded-xl p-6">
              <h4 className="font-semibold text-tertiary mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                Formatting Tips
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
                  <p>
                    <code className="bg-gray-100 px-1 rounded">```code```</code>{" "}
                    → code block
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Keyboard shortcuts:</strong> Ctrl/Cmd + B (bold),
                  Ctrl/Cmd + I (italic), Ctrl/Cmd + K (link)
                  <br />
                  <strong>Code Editor:</strong> Click the{" "}
                  <Terminal className="w-3 h-3 inline mx-1" /> icon for syntax
                  highlighting and better code formatting
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all ${
                  canSubmit && !isSubmitting
                    ? "bg-primary text-white hover:bg-primary-dark shadow-primary"
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
  );
};

export default AnswerQuestionPage;
