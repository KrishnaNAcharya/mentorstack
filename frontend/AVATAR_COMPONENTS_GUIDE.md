# Avatar Components Usage Guide

## Components Created

### 1. AvatarUpload (Editable Avatar)
**Location:** `frontend/src/components/AvatarUpload.tsx`

Full-featured avatar upload component with:
- ✅ Click to upload or drag & drop
- ✅ Image preview before upload
- ✅ Delete existing avatar
- ✅ Loading states
- ✅ Error handling
- ✅ Multiple size options
- ✅ Hover effects
- ✅ Automatic Cloudinary integration

**Props:**
```typescript
interface AvatarUploadProps {
  currentAvatarUrl?: string | null;      // Current avatar URL from database
  onUploadSuccess?: (newUrl: string) => void;  // Callback when upload succeeds
  onDeleteSuccess?: () => void;          // Callback when delete succeeds
  size?: 'sm' | 'md' | 'lg' | 'xl';     // Avatar size (default: 'lg')
  editable?: boolean;                    // Enable/disable editing (default: true)
}
```

**Usage Example:**
```tsx
import AvatarUpload from '@/components/AvatarUpload';

function ProfilePage() {
  const [user, setUser] = useState({ avatarUrl: null });

  return (
    <AvatarUpload
      currentAvatarUrl={user.avatarUrl}
      onUploadSuccess={(newUrl) => {
        setUser({ ...user, avatarUrl: newUrl });
      }}
      onDeleteSuccess={() => {
        setUser({ ...user, avatarUrl: null });
      }}
      size="xl"
      editable={true}
    />
  );
}
```

### 2. AvatarDisplay (Read-Only Avatar)
**Location:** `frontend/src/components/AvatarDisplay.tsx`

Simple avatar display component for showing user avatars throughout the app:
- ✅ Shows uploaded avatar or generates initials
- ✅ Color-coded gradient backgrounds
- ✅ Multiple size options
- ✅ Lightweight and performant

**Props:**
```typescript
interface AvatarDisplayProps {
  avatarUrl?: string | null;             // Avatar URL to display
  name?: string;                         // User name (for initials fallback)
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // Display size (default: 'md')
}
```

**Usage Examples:**
```tsx
import AvatarDisplay from '@/components/AvatarDisplay';

// With avatar URL
<AvatarDisplay
  avatarUrl="https://res.cloudinary.com/..."
  name="John Doe"
  size="md"
/>

// Without avatar (shows initials)
<AvatarDisplay
  name="Jane Smith"
  size="sm"
/>

// In a list
{users.map(user => (
  <div key={user.id} className="flex items-center gap-2">
    <AvatarDisplay
      avatarUrl={user.avatarUrl}
      name={user.name}
      size="sm"
    />
    <span>{user.name}</span>
  </div>
))}
```

## Size Reference

| Size | Dimensions | Use Case |
|------|------------|----------|
| `xs` | 32x32px (2rem) | Small lists, tags |
| `sm` | 48x48px (3rem) | Comment threads, compact lists |
| `md` | 64x64px (4rem) | Standard lists, cards |
| `lg` | 96x96px (6rem) | Profile previews |
| `xl` | 128x128px (8rem) | Main profile page |

## Integration Examples

### Profile Page (Already Implemented)
```tsx
// frontend/src/app/profile/page.tsx
import AvatarUpload from "../../components/AvatarUpload";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <div className="profile-header">
      <AvatarUpload
        currentAvatarUrl={profile?.avatarUrl || null}
        onUploadSuccess={(newUrl) => {
          setProfile({ ...profile, avatarUrl: newUrl });
        }}
        onDeleteSuccess={() => {
          setProfile({ ...profile, avatarUrl: null });
        }}
        size="xl"
        editable={true}
      />
      {/* Rest of profile... */}
    </div>
  );
}
```

### Question/Article Author Display
```tsx
import AvatarDisplay from '@/components/AvatarDisplay';

function QuestionCard({ question }) {
  return (
    <div className="question-card">
      <div className="author-info flex items-center gap-2">
        <AvatarDisplay
          avatarUrl={question.author.avatarUrl}
          name={question.author.name}
          size="sm"
        />
        <span>{question.author.name}</span>
      </div>
      {/* Rest of question... */}
    </div>
  );
}
```

### Community Post Author
```tsx
function CommunityPost({ post }) {
  return (
    <article>
      <header className="flex items-center gap-3 mb-4">
        <AvatarDisplay
          avatarUrl={post.author.avatarUrl}
          name={post.author.name}
          size="md"
        />
        <div>
          <h3>{post.author.name}</h3>
          <time>{post.createdAt}</time>
        </div>
      </header>
      {/* Post content... */}
    </article>
  );
}
```

