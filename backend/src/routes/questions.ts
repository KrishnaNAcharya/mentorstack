import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { Role } from '@prisma/client';

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

// Get all questions (simplified)
router.get('/', async (req: any, res: any) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            avatarUrl: true
          }
        },
        answers: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedQuestions = questions.map((question: any) => ({
      id: question.id,
      title: question.title,
      description: question.body,
      tags: [],
      createdAt: question.createdAt,
      authorName: question.author.name,
      authorRole: question.author.role,
      answerCount: question.answers.length,
      voteScore: 0
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get question by ID (simplified)
router.get('/:id', async (req: any, res: any) => {
  try {
    const questionId = parseInt(req.params.id);
    
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            avatarUrl: true
          }
        },
        answers: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const formattedQuestion = {
      id: question.id,
      title: question.title,
      description: question.body,
      tags: [],
      createdAt: question.createdAt,
      authorName: question.author.name,
      authorRole: question.author.role,
      voteScore: 0,
      answers: question.answers.map((answer: any) => ({
        id: answer.id,
        content: answer.body,
        createdAt: answer.createdAt,
        authorName: answer.author.name,
        authorRole: answer.author.role,
        voteScore: 0
      }))
    };

    res.json(formattedQuestion);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create answer for a question
router.post('/:questionId/answers', authenticateToken, async (req: any, res: any) => {
  try {
    const questionId = parseInt(req.params.questionId);
    const { content } = req.body;
    const { id: userId, role } = req.user;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Answer content is required' });
    }

    if (content.trim().length < 20) {
      return res.status(400).json({ error: 'Answer must be at least 20 characters long' });
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Create the answer using raw SQL to bypass Prisma type issues
    const result = await prisma.$executeRaw`
      INSERT INTO "Answer" (body, "questionId", "authorId", "authorRole", "createdAt", "updatedAt")
      VALUES (${content.trim()}, ${questionId}, ${userId}, ${role}::"Role", NOW(), NOW())
      RETURNING id
    `;

    console.log('Answer created via raw SQL:', result);

    // Get author name based on role
    const author = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true }
    });

    const responseAnswer = {
      id: 'created',
      content: content.trim(),
      authorName: author?.name || 'Unknown',
      authorRole: author?.role || role,
      createdAt: new Date(),
      voteScore: 0
    };

    res.status(201).json({ 
      message: 'Answer created successfully',
      answer: responseAnswer
    });
  } catch (error: any) {
    console.error('Error creating answer:', error);
    res.status(500).json({ error: 'Failed to create answer', details: error.message });
  }
});

export { router as questionsRouter };
