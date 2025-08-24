"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { authAPI } from '@/lib/auth-api';

const QuestionForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        if (userData.user.role !== 'mentee') {
          router.push('/home');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  const predefinedTags = ['node.js', 'express', 'authentication', 'typescript', 'api', 'react', 'database', 'frontend', 'backend', 'javascript', 'python', 'java', 'css', 'html'];
  const recommendedTags = ['api', 'security', 'jwt'];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim()) && !predefinedTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return title.trim().length > 10;
      case 2: return description.trim().length >= 20 && expectedOutcome.trim().length >= 20;
      case 3: return selectedTags.length > 0;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // For now, we'll use a mock submission since the questions API needs fixing
      // TODO: Implement actual API call when questions endpoint is fixed
      console.log('Submitting question:', { 
        title, 
        body: `${description}\n\nWhat I've tried:\n${expectedOutcome}`, 
        tags: selectedTags 
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to mentee home page after successful submission
      router.push('/mentee-home');
    } catch (err) {
      console.error('Failed to submit question:', err);
      setError('Failed to submit question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    "Title",
    "Details",
    "Tags"
  ];

  const stepSubtitles = [
    "Start with a clear, specific title that summarizes your problem",
    "Help others understand your situation with context and what you've tried",
    "Choose tags to help the right experts find your question"
  ];

  return (
    <Layout>
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6 shadow-primary">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-tertiary mb-3">Ask Your Question</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get help from our community of developers and experts</p>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`progress-dot w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    step <= currentStep ? 'bg-primary active' : 'bg-gray-300'
                  }`}>
                    {step < currentStep ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`font-semibold ${step <= currentStep ? 'text-primary' : 'text-gray-500'}`}>
                      Step {step}
                    </div>
                    <div className={`text-sm ${step <= currentStep ? 'text-gray-700' : 'text-gray-400'}`}>
                      {stepTitles[step - 1].split(' ').slice(0, 2).join(' ')}
                    </div>
                  </div>
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-4 rounded-full transition-all duration-500 ${
                    step < currentStep ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="floating-card rounded-3xl p-8 md:p-12 animate-fade-in">
          {/* Step Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-tertiary mb-3">{stepTitles[currentStep - 1]}</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">{stepSubtitles[currentStep - 1]}</p>
          </div>

          {/* Step 1 - Question Title */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-tertiary">
                  What&apos;s your question about?
                </label>
                <input
                  type="text"
                  placeholder="e.g., How do I implement JWT authentication in Node.js?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field w-full p-4 text-lg rounded-xl focus:outline-none"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={`${title.length >= 10 ? 'text-primary' : 'text-gray-400'}`}>
                    {title.length >= 10 ? '✓ Good length' : `${10 - title.length} more characters needed`}
                  </span>
                  <span className="text-gray-400">{title.length}/100</span>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="glassmorphism rounded-2xl p-6">
                <h3 className="font-semibold text-tertiary mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Quick Tips
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Be specific about what you&apos;re trying to achieve
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Include relevant technologies (React, Node.js, etc.)
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Avoid yes/no questions - ask for explanations
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2 - Details */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid md:grid-rows-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-tertiary">
                    Describe your problem
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field w-full h-52 p-4 rounded-xl resize-none focus:outline-none"
                    placeholder="Explain the context, what you're building, and what specific issue you're facing..."
                  />
                  <div className={`text-sm ${description.length >= 20 ? 'text-primary' : 'text-gray-400'}`}>
                    {description.length >= 20 ? '✓ Great detail' : `${20 - description.length} more characters needed`}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-tertiary">
                    What have you tried?
                  </label>
                  <textarea
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                    className="input-field w-full h-52 p-4 rounded-xl resize-none focus:outline-none"
                    placeholder="Share your attempts, what you expected to happen, and what actually occurred..."
                  />
                  <div className={`text-sm ${expectedOutcome.length >= 20 ? 'text-primary' : 'text-gray-400'}`}>
                    {expectedOutcome.length >= 20 ? '✓ Good context' : `${20 - expectedOutcome.length} more characters needed`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Tags */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in">
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-tertiary">Selected Tags</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-primary-dark transition-colors"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Tag */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-tertiary">Add a custom tag</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomTag();
                      }
                    }}
                    className="input-field flex-1 p-3 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Popular Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-tertiary">Popular Tags</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {predefinedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`tag-button p-3 rounded-xl text-sm font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended Tags */}
              <div className="glassmorphism rounded-2xl p-6">
                <h4 className="font-semibold text-tertiary mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Recommended for your question
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-white text-primary border border-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-primary hover:bg-primary hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <div className="flex items-center space-x-3">
              {currentStep < 3 && (
                <span className="text-sm text-gray-500">
                  Step {currentStep} of 3
                </span>
              )}
              <button
                type="button"
                onClick={currentStep === 3 ? handleSubmit : () => setCurrentStep(prev => Math.min(3, prev + 1))}
                disabled={!canProceed() || loading}
                className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all ${
                  canProceed() && !loading
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-primary'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Submitting...' : (currentStep === 3 ? 'Post Question' : 'Continue')}
                {!loading && (
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default QuestionForm;