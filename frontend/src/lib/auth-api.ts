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
}

export const authAPI = new AuthAPI();
