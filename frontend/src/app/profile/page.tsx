"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "../../components/Layout";
import { authAPI, MenteeProfile, MentorProfile } from "@/lib/auth-api";

export default function ProfilePage() {
  const [menteeProfile, setMenteeProfile] = useState<MenteeProfile | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [userRole, setUserRole] = useState<'mentor' | 'mentee' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("My Questions");
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
          setActiveTab("My Answers");
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
          location: mentorProfile.location
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
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!menteeProfile && !mentorProfile) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Profile not found</div>
        </div>
      </Layout>
    );
  }

  const profile = menteeProfile || mentorProfile;
  if (!profile) return null;

  return (
    <Layout>
      <div className="flex flex-1 p-8 gap-8 overflow-auto">
        {/* Main Profile Content */}
        <div className="flex-1">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className="flex items-start gap-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-3xl font-bold">
                  {profile.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-slate-800">{profile.name}</h1>
                  <span className="text-slate-500">User{profile.id}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userRole === 'mentor' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {userRole === 'mentor' ? 'Mentor' : 'Mentee'}
                  </span>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="ml-auto p-2 text-slate-500 hover:text-slate-700 transition"
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
                  <div className="space-y-4">
                    <textarea
                      value={profile.bio}
                      onChange={(e) => {
                        if (menteeProfile) {
                          setMenteeProfile({...menteeProfile, bio: e.target.value});
                        } else if (mentorProfile) {
                          setMentorProfile({...mentorProfile, bio: e.target.value});
                        }
                      }}
                      className="w-full p-3 border border-slate-300 rounded-lg text-slate-600 resize-none"
                      rows={2}
                      placeholder="Write a short description about yourself"
                    />
                    {userRole === 'mentor' && mentorProfile && (
                      <input
                        type="text"
                        value={mentorProfile.location || ''}
                        onChange={(e) => setMentorProfile({...mentorProfile, location: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg text-slate-600"
                        placeholder="Location (optional)"
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-600 mb-4">{profile.bio}</p>
                    {userRole === 'mentor' && mentorProfile?.location && (
                      <p className="text-slate-500 text-sm">📍 {mentorProfile.location}</p>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  {userRole === 'mentee' && (
                    <Link href="/ask-question">
                      <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition">
                        Ask
                      </button>
                    </Link>
                  )}
                  {userRole === 'mentor' && (
                    <Link href="/create-article">
                      <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition">
                        Write Article
                      </button>
                    </Link>
                  )}
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition">
                    Create a Blog
                  </button>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                  {isEditing && (
                    <button 
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            {/* Tab Navigation */}
            <div className="border-b border-slate-200 px-6">
              <div className="flex gap-8">
                {userRole === 'mentee' ? (
                  ["My Questions", "Posts", "Answered", "Bookmarked", "Mentees"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 font-medium border-b-2 transition ${
                        activeTab === tab
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))
                ) : (
                  ["My Answers", "Articles", "Mentees", "Requests"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 font-medium border-b-2 transition ${
                        activeTab === tab
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Mentee Tabs */}
              {userRole === 'mentee' && menteeProfile && (
                <>
                  {activeTab === "My Questions" && (
                    <div>
                      {menteeProfile.questions.length > 0 ? (
                        <div className="space-y-4">
                          {menteeProfile.questions.map((question) => (
                            <div key={question.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                              <h4 className="font-semibold text-slate-800 mb-2">{question.title}</h4>
                              {question.description && (
                                <p className="text-slate-600 text-sm mb-3">{question.description}</p>
                              )}
                              <div className="flex gap-2 mb-2">
                                {question.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(question.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">❓</span>
                          </div>
                          <h3 className="text-xl font-semibold text-slate-700 mb-2">No questions yet</h3>
                          <p className="text-slate-500 mb-6">Start your learning journey by asking your first question.</p>
                          <Link href="/ask-question">
                            <button className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition">
                              Ask Your First Question
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab !== "My Questions" && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📝</span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">No {activeTab.toLowerCase()} yet</h3>
                      <p className="text-slate-500">This section will show your {activeTab.toLowerCase()}.</p>
                    </div>
                  )}
                </>
              )}

              {/* Mentor Tabs */}
              {userRole === 'mentor' && mentorProfile && (
                <>
                  {activeTab === "My Answers" && (
                    <div>
                      {mentorProfile.answers.length > 0 ? (
                        <div className="space-y-4">
                          {mentorProfile.answers.map((answer) => (
                            <div key={answer.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                              <h4 className="font-semibold text-slate-800 mb-2">
                                Re: {answer.question.title}
                              </h4>
                              <p className="text-slate-600 text-sm mb-3 line-clamp-3">{answer.content}</p>
                              <div className="text-xs text-slate-500">
                                Answered on {new Date(answer.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">💬</span>
                          </div>
                          <h3 className="text-xl font-semibold text-slate-700 mb-2">No answers yet</h3>
                          <p className="text-slate-500">Start helping others by answering questions.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "Articles" && (
                    <div>
                      {mentorProfile.articles.length > 0 ? (
                        <div className="space-y-4">
                          {mentorProfile.articles.map((article) => (
                            <div key={article.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                              <h4 className="font-semibold text-slate-800 mb-2">{article.title}</h4>
                              <p className="text-slate-600 text-sm mb-3 line-clamp-2">{article.content}</p>
                              <div className="text-xs text-slate-500">
                                Published on {new Date(article.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📄</span>
                          </div>
                          <h3 className="text-xl font-semibold text-slate-700 mb-2">No articles yet</h3>
                          <p className="text-slate-500 mb-6">Share your knowledge by writing your first article.</p>
                          <Link href="/create-article">
                            <button className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition">
                              Write Your First Article
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "Mentees" && (
                    <div>
                      {mentorProfile.connections.length > 0 ? (
                        <div className="space-y-4">
                          {mentorProfile.connections.map((connection) => (
                            <div key={connection.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                              <h4 className="font-semibold text-slate-800 mb-2">{connection.mentee.name}</h4>
                              <p className="text-slate-500 text-sm">
                                Connected on {new Date(connection.acceptedAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">👥</span>
                          </div>
                          <h3 className="text-xl font-semibold text-slate-700 mb-2">No mentees yet</h3>
                          <p className="text-slate-500">Accept mentorship requests to start mentoring.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "Requests" && (
                    <div>
                      {mentorProfile.mentorshipRequests.length > 0 ? (
                        <div className="space-y-4">
                          {mentorProfile.mentorshipRequests.map((request) => (
                            <div key={request.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                              <h4 className="font-semibold text-slate-800 mb-2">{request.mentee.name}</h4>
                              {request.requestMessage && (
                                <p className="text-slate-600 text-sm mb-3">{request.requestMessage}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  request.status === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : request.status === 'accepted'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {request.status}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📨</span>
                          </div>
                          <h3 className="text-xl font-semibold text-slate-700 mb-2">No requests yet</h3>
                          <p className="text-slate-500">Mentorship requests will appear here.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 flex flex-col gap-6">
          {/* Personal Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                <p className="text-slate-800">{profile.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Joined</label>
                <p className="text-slate-800">{new Date(profile.joinedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Reputation</label>
                <p className="text-slate-800">{profile.reputation}</p>
              </div>
            </div>
          </div>

          {/* Skills/Knows About */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Knows about</h3>
            
            {isEditing ? (
              <div className="space-y-2">
                {(userRole === 'mentee' ? menteeProfile?.skills : mentorProfile?.skills)?.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
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
                      className="flex-1 p-2 border border-slate-300 rounded-lg"
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
                      className="text-red-500 hover:text-red-700"
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
                  className="w-full p-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400"
                >
                  + Add Skill
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {(userRole === 'mentee' ? menteeProfile?.skills : mentorProfile?.skills)?.map((skill, index) => (
                  <div key={index} className="w-full h-6 bg-slate-200 rounded-full">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center px-3">
                      <span className="text-xs text-white font-medium">{skill}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity</h3>
            
            <div className="space-y-4">
              {userRole === 'mentee' && menteeProfile ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Questions Asked</span>
                    <span className="font-semibold text-slate-800">{menteeProfile.stats.questionsAsked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bookmarks</span>
                    <span className="font-semibold text-slate-800">{menteeProfile.stats.bookmarksCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mentorship Requests</span>
                    <span className="font-semibold text-slate-800">{menteeProfile.stats.mentorshipRequestsCount}</span>
                  </div>
                </>
              ) : userRole === 'mentor' && mentorProfile ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Answers Provided</span>
                    <span className="font-semibold text-slate-800">{mentorProfile.stats.answersProvided}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Articles Written</span>
                    <span className="font-semibold text-slate-800">{mentorProfile.stats.articlesWritten}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mentees Connected</span>
                    <span className="font-semibold text-slate-800">{mentorProfile.stats.menteesConnected}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Requests Received</span>
                    <span className="font-semibold text-slate-800">{mentorProfile.stats.mentorshipRequests}</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
