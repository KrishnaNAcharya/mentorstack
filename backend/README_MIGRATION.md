# 🎯 Schema Migration Complete - Quick Reference

## ✅ What's Done

All backend code has been successfully updated to work with your new unified `User` model schema.

### Files Modified (6 total)
1. ✅ `src/middleware/auth.ts` - Login, signup, authentication
2. ✅ `src/routes/mentors.ts` - All mentor endpoints
3. ✅ `src/routes/mentees.ts` - All mentee endpoints
4. ✅ `src/routes/questions.ts` - Q&A system
5. ✅ `src/routes/communities.ts` - Community posts and voting
6. ✅ `prisma/schema.prisma` - Your new schema (already done by you)

### Documentation Created
- 📄 `SCHEMA_MIGRATION_SUMMARY.md` - Detailed technical documentation
- 📄 `ACTION_CHECKLIST.md` - Step-by-step implementation guide
- 📄 `README_MIGRATION.md` - This quick reference

## 🚀 Run These Commands Now

```powershell
# 1. Navigate to backend folder
cd "c:\Users\Nidhish\Documents\Major Project\mentorstack\backend"

# 2. Regenerate Prisma Client (REQUIRED!)
npx prisma generate

# 3. Reset database and apply new schema
npx prisma migrate reset --force
npx prisma migrate dev --name unified_user_model

# 4. Update and run seed (after fixing seed.ts)
npx prisma db seed

# 5. Start your server
npm run dev
```

## 🔑 Key Changes Cheat Sheet

### Import the Role Enum
```typescript
import { Role } from '@prisma/client';
```

### Query Patterns
```typescript
// Finding users by role
const mentors = await prisma.user.findMany({ 
  where: { role: Role.mentor } 
});

const mentee = await prisma.user.findFirst({ 
  where: { id: userId, role: Role.mentee } 
});

// Creating users
await prisma.user.create({
  data: {
    email: "user@example.com",
    password: hashedPassword,
    role: Role.mentor,  // or Role.mentee, Role.admin
    name: "John Doe",
    skills: ["JavaScript", "React"],
    // ... other fields
  }
});
```

### Relation Names Changed
- `connections` → `mentorConnections` (on mentors)
- `connections` → `menteeConnections` (on mentees)
- `mentorshipRequests` → `mentorRequests` (on mentors)
- `mentorshipRequests` → `menteeRequests` (on mentees)

### Field Names Changed
- `userId` → `authorId` (in Question, Answer, Article, CommunityPost)
- `userRole` → `authorRole` (where applicable)
- `menteeId` → `authorId` (in Question)

## 📋 Update Your Seed Script

Your `prisma/seed.ts` needs these changes:

### Before:
```typescript
const mentor = await prisma.mentor.create({
  data: { name: "John", bio: "Expert", skills: ["JS"] }
});

await prisma.authCredentials.create({
  data: {
    email: "john@example.com",
    password: hashedPassword,
    role: "mentor",
    userId: mentor.id
  }
});
```

### After:
```typescript
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash("password123", 10);

const user = await prisma.user.create({
  data: {
    email: "john@example.com",
    password: hashedPassword,  // Now on User!
    role: Role.mentor,
    name: "John",
    bio: "Expert",
    skills: ["JS"]
  }
});
```

## 🧪 Test Your Changes

### 1. Auth Tests
```bash
# Signup
POST http://localhost:3000/api/auth/signup
{
  "email": "test@example.com",
  "password": "password123",
  "role": "mentor",
  "firstName": "Test",
  "lastName": "User",
  "skills": ["JavaScript"],
  "bio": "Test bio"
}

# Login
POST http://localhost:3000/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

# Get current user
GET http://localhost:3000/api/auth/me
Authorization: Bearer <token>
```

### 2. Profile Tests
```bash
# Get all mentors
GET http://localhost:3000/api/mentors

# Get specific mentor
GET http://localhost:3000/api/mentors/1
Authorization: Bearer <token>

# Update profile
PUT http://localhost:3000/api/mentors/profile/me
Authorization: Bearer <token>
{
  "bio": "Updated bio",
  "skills": ["JavaScript", "TypeScript"]
}
```

## ⚠️ Important Notes

1. **Prisma Generate is REQUIRED**: Without running `npx prisma generate`, you'll see TypeScript errors
2. **Database Migration**: Run migration to update your database schema
3. **Seed Script**: Must be updated before running `npx prisma db seed`
4. **Frontend**: Will need updates to handle `User` objects with `role` field
5. **Email Field**: Now directly on User model (no more AuthCredentials lookup)

## 🐛 Troubleshooting

### "Property 'mentor' does not exist"
→ Run `npx prisma generate`

### "Migration failed"
→ Check if database is running
→ Try `npx prisma migrate reset` to start fresh

### "Seed script fails"
→ Update seed script to use new User model

### TypeScript errors in routes
→ All route files have been updated, regenerate Prisma client

## 📚 More Information

- See `SCHEMA_MIGRATION_SUMMARY.md` for detailed technical docs
- See `ACTION_CHECKLIST.md` for complete step-by-step guide
- See your updated route files for implementation examples

## ✨ Benefits of New Schema

✅ **Simpler**: One User model instead of three separate models  
✅ **Cleaner**: No more AuthCredentials table to manage  
✅ **Flexible**: Easy to add new roles (e.g., "moderator")  
✅ **Type-Safe**: Role enum prevents typos  
✅ **Maintainable**: Less code duplication  

## 🎉 You're All Set!

Once you run the commands above, your backend will be fully operational with the new unified User model.

**Need help?** Check the other documentation files or review the updated route files for examples.

---

**Created:** $(Get-Date)  
**Migration:** Mentor/Mentee/Admin → Unified User Model  
**Status:** Code Complete ✅ | Database Pending ⏳
