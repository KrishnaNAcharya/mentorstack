// API service for authentication
const API_BASE_URL = 'http://localhost:5000/api';

export interface SignupData {
  email: string;
  password: string;
  role: 'mentor' | 'mentee';
  firstName: string;
  lastName: string;
  skills: string[];
  bio: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'mentor' | 'mentee' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface UserResponse {
  user: User;
}

export interface MenteeProfile {
  id: number;
  name: string;
  email: string;
  bio: string;
  skills: string[];
  reputation: number;
  joinedDate: string;
  questions: Question[];
  stats: {
    questionsAsked: number;
    bookmarksCount: number;
    mentorshipRequestsCount: number;
  };
}

export interface Question {
  id: number;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  authorName: string;
  answerCount?: number;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  skills: string[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    members: number;
    posts: number;
  };
}

export interface CommunityPost {
  id: number;
  communityId: number;
  userRole: string;
  userId: number;
  title: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  votes: CommunityPostVote[];
  _count: {
    votes: number;
  };
}

export interface CommunityPostVote {
  id: number;
  userRole: string;
  userId: number;
  postId: number;
  voteType: 'upvote' | 'downvote';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  id: number;
  communityId: number;
  userRole: string;
  userId: number;
  joinedAt: string;
  updatedAt: string;
}

export interface UpdateProfileResponse {
  message: string;
  profile: {
    id: number;
    name: string;
    bio: string;
    skills: string[];
  };
}

class AuthAPI {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const result = await response.json();
    
    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('authToken', result.token);
    }

    return result;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    
    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('authToken', result.token);
    }

    return result;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user data');
    }

    return response.json();
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Mentee profile methods
  async getMenteeProfile(): Promise<MenteeProfile> {
    const response = await fetch(`${API_BASE_URL}/mentees/profile/me`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get mentee profile');
    }

    return response.json();
  }

  async updateMenteeProfile(data: { name: string; bio: string; skills: string[] }): Promise<UpdateProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/mentees/profile/me`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  }

  // Questions methods
  async getQuestions(): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get questions');
    }

    return response.json();
  }

  // Community methods
  async getCommunities(): Promise<Community[]> {
    const response = await fetch(`${API_BASE_URL}/communities`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get communities');
    }

    return response.json();
  }

  async getCommunity(id: number): Promise<Community> {
    const response = await fetch(`${API_BASE_URL}/communities/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get community');
    }

    return response.json();
  }

  async createCommunity(data: { name: string; description: string; skills: string[] }): Promise<Community> {
    const response = await fetch(`${API_BASE_URL}/communities`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create community');
    }

    return response.json();
  }

  async joinCommunity(communityId: number): Promise<{ message: string; member: CommunityMember }> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/join`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join community');
    }

    return response.json();
  }

  async leaveCommunity(communityId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/leave`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to leave community');
    }

    return response.json();
  }

  async getCommunityPosts(communityId: number, page = 1, limit = 10): Promise<CommunityPost[]> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get community posts');
    }

    return response.json();
  }

  async createCommunityPost(communityId: number, data: { title: string; content: string; imageUrls?: string[] }): Promise<CommunityPost> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }

    return response.json();
  }

  async voteOnCommunityPost(communityId: number, postId: number, voteType: 'upvote' | 'downvote'): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts/${postId}/vote`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ voteType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to vote on post');
    }

    return response.json();
  }

  async searchCommunities(query: string): Promise<Community[]> {
    const response = await fetch(`${API_BASE_URL}/communities/search/${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search communities');
    }

    return response.json();
  }
}

export const authAPI = new AuthAPI();
