import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';

const router = express.Router();

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

// Get all articles
router.get('/', async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    
    // Filter by category/tag if provided
    if (category && category !== 'all') {
      // For now, we'll search in content for category keywords
      // In a real app, you might have a separate categories table
      whereClause.OR = [
        { title: { contains: category, mode: 'insensitive' } },
        { content: { contains: category, mode: 'insensitive' } }
      ];
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
    // Since we don't have a dedicated tags table, we'll return predefined categories
    // In a real app, you might extract tags from article content or have a separate tags system
    const popularTags = [
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

    // Determine current user's vote if available (only mentees can vote on articles)
    let userVote: 'upvote' | 'downvote' | null = null;
    if (currentUserId && currentUserRole === 'mentee') {
      const userVoteRecord = article.votes.find(v => v.menteeId === currentUserId);
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
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { title, content, imageUrls } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only mentors can create articles
    if (userRole !== 'mentor') {
      return res.status(403).json({ message: 'Only mentors can create articles' });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        authorId: userId,
        imageUrls: imageUrls || []
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

    res.status(201).json({
      message: 'Article created successfully',
      article: {
        id: article.id,
        title: article.title,
        content: article.content,
        imageUrls: article.imageUrls,
        authorName: article.author.name,
        createdAt: article.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on an article
router.post('/:id/vote', authenticateToken, async (req: any, res: any) => {
  try {
    const articleId = parseInt(req.params.id);
    const { voteType } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only mentees can vote on articles
    if (userRole !== 'mentee') {
      return res.status(403).json({ message: 'Only mentees can vote on articles' });
    }

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
        menteeId_articleId: {
          menteeId: userId,
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
        menteeId: userId,
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
