# Cloudinary Integration Guide

## Overview
This project uses Cloudinary for professional image management across avatars, article images, and community post images.

## Features
- ✅ **CDN Delivery**: Fast, global content delivery
- ✅ **Automatic Optimization**: WebP conversion, quality optimization, lazy loading
- ✅ **Smart Transformations**: Face detection for avatars, responsive sizing
- ✅ **Organized Storage**: Separate folders for different content types
- ✅ **Automatic Cleanup**: Images are deleted from Cloudinary when content is deleted

## Setup Instructions

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Navigate to your Dashboard

### 2. Get Your Credentials
From your Cloudinary Dashboard, copy:
- **Cloud Name** (e.g., `dxxxxxxxxx`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Update Environment Variables
Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

⚠️ **IMPORTANT**: Never commit your `.env` file to Git. It's already in `.gitignore`.

## Image Storage Configuration

### Avatar Images
- **Folder**: `mentorstack/avatars`
- **Size**: 500x500px (auto-cropped to face)
- **Format**: Auto (WebP when supported)
- **Quality**: Auto-optimized
- **Max Size**: 5MB
- **Transformation**: Face-detection crop + gravity face

### Article Images
- **Folder**: `mentorstack/articles`
- **Max Dimensions**: 1200x800px
- **Format**: Auto (WebP when supported)
- **Quality**: Auto-optimized
- **Max Size**: 10MB per image
- **Max Count**: 5 images per article
- **Transformation**: Limit crop (maintains aspect ratio)

### Community Post Images
- **Folder**: `mentorstack/posts`
- **Max Dimensions**: 1200x800px
- **Format**: Auto (WebP when supported)
- **Quality**: Auto-optimized
- **Max Size**: 10MB per image
- **Max Count**: 5 images per post
- **Transformation**: Limit crop (maintains aspect ratio)

## API Endpoints

### Upload Avatar
```http
POST /api/upload/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  avatar: <image file>
```

**Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://res.cloudinary.com/..."
}
```

### Delete Avatar
```http
DELETE /api/upload/avatar
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Avatar deleted successfully"
}
```

### Create Article with Images
```http
POST /api/articles
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  title: "Article Title"
  content: "Article content..."
  tags: ["tag1", "tag2"]
  images: [<file1>, <file2>, ...]
```

### Create Community Post with Images
```http
POST /api/communities/:id/posts
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  title: "Post Title"
  content: "Post content..."
  tags: ["tag1", "tag2"]
  images: [<file1>, <file2>, ...]
```

## Helper Functions

### `deleteImage(publicId: string)`
Deletes an image from Cloudinary.

```typescript
import { deleteImage } from '../../lib/cloudinary';

await deleteImage('mentorstack/avatars/user123');
```

### `extractPublicId(url: string)`
Extracts the Cloudinary public ID from a URL.

```typescript
import { extractPublicId } from '../../lib/cloudinary';

const publicId = extractPublicId('https://res.cloudinary.com/.../mentorstack/avatars/abc123.jpg');
// Returns: 'mentorstack/avatars/abc123'
```

### `getOptimizedUrl(publicId: string, options)`
Generates an optimized URL with custom transformations.

```typescript
import { getOptimizedUrl } from '../../lib/cloudinary';

const url = getOptimizedUrl('mentorstack/articles/image123', {
  width: 800,
  height: 600,
  crop: 'fill'
});
```

## Database Schema

### User.avatarUrl
```prisma
model User {
  avatarUrl String?  // Cloudinary URL or null
}
```

### Article.imageUrls
```prisma
model Article {
  imageUrls String[]  // Array of Cloudinary URLs
}
```

### CommunityPost.imageUrls
```prisma
model CommunityPost {
  imageUrls String[]  // Array of Cloudinary URLs
}
```

## Image Cleanup Logic

### On User Avatar Update
1. New avatar is uploaded to Cloudinary
2. Old avatar is deleted from Cloudinary (if exists)
3. Database is updated with new URL

### On Article/Post Deletion
1. All associated images are deleted from Cloudinary
2. Article/Post is deleted from database

## Frontend Implementation (Next Steps)

### 1. Avatar Upload Component
```typescript
// Example implementation needed
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

### 2. Multi-Image Upload for Articles/Posts
```typescript
// Example implementation needed
const uploadArticle = async (data: ArticleData, images: File[]) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('tags', JSON.stringify(data.tags));
  
  images.forEach(image => {
    formData.append('images', image);
  });
  
  const response = await fetch('/api/articles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

## Testing

### Test Avatar Upload
1. Use Postman or Thunder Client
2. Create a multipart/form-data request
3. Add `avatar` field with an image file
4. Add Authorization header
5. Send to `POST http://localhost:5000/api/upload/avatar`

### Test Article Image Upload
1. Create multipart/form-data request
2. Add text fields: `title`, `content`, `tags` (JSON string)
3. Add multiple files under `images` key
4. Send to `POST http://localhost:5000/api/articles`

## Troubleshooting

### "Invalid Cloudinary credentials"
- Verify your `.env` file has correct values
- Make sure there are no extra spaces
- Restart your backend server after updating `.env`

### "Upload failed: File too large"
- Avatar max: 5MB
- Article/Post images max: 10MB each
- Compress images before uploading

### "Image not found in Cloudinary"
- Check that the public ID is correct
- Verify the folder structure matches (`mentorstack/avatars`, etc.)
- Images may take a few seconds to propagate

### Images not displaying in frontend
- Check CORS settings on Cloudinary dashboard
- Verify the URLs are complete and valid
- Check browser console for errors

## Free Tier Limits
Cloudinary's free tier includes:
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Requests**: Unlimited

This should be more than enough for development and small-to-medium production use.

## Production Checklist
- ✅ Environment variables configured
- ✅ Backend routes implemented and tested
- ⏳ Frontend upload components created
- ⏳ Image preview/gallery components
- ⏳ Progress indicators for uploads
- ⏳ Error handling and user feedback
- ⏳ Image optimization presets configured
- ⏳ CORS configured on Cloudinary dashboard

## Resources
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Reference](https://cloudinary.com/documentation/node_integration)
- [Image Transformations Guide](https://cloudinary.com/documentation/image_transformations)
- [Upload Widget](https://cloudinary.com/documentation/upload_widget)
