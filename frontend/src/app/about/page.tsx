"use client";

import Layout from "../../components/Layout";

export default function AboutPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-emerald-500">MentorStack</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connecting aspiring developers with experienced mentors to accelerate learning, 
              share knowledge, and build meaningful professional relationships in the tech community.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  We believe that learning is most effective when it&apos;s collaborative and guided. 
                  MentorStack bridges the gap between experienced developers and those just starting 
                  their journey, creating a supportive ecosystem where knowledge flows freely.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Our platform empowers mentees to ask questions, seek guidance, and connect with 
                  mentors who can provide personalized advice based on real-world experience.
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold mb-4">Accelerate Your Growth</h3>
                  <p className="text-emerald-100">
                    Join thousands of developers who are learning, growing, and succeeding together.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Q&A Platform */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Q&A Platform</h3>
                <p className="text-gray-600">
                  Ask technical questions and get detailed answers from experienced developers 
                  who&apos;ve faced similar challenges.
                </p>
              </div>

              {/* Mentorship Matching */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Mentorship Matching</h3>
                <p className="text-gray-600">
                  Connect with mentors who specialize in your areas of interest and can guide 
                  your learning journey.
                </p>
              </div>

              {/* Community Building */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Building</h3>
                <p className="text-gray-600">
                  Join specialized communities based on technologies, frameworks, and career paths 
                  that interest you.
                </p>
              </div>

              {/* Knowledge Sharing */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Knowledge Sharing</h3>
                <p className="text-gray-600">
                  Share your expertise through articles, tutorials, and by answering questions 
                  from fellow developers.
                </p>
              </div>

              {/* Career Guidance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Career Guidance</h3>
                <p className="text-gray-600">
                  Get advice on career paths, interview preparation, and professional development 
                  from industry veterans.
                </p>
              </div>

              {/* Skill Development */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Skill Development</h3>
                <p className="text-gray-600">
                  Access curated learning resources, coding challenges, and project ideas to 
                  enhance your technical skills.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-8 mb-16 text-white">
            <h2 className="text-3xl font-bold text-center mb-12">Our Growing Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-emerald-100">Active Developers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50K+</div>
                <div className="text-emerald-100">Questions Answered</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5K+</div>
                <div className="text-emerald-100">Mentorship Connections</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100+</div>
                <div className="text-emerald-100">Communities</div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Collaboration</h3>
                <p className="text-gray-600">
                  We believe in the power of working together and learning from each other&apos;s experiences.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
                <p className="text-gray-600">
                  We encourage creative thinking and innovative solutions to complex problems.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Growth</h3>
                <p className="text-gray-600">
                  We foster an environment where continuous learning and personal development thrive.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Community?</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Whether you&apos;re looking to learn, teach, or connect with like-minded developers, 
              MentorStack is here to support your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                Get Started as Mentee
              </button>
              <button className="px-8 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Become a Mentor
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
