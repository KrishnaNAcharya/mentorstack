# MentorStack Admin Module

## Overview
Completely separate admin system with independent API and frontend - **NO modifications to existing auth-api.ts or main index.ts required!**

## Architecture

### Backend (Port 5001)
- **Separate Server**: `backend/src/admin-server.ts`
- **Separate Routes**: `backend/src/routes/admin/*`
- **Separate Middleware**: `backend/src/middleware/adminAuth.ts`
- **Separate Token Storage**: Uses `adminAuthToken` (not `authToken`)

### Frontend
- **Separate API**: `frontend/src/lib/admin-api.ts`
- **Admin Pages**: `frontend/src/app/admin/*`

## File Structure

```
backend/src/
├── admin-server.ts          # ← Separate admin server (Port 5001)
├── index.ts                 # Main server (Port 5000) - UNCHANGED
├── middleware/
│   ├── auth.ts              # Existing auth - UNCHANGED
│   └── adminAuth.ts         # ← New admin-only middleware
└── routes/
    ├── admin/               # ← New admin routes folder
    │   ├── auth.ts          # Admin login/logout
    │   ├── users.ts         # User management
    │   ├── communities.ts   # Community management
    │   ├── content.ts       # Content moderation
    │   └── analytics.ts     # Platform analytics
    ├── articles.ts          # Existing - UNCHANGED
    ├── communities.ts       # Existing - UNCHANGED
    └── ...                  # All other existing files - UNCHANGED

frontend/src/
├── lib/
│   ├── auth-api.ts          # Existing API - UNCHANGED
│   └── admin-api.ts         # ← New separate admin API
└── app/
    ├── admin/               # ← New admin pages
    │   ├── login/
    │   │   └── page.tsx     # Admin login page
    │   └── dashboard/
    │       └── page.tsx     # Admin dashboard
    ├── communities/         # Existing - UNCHANGED
    ├── questions/           # Existing - UNCHANGED
    └── ...                  # All other existing files - UNCHANGED
```

## Running the Application

### 1. Start Main API (Port 5000)
```bash
cd backend
npm run dev
```

### 2. Start Admin API (Port 5001)
```bash
cd backend
npm run admin
```

### 3. Start Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

## Accessing Admin Panel

1. Navigate to: `http://localhost:3000/admin/login`
2. Login with admin credentials (email with role='admin' in database)
3. Access dashboard at: `http://localhost:3000/admin/dashboard`

## API Endpoints

### Admin API (http://localhost:5001/api/admin)

**Authentication:**
- `POST /auth/login` - Admin login
- `GET /auth/me` - Get current admin
- `POST /auth/logout` - Admin logout

**User Management:**
- `GET /users` - List all users (paginated)
- `GET /users/:userId` - Get user details
- `PATCH /users/:userId/role` - Update user role
- `DELETE /users/:userId` - Delete user
- `GET /users/:userId/stats` - Get user statistics

**Community Management:**
- `GET /communities` - List all communities
- `GET /communities/:id` - Get community details
- `PATCH /communities/:id` - Update community
- `DELETE /communities/:id` - Delete community

**Content Moderation:**
- `GET /content/questions` - List all questions
- `DELETE /content/questions/:id` - Delete question
- `GET /content/articles` - List all articles
- `DELETE /content/articles/:id` - Delete article
- `GET /content/posts` - List community posts
- `DELETE /content/posts/:id` - Delete post

**Analytics:**
- `GET /analytics/overview` - Platform overview stats
- `GET /analytics/user-growth?days=30` - User growth over time
- `GET /analytics/content-activity?days=30` - Content activity
- `GET /analytics/top-users?limit=10` - Top users by reputation
- `GET /analytics/top-communities?limit=10` - Most active communities
- `GET /analytics/mentorship-stats` - Mentorship statistics

## Security Features

1. **Separate Authentication**: Admin uses different tokens (`adminAuthToken` vs `authToken`)
2. **Role Verification**: All routes verify `role === 'admin'`
3. **Separate API Server**: Admin API runs on different port (5001)
4. **Protected Routes**: All admin routes require `requireAdmin` middleware
5. **Self-Protection**: Admins cannot delete their own account

## Creating an Admin User

Use Prisma Studio or SQL to create an admin user:

```sql
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';
```

Or use Prisma Studio:
```bash
cd backend
npm run db:studio
```

## Environment Variables

Add to `backend/.env`:
```env
ADMIN_PORT=5001  # Optional, defaults to 5001
JWT_SECRET=your_secret_here
```

## Benefits of This Approach

✅ **Zero Modification** to existing `auth-api.ts`  
✅ **Zero Modification** to existing `index.ts`  
✅ **Complete Isolation** - Admin code is separate  
✅ **Independent Ports** - Main API (5000) + Admin API (5001)  
✅ **Separate Tokens** - No token conflicts  
✅ **Easy to Remove** - Delete `/admin` folders to remove feature  
✅ **Scalable** - Can deploy admin API separately if needed  

## Development Notes

- Admin API and Main API can run simultaneously
- Both APIs share the same database (Prisma client)
- Frontend can call both APIs from the same Next.js app
- Admin routes are completely isolated from user routes

## Future Enhancements

- [ ] Add user activity logs
- [ ] Add content moderation queue
- [ ] Add real-time dashboard updates
- [ ] Add admin notification system
- [ ] Add backup/export functionality
- [ ] Add system health monitoring
