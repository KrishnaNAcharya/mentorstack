// Admin API service - Completely separate from main auth-api.ts
const ADMIN_API_BASE_URL = 'http://localhost:5000/api/admin';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin';
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface AdminLoginResponse {
  message: string;
  token: string;
  admin: AdminUser;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'mentor' | 'mentee' | 'admin';
  reputation: number;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  createdAt: string;
  _count: {
    questions: number;
    answers: number;
    articles: number;
    mentorConnections: number;
    menteeConnections: number;
    communityPosts: number;
  };
}

export interface Community {
  id: number;
  name: string;
  description: string;
  skills: string[];
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  _count: {
    members: number;
    posts: number;
  };
}

export interface Question {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  _count: {
    answers: number;
  };
}

export interface Article {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  community: {
    id: number;
    name: string;
  };
}

export interface OverviewStats {
  users: {
    total: number;
    mentors: number;
    mentees: number;
    admins: number;
  };
  content: {
    questions: number;
    answers: number;
    articles: number;
    communities: number;
    communityPosts: number;
  };
  mentorship: {
    connections: number;
    requests: number;
  };
}

class AdminAPI {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('adminAuthToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // ==================== Authentication ====================
  
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Admin login failed');
    }

    const result = await response.json();
    
    // Store admin token separately from regular auth token
    if (result.token) {
      localStorage.setItem('adminAuthToken', result.token);
    }

    return result;
  }

  async getCurrentAdmin(): Promise<{ admin: AdminUser }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get admin data');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${ADMIN_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminAuthToken');
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('adminAuthToken');
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ==================== User Management ====================
  
  async getUsers(page = 1, limit = 20, role?: string, search?: string): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (role) params.append('role', role);
    if (search) params.append('search', search);

    const response = await fetch(`${ADMIN_API_BASE_URL}/users?${params}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }

    return response.json();
  }

  async getUserDetails(userId: number): Promise<any> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/users/${userId}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user details');
    }

    return response.json();
  }

  async updateUserRole(userId: number, role: 'mentor' | 'mentee' | 'admin'): Promise<{ message: string; user: any }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user role');
    }

    return response.json();
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }

    return response.json();
  }

  async getUserStats(userId: number): Promise<any> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/users/${userId}/stats`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user stats');
    }

    return response.json();
  }

  // ==================== Community Management ====================
  
  async getCommunities(page = 1, limit = 20): Promise<{
    communities: Community[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${ADMIN_API_BASE_URL}/communities?${params}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch communities');
    }

    return response.json();
  }

  async getCommunityDetails(communityId: number): Promise<any> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/communities/${communityId}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch community details');
    }

    return response.json();
  }

  async deleteCommunity(communityId: number): Promise<{ message: string }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/communities/${communityId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete community');
    }

    return response.json();
  }

  async updateCommunity(communityId: number, data: { name?: string; description?: string; skills?: string[] }): Promise<{ message: string; community: Community }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/communities/${communityId}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update community');
    }

    return response.json();
  }

  // ==================== Content Management ====================
  
  async getQuestions(page = 1, limit = 20): Promise<{
    questions: Question[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${ADMIN_API_BASE_URL}/content/questions?${params}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch questions');
    }

    return response.json();
  }

  async deleteQuestion(questionId: number): Promise<{ message: string }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/content/questions/${questionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete question');
    }

    return response.json();
  }

  async getArticles(page = 1, limit = 20): Promise<{
    articles: Article[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${ADMIN_API_BASE_URL}/content/articles?${params}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch articles');
    }

    return response.json();
  }

  async deleteArticle(articleId: number): Promise<{ message: string }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/content/articles/${articleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete article');
    }

    return response.json();
  }

  async getCommunityPosts(page = 1, limit = 20): Promise<{
    posts: CommunityPost[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${ADMIN_API_BASE_URL}/content/posts?${params}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch posts');
    }

    return response.json();
  }

  async deletePost(postId: number): Promise<{ message: string }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/content/posts/${postId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete post');
    }

    return response.json();
  }

  // ==================== Analytics ====================
  
  async getOverviewStats(): Promise<OverviewStats> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/analytics/overview`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch overview stats');
    }

    return response.json();
  }

  async getUserGrowth(days = 30): Promise<any> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/analytics/user-growth?days=${days}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user growth');
    }

    return response.json();
  }

  async getContentActivity(days = 30): Promise<any> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/analytics/content-activity?days=${days}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch content activity');
    }

    return response.json();
  }

  async getTopUsers(limit = 10): Promise<{ topUsers: any[] }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/analytics/top-users?limit=${limit}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch top users');
    }

    return response.json();
  }

  async getTopCommunities(limit = 10): Promise<{ communities: any[] }> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/analytics/top-communities?limit=${limit}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch top communities');
    }

    return response.json();
  }

  async getMentorshipStats(): Promise<any> {
    const response = await fetch(`${ADMIN_API_BASE_URL}/analytics/mentorship-stats`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch mentorship stats');
    }

    return response.json();
  }
}

export const adminAPI = new AdminAPI();
