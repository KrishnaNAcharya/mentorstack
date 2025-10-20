import express from 'express';
import jwt from 'jsonwebtoken';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { prisma } from '../../lib/prisma';
import { Role } from '@prisma/client';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/articles/'); // Make sure this directory exists
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get all articles with proper category filtering
router.get('/', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    
    // Filter by category/tag if provided
    if (category && category !== 'all') {
      whereClause.tags = {
        some: {
          tag: {
            name: {
              contains: category.toLowerCase(),
              mode: 'insensitive'
            }
          }
        }
      };
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            name: true,
            bio: true,
            avatarUrl: true
          }
        },
        votes: true,
        tags: {
          include: {
            tag: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const formattedArticles = articles.map(article => {
      const upvotes = article.votes.filter(vote => vote.voteType === 'upvote').length;
      const downvotes = article.votes.filter(vote => vote.voteType === 'downvote').length;
      
      return {
        id: article.id,
        title: article.title,
        content: article.content,
        imageUrls: article.imageUrls,
        authorName: article.author.name,
        authorBio: article.author.bio,
        authorAvatar: article.author.avatarUrl,
        upvotes,
        downvotes,
        tags: article.tags.map(at => at.tag.name),
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      };
    });

    // Get total count for pagination
    const totalArticles = await prisma.article.count({ where: whereClause });
    const totalPages = Math.ceil(totalArticles / limit);

    res.json({
      articles: formattedArticles,
      pagination: {
        currentPage: page,
        totalPages,
        totalArticles,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get popular tags/categories - MUST come before /:id route
router.get('/tags/popular', async (req: any, res: any) => {
  try {
    // Get actual tags from the database with article counts
    const tagsWithCounts = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: {
        articles: {
          _count: 'desc'
        }
      },
      take: 20 // Top 20 tags
    });

    const colors = [
      'bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-yellow-100',
      'bg-pink-100', 'bg-indigo-100', 'bg-gray-100', 'bg-red-100',
      'bg-teal-100', 'bg-orange-100'
    ];

    const popularTags = tagsWithCounts.map((tag, index) => ({
      name: tag.name,
      count: tag._count.articles,
      color: colors[index % colors.length]
    }));

    // If we don't have enough tags, add some default ones
    if (popularTags.length < 10) {
      const defaultTags = [
        { name: 'Web Development', count: 45, color: 'bg-blue-100' },
        { name: 'AI', count: 32, color: 'bg-purple-100' },
        { name: 'Cybersecurity', count: 28, color: 'bg-green-100' },
        { name: 'IoT', count: 25, color: 'bg-yellow-100' },
        { name: 'Frontend', count: 22, color: 'bg-pink-100' },
        { name: 'Backend', count: 20, color: 'bg-indigo-100' },
        { name: 'NLP', count: 18, color: 'bg-gray-100' },
        { name: 'Machine Learning', count: 15, color: 'bg-red-100' },
        { name: 'DevOps', count: 12, color: 'bg-teal-100' },
        { name: 'Mobile Development', count: 10, color: 'bg-orange-100' }
      ];

      // Add default tags that aren't already in our database
      const existingTagNames = popularTags.map(t => t.name.toLowerCase());
      const missingTags = defaultTags.filter(t => 
        !existingTagNames.includes(t.name.toLowerCase())
      );

      popularTags.push(...missingTags.slice(0, 10 - popularTags.length));
    }

    res.json(popularTags);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get article by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const articleId = parseInt(req.params.id);
    // Check for optional auth token to include user vote
    let currentUserId: number | null = null;
    let currentUserRole: string | null = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        currentUserId = decoded.userId;
        currentUserRole = decoded.role;
      } catch (err) {
        // ignore invalid token and continue without user vote
      }
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            name: true,
            bio: true,
            avatarUrl: true
          }
        },
        votes: true
      }
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const upvotes = article.votes.filter(vote => vote.voteType === 'upvote').length;
    const downvotes = article.votes.filter(vote => vote.voteType === 'downvote').length;

    // Determine current user's vote if available (any user can vote on articles)
    let userVote: 'upvote' | 'downvote' | null = null;
    if (currentUserId) {
      const userVoteRecord = article.votes.find(v => v.voterId === currentUserId);
      userVote = userVoteRecord ? (userVoteRecord.voteType as 'upvote' | 'downvote') : null;
    }

    const formattedArticle = {
      id: article.id,
      title: article.title,
      content: article.content,
      imageUrls: article.imageUrls,
      authorName: article.author.name,
      authorBio: article.author.bio,
      authorAvatar: article.author.avatarUrl,
      upvotes,
      downvotes,
      userVote,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    };

    res.json(formattedArticle);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new article (mentors only)
router.post('/', authenticateToken, upload.array('images', 5), async (req: any, res: any) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only mentors can create articles
    if (userRole !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can create articles' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Handle uploaded images
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        // In production, you'd upload to cloud storage and get URLs
        // For now, we'll create local URLs
        const imageUrl = `/uploads/articles/${file.filename}`;
        imageUrls.push(imageUrl);
      }
    }

    // Parse tags if they're provided as a JSON string
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (error) {
        console.error('Error parsing tags:', error);
        parsedTags = [];
      }
    }

    // Create the article
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId: userId,
        authorRole: userRole as Role,
        imageUrls: imageUrls
      },
      include: {
        author: {
          select: {
            name: true,
            bio: true,
            avatarUrl: true
          }
        }
      }
    });

    // Create tags if they don't exist and link them to the article
    if (parsedTags.length > 0) {
      for (const tagName of parsedTags) {
        try {
          // Find or create tag
          let tag = await prisma.tag.findUnique({
            where: { name: tagName.toLowerCase().trim() }
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName.toLowerCase().trim() }
            });
          }

          // Link tag to article
          await prisma.articleTag.create({
            data: {
              articleId: article.id,
              tagId: tag.id
            }
          });
        } catch (error) {
          console.error(`Error creating/linking tag ${tagName}:`, error);
          // Continue with other tags even if one fails
        }
      }
    }

    res.status(201).json({
      message: 'Article created successfully',
      article: {
        id: article.id,
        title: article.title,
        content: article.content,
        imageUrls: article.imageUrls,
        authorName: article.author.name,
        createdAt: article.createdAt,
        tags: parsedTags
      }
    });

  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Server error', details: (error as any)?.message });
  }
});

// Vote on an article
router.post('/:id/vote', authenticateToken, async (req: any, res: any) => {
  try {
    const articleId = parseInt(req.params.id);
    const { voteType } = req.body;
    const userId = req.user.userId;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user has already voted
    const existingVote = await prisma.articleVote.findUnique({
      where: {
        voterId_articleId: {
          voterId: userId,
          articleId: articleId
        }
      }
    });

    if (existingVote) {
      // If user clicks the same vote type again, remove the vote (toggle off)
      if (existingVote.voteType === voteType) {
        await prisma.articleVote.delete({
          where: { id: existingVote.id }
        });
        return res.json({ message: 'Vote removed successfully' });
      } else {
        // Otherwise update the existing vote to the new type
        await prisma.articleVote.update({
          where: { id: existingVote.id },
          data: { voteType: voteType as any }
        });
        return res.json({ message: 'Vote updated successfully' });
      }
    }

    // Create new vote
    await prisma.articleVote.create({
      data: {
        voterId: userId,
        articleId: articleId,
        voteType: voteType as 'upvote' | 'downvote'
      }
    });

    res.json({ message: 'Vote recorded successfully' });

  } catch (error) {
    console.error('Error voting on article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as articlesRouter };
