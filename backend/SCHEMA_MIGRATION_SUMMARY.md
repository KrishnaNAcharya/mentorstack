# Schema Migration Summary

## Overview
Migrated from separate `Mentor`, `Mentee`, and `Admin` models to a unified `User` model with a `role` enum field.

## Key Changes Made

### 1. Authentication & Middleware (`src/middleware/auth.ts`)
- ✅ Removed `AuthCredentials` model references
- ✅ Updated signup to create `User` with `role` field directly
- ✅ Updated login to query `User` by email (password now stored in User model)
- ✅ Updated `/me` endpoint to fetch from `User` model
- ✅ Added `Role` enum import from `@prisma/client`

### 2. Mentors Route (`src/routes/mentors.ts`)
- ✅ Changed `prisma.mentor.findMany()` → `prisma.user.findMany({ where: { role: Role.mentor } })`
- ✅ Changed `prisma.mentor.findUnique()` → `prisma.user.findFirst({ where: { id, role: Role.mentor } })`
- ✅ Updated relation names: `connections` → `mentorConnections`, `mentorshipRequests` → `mentorRequests`
- ✅ Removed `AuthCredentials` lookups (email now on User)
- ✅ Updated profile update to use `prisma.user.update()`
- ✅ Added new User fields: `email`, `jobTitle`, `department`

### 3. Mentees Route (`src/routes/mentees.ts`)
- ✅ Changed `prisma.mentee.findMany()` → `prisma.user.findMany({ where: { role: Role.mentee } })`
- ✅ Changed `prisma.mentee.findUnique()` → `prisma.user.findFirst({ where: { id, role: Role.mentee } })`
- ✅ Updated relation name: `mentorshipRequests` → `menteeRequests`
- ✅ Removed `AuthCredentials` lookups
- ✅ Updated profile update to use `prisma.user.update()`
- ✅ Added new User fields in responses

### 4. Questions Route (`src/routes/questions.ts`)
- ✅ Changed question fetching to use `author` relation (User) instead of `mentee`
- ✅ Updated answer fetching to include `author` (User) with role
- ✅ Removed separate `mentor` and `mentee` lookups for answer authors
- ✅ Updated raw SQL insert: `userId` → `authorId`, `userRole` → `authorRole`
- ✅ Simplified author name fetching (single User query instead of role-based lookup)

### 5. Communities Route (`src/routes/communities.ts`)
- ✅ Updated member skill aggregation to query `prisma.user.findUnique()` instead of role-specific models
- ✅ Removed conditional `mentor`/`mentee` lookups
- ✅ Updated post author fetching to use `authorId` and single User query
- ✅ Added `Role` enum import

## Schema Relationship Mapping

### Old Schema → New Schema
```
Mentor model           → User { role: Role.mentor }
Mentee model          → User { role: Role.mentee }
Admin model           → User { role: Role.admin }
AuthCredentials       → Removed (merged into User)

Mentor.connections    → User.mentorConnections
Mentee.connections    → User.menteeConnections
Mentor.mentorshipRequests → User.mentorRequests
Mentee.mentorshipRequests → User.menteeRequests

Answer.userId         → Answer.authorId
Answer.userRole       → Answer.authorRole
Question.menteeId     → Question.authorId
Question.mentee       → Question.author
Article.mentorId      → Article.authorId
Article.mentor        → Article.author
CommunityPost.userId  → CommunityPost.authorId
CommunityPost.userRole → CommunityPost.authorRole
```

## New User Model Fields
- `id`: Int (primary key)
- `email`: String (unique) - **moved from AuthCredentials**
- `password`: String - **moved from AuthCredentials**
- `role`: Role enum (mentor | mentee | admin)
- `name`: String
- `jobTitle`: String?
- `department`: String?
- `bio`: String?
- `avatarUrl`: String?
- `skills`: String[]
- `location`: String?
- `reputation`: Int
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Important Query Pattern Changes

