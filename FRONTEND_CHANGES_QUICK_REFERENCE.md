# Frontend Changes Quick Reference

## What Was Added to frontend/src/lib/auth-api.ts

### 1. New Interfaces

```typescript
// Mentor profile data structure
export interface MentorProfile {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string | null;
  skills: string[];
  location: string | null;  // Mentor-specific field
  jobTitle: string | null;  // Mentor-specific field
  department: string | null; // Mentor-specific field
  reputation: number;
  joinedDate: string;
  answers: Array<...>;      // Mentor provides answers
  articles: Array<...>;     // Mentor writes articles
  connections: Array<...>;  // Mentor's mentee connections
  mentorshipRequests: Array<...>; // Pending requests
  stats: {
    answersProvided: number;
    articlesWritten: number;
    menteesConnected: number;
    mentorshipRequests: number;
  };
}

// Mentor list item (lightweight version)
export interface Mentor {
  id: number;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string | null;
  skills: string[];
  location: string | null;
  reputation: number;
  jobTitle: string | null;
  department: string | null;
  createdAt: string;
}
```

### 2. New Methods

```typescript
// Fetch authenticated mentor's profile
async getMentorProfile(): Promise<MentorProfile>
// Usage: const profile = await authAPI.getMentorProfile();

// Update authenticated mentor's profile
async updateMentorProfile(data: {
  name: string;
  bio: string;
  skills: string[];
  location?: string;
}): Promise<UpdateProfileResponse>
// Usage: await authAPI.updateMentorProfile({ name: "...", bio: "...", skills: [...], location: "..." });

// Get list of all mentors
async getMentors(): Promise<Mentor[]>
// Usage: const mentors = await authAPI.getMentors();
```

---

## How to Use

### Example: Fetch Mentor Profile (Already used in profile page)
```tsx
'use client'
import { authAPI, MentorProfile } from "@/lib/auth-api";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  
  useEffect(() => {
    async function loadProfile() {
      const data = await authAPI.getMentorProfile();
      setProfile(data);
    }
    loadProfile();
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{profile.bio}</p>
      <p>Location: {profile.location}</p>
      <p>Reputation: {profile.reputation}</p>
      <div>
        <h3>Stats</h3>
        <p>Answers: {profile.stats.answersProvided}</p>
        <p>Articles: {profile.stats.articlesWritten}</p>
        <p>Mentees: {profile.stats.menteesConnected}</p>
      </div>
    </div>
  );
}
```

### Example: Update Mentor Profile
```tsx
async function handleSave() {
  try {
    await authAPI.updateMentorProfile({
      name: "John Doe",
      bio: "Senior Developer",
      skills: ["React", "Node.js", "TypeScript"],
      location: "San Francisco, CA"
    });
    alert("Profile updated!");
  } catch (error) {
    console.error(error);
  }
}
```

### Example: Fetch All Mentors
```tsx
'use client'
import { authAPI, Mentor } from "@/lib/auth-api";
import { useEffect, useState } from "react";

export default function MentorListPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  
  useEffect(() => {
    async function loadMentors() {
      const data = await authAPI.getMentors();
      setMentors(data);
    }
    loadMentors();
  }, []);

  return (
    <div>
      <h1>Available Mentors</h1>
      {mentors.map(mentor => (
        <div key={mentor.id}>
          <h3>{mentor.name}</h3>
          <p>{mentor.bio}</p>
          <p>{mentor.location}</p>
          <div>
            {mentor.skills.map(skill => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Backend Endpoints (For Reference)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/mentors` | No | Get all mentors |
| GET | `/api/mentors/profile/me` | Yes (Mentor role) | Get current mentor's profile |
| PUT | `/api/mentors/profile/me` | Yes (Mentor role) | Update current mentor's profile |
| GET | `/api/mentees/profile/me` | Yes (Mentee role) | Get current mentee's profile |
| PUT | `/api/mentees/profile/me` | Yes (Mentee role) | Update current mentee's profile |

---

## Comparison: Mentee vs Mentor Profiles

### MenteeProfile (Existing)
```typescript
{
  questions: Question[];  // Mentees ASK questions
  stats: {
    questionsAsked: number;
    bookmarksCount: number;
    mentorshipRequestsCount: number;
  }
}
```

### MentorProfile (New)
```typescript
{
  location: string;       // Mentors have location/jobTitle/department
  jobTitle: string;
  department: string;
  answers: Answer[];      // Mentors PROVIDE answers
  articles: Article[];    // Mentors WRITE articles
  connections: Connection[];  // Mentors have mentee connections
  mentorshipRequests: Request[];  // Mentors receive requests
  stats: {
    answersProvided: number;
    articlesWritten: number;
    menteesConnected: number;
    mentorshipRequests: number;
  }
}
```

---

## Migration Checklist for Developers

- [x] Added MentorProfile interface to auth-api.ts
- [x] Added Mentor interface to auth-api.ts
- [x] Added getMentorProfile() method
- [x] Added updateMentorProfile() method
- [x] Added getMentors() method
- [x] Verified profile page works with new methods
- [x] No TypeScript compilation errors
- [ ] (Optional) Connect mentor-list page to getMentors()
- [ ] (Optional) Write unit tests for new methods
- [ ] (Optional) Test full mentor signup → profile flow

---

## Files Changed

1. **frontend/src/lib/auth-api.ts**
   - Added: MentorProfile interface
   - Added: Mentor interface
   - Added: getMentorProfile() method
   - Added: updateMentorProfile() method
   - Added: getMentors() method

---

*This document provides a quick reference for the frontend changes related to the unified User schema migration.*