### Navbar User Menu
```tsx
function Navbar() {
  const [user, setUser] = useState(null);

  return (
    <nav>
      {/* ... */}
      <button className="user-menu">
        <AvatarDisplay
          avatarUrl={user?.avatarUrl}
          name={user?.name || 'User'}
          size="sm"
        />
      </button>
    </nav>
  );
}
```

### Comment Author
```tsx
function Comment({ comment }) {
  return (
    <div className="comment flex gap-3">
      <AvatarDisplay
        avatarUrl={comment.author.avatarUrl}
        name={comment.author.name}
        size="xs"
      />
      <div className="comment-body">
        <p className="author-name">{comment.author.name}</p>
        <p>{comment.content}</p>
      </div>
    </div>
  );
}
```

## Features & Behavior

### AvatarUpload Features

1. **Upload Methods:**
   - Click on avatar to select file
   - Click "Upload Avatar" button
   - File input validates: image types only, max 5MB

2. **Visual Feedback:**
   - Loading spinner during upload/delete
   - Hover overlay with camera icon
   - Preview image before upload completes
   - Error messages displayed below avatar

3. **Delete Function:**
   - Delete button appears on hover (top-right)
   - Confirmation dialog before deletion
   - Removes from Cloudinary and database
   - Updates UI immediately

4. **Fallback Display:**
   - Shows first letter of user name
   - Gradient background (blue to purple)
   - Consistent styling

### AvatarDisplay Features

1. **Smart Initials:**
   - Two letters: first and last name initials
   - Falls back to first 2 characters if single word
   - Uppercase automatically

2. **Color Gradients:**
   - 6 different gradient combinations
   - Deterministic based on name (same name = same color)
   - Accessible color contrasts

3. **Performance:**
   - Next.js Image optimization
   - Lazy loading support
   - Minimal re-renders

## API Integration

### Upload Endpoint
```typescript
POST /api/upload/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: { avatar: File }

Response: {
  message: "Avatar uploaded successfully",
  avatarUrl: "https://res.cloudinary.com/..."
}
```

### Delete Endpoint
```typescript
DELETE /api/upload/avatar
Authorization: Bearer <token>

Response: {
  message: "Avatar deleted successfully"
}
```

## Styling Customization

### Custom Sizes
```tsx
// Add custom size to component
const customSizeClasses = {
  ...sizeClasses,
  '2xl': 'w-48 h-48 text-5xl'
};

<AvatarUpload size="2xl" />
```

### Custom Gradients
```tsx
// In AvatarDisplay.tsx, modify gradients array
const gradients = [
  'from-blue-400 to-purple-500',
  'from-custom-400 to-custom-500',  // Add your own
];
```

### Border Styles
```tsx
// Wrap with custom border
<div className="rounded-full p-1 bg-gradient-to-r from-purple-500 to-pink-500">
  <AvatarDisplay avatarUrl={url} name={name} size="lg" />
</div>
```

## Accessibility

- ✅ ARIA labels on buttons
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus indicators
- ✅ Alt text on images

## Error Handling

The component handles these errors gracefully:
- Invalid file type → Shows error message
- File too large (>5MB) → Shows error message
- Network errors → Shows error message
- Invalid token → Shows error message
- Upload failures → Reverts to previous state

## Next Steps

### Recommended Updates:

1. **Update Question Cards:**
   ```tsx
   // In QuestionCard component
   import AvatarDisplay from '@/components/AvatarDisplay';
   
   <AvatarDisplay
     avatarUrl={question.authorAvatar}
     name={question.authorName}
     size="sm"
   />
   ```

2. **Update Article Cards:**
   ```tsx
   // In ArticleCard component
   <AvatarDisplay
     avatarUrl={article.author.avatarUrl}
     name={article.author.name}
     size="md"
   />
   ```

3. **Update Community Posts:**
   ```tsx
   // In CommunityPostCard component
   <AvatarDisplay
     avatarUrl={post.author.avatarUrl}
     name={post.author.name}
     size="md"
   />
   ```

4. **Update Navbar:**
   ```tsx
   // In Navbar component
   <AvatarDisplay
     avatarUrl={currentUser?.avatarUrl}
     name={currentUser?.name}
     size="sm"
   />
   ```

## Testing Checklist

- [ ] Upload avatar from profile page
- [ ] Delete avatar from profile page
- [ ] Avatar displays correctly after upload
- [ ] Error handling for invalid files
- [ ] Error handling for large files
- [ ] Loading states show correctly
- [ ] Avatar updates across all pages
- [ ] Initials fallback works
- [ ] Responsive on mobile
- [ ] Works with different browsers

## Troubleshooting

**Avatar not uploading:**
- Check Cloudinary credentials in backend `.env`
- Verify backend server is running
- Check browser console for errors
- Verify JWT token is valid

**Image not displaying:**
- Check CORS settings on Cloudinary
- Verify URL format is correct
- Check browser console for CORS errors

**Delete not working:**
- Verify user is authenticated
- Check backend logs for errors
- Ensure Cloudinary credentials are correct