### Before (Old Schema)
```typescript
// Find mentor
const mentor = await prisma.mentor.findUnique({ where: { id: mentorId } });

// Find mentee
const mentee = await prisma.mentee.findUnique({ where: { id: menteeId } });

// Get author
if (role === 'mentor') {
  author = await prisma.mentor.findUnique({ where: { id } });
} else {
  author = await prisma.mentee.findUnique({ where: { id } });
}
```

### After (New Schema)
```typescript
import { Role } from '@prisma/client';

// Find mentor (must use findFirst or validate role after findUnique)
const mentor = await prisma.user.findFirst({ 
  where: { id: mentorId, role: Role.mentor } 
});

// Find mentee
const mentee = await prisma.user.findFirst({ 
  where: { id: menteeId, role: Role.mentee } 
});

// Get author (single query)
const author = await prisma.user.findUnique({ 
  where: { id },
  select: { name: true, role: true }
});
```

## Files Modified
1. ✅ `backend/src/middleware/auth.ts`
2. ✅ `backend/src/routes/mentors.ts`
3. ✅ `backend/src/routes/mentees.ts`
4. ✅ `backend/src/routes/questions.ts`
5. ✅ `backend/src/routes/communities.ts`

## Files That May Need Updates (Not Yet Modified)
- `backend/src/routes/articles.ts` - May have mentor references
- `backend/src/routes/chat.ts` - Check for user role handling
- `backend/prisma/seed.ts` - Must be updated to use new User model
- Any test files
- Any raw SQL queries in other files

## Next Steps

### 1. Regenerate Prisma Client
```bash
cd backend
npx prisma generate
```

### 2. Run Database Migration
```bash
npx prisma migrate dev --name unified_user_model
```

### 3. Update Seed Script
Update `backend/prisma/seed.ts` to:
- Create users with role field
- Remove AuthCredentials creation
- Update relation references

### 4. Test All Endpoints
- [ ] Auth: signup, login, /me
- [ ] Mentors: list, get by ID, profile
- [ ] Mentees: list, get by ID, profile
- [ ] Questions: create, list, answers
- [ ] Communities: join, posts, voting
- [ ] Articles: create, list, voting

### 5. Update Frontend
Frontend code will need updates to handle:
- User objects instead of Mentor/Mentee
- Role field for displaying user type
- Updated API response structures

## Breaking Changes
1. **API Response Structure**: All endpoints now return `User` objects with a `role` field instead of separate `Mentor`/`Mentee` objects
2. **Email Field**: Now included in user objects (was previously separate)
3. **Relation Names**: Frontend code using `connections`, `mentorshipRequests` needs to check if it's `mentorConnections`/`menteeConnections` and `mentorRequests`/`menteeRequests`
4. **Query Patterns**: Any frontend code constructing queries needs to filter by `role` instead of model type

## Enum Usage
Always import and use the Prisma enum instead of raw strings:
```typescript
import { Role } from '@prisma/client';

// ✅ Good
where: { role: Role.mentor }

// ❌ Avoid
where: { role: 'mentor' }
```

## Common Pitfalls
1. **findUnique vs findFirst**: `findUnique` only works with unique fields. When filtering by `id` + `role`, use `findFirst` or fetch by `id` then validate role.
2. **Relation Names**: Schema uses named relations (`mentorConnections`, `menteeConnections`) - don't use old `connections` name
3. **authorId vs userId**: New schema uses consistent `authorId` field name
4. **Email Access**: Email is now directly on User, no need for AuthCredentials lookup

## Migration Command
When ready to migrate your database:
```bash
cd backend
npx prisma migrate dev --name unified_user_model
npx prisma generate
```

If you have existing data, you'll need to write a migration script to:
1. Create User records from Mentor/Mentee/Admin records
2. Merge AuthCredentials into User records
3. Update foreign key references
4. Drop old tables

## Status
✅ Code changes complete for core routes
⚠️  Database migration not yet run
⚠️  Prisma client not yet regenerated
⚠️  Seed script needs update
⚠️  Frontend needs update
