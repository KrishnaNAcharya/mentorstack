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

// Get all questions
router.get('/', async (req: any, res: any) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        mentee: {
          select: {
            name: true
          }
        },
        answers: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedQuestions = questions.map(question => ({
      id: question.id,
      title: question.title,
      description: question.body,
      tags: question.tags,
      createdAt: question.createdAt,
      authorName: question.mentee.name,
      answerCount: question.answers.length
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get question by ID
// @ts-ignore
router.get('/:id', async (req: any, res: any) => {
  try {
    const questionId = parseInt(req.params.id);
    
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        mentee: {
          select: {
            name: true
          }
        },
        answers: {
          include: {
            mentor: {
              select: {
                name: true
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
      tags: question.tags,
      createdAt: question.createdAt,
      authorName: question.mentee.name,
      answers: question.answers.map(answer => ({
        id: answer.id,
        content: answer.body,
        createdAt: answer.createdAt,
        authorName: answer.mentor.name
      }))
    };

    res.json(formattedQuestion);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new question
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { title, body, tags } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only mentees can ask questions
    if (userRole !== 'mentee') {
      return res.status(403).json({ message: 'Only mentees can ask questions' });
    }

    const question = await prisma.question.create({
      data: {
        title,
        body,
        menteeId: userId,
        tags: tags || []
      },
      include: {
        mentee: {
          select: {
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Question created successfully',
      question: {
        id: question.id,
        title: question.title,
        description: question.body,
        tags: question.tags,
        createdAt: question.createdAt,
        authorName: question.mentee.name
      }
    });

  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as questionsRouter };