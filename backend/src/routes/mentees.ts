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

// Get all mentees
router.get('/', async (req, res) => {
  try {
    const mentees = await prisma.mentee.findMany({
      select: {
        id: true,
        name: true,
        bio: true,
        skills: true,
        reputation: true,
        createdAt: true
      }
    });
    res.json(mentees);
  } catch (error) {
    console.error('Error fetching mentees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get mentee profile by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const menteeId = parseInt(req.params.id);
    
    const mentee = await prisma.mentee.findUnique({
      where: { id: menteeId },
      include: {
        questions: {
          orderBy: { createdAt: 'desc' }
        },
        bookmarks: true,
        mentorshipRequests: true
      }
    });

    if (!mentee) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    // Get auth credentials for email
    const authCredentials = await prisma.authCredentials.findFirst({
      where: { userId: menteeId, role: 'mentee' },
      select: { email: true }
    });

    // Calculate stats
    const stats = {
      questionsAsked: mentee.questions.length,
      bookmarksCount: mentee.bookmarks.length,
      mentorshipRequestsCount: mentee.mentorshipRequests.length
    };

    res.json({
      id: mentee.id,
      name: mentee.name,
      email: authCredentials?.email || '',
      bio: mentee.bio,
      skills: mentee.skills,
      reputation: mentee.reputation,
      joinedDate: mentee.createdAt,
      questions: mentee.questions,
      stats
    });

  } catch (error) {
    console.error('Error fetching mentee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current mentee profile (authenticated user)
router.get('/profile/me', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole !== 'mentee') {
      return res.status(403).json({ message: 'Access denied. Mentee role required.' });
    }

    const mentee = await prisma.mentee.findUnique({
      where: { id: userId },
      include: {
        questions: {
          orderBy: { createdAt: 'desc' }
        },
        bookmarks: true,
        mentorshipRequests: true
      }
    });

    if (!mentee) {
      return res.status(404).json({ message: 'Mentee profile not found' });
    }

    // Get auth credentials for email
    const authCredentials = await prisma.authCredentials.findFirst({
      where: { userId: userId, role: 'mentee' },
      select: { email: true }
    });

    // Calculate stats
    const stats = {
      questionsAsked: mentee.questions.length,
      bookmarksCount: mentee.bookmarks.length,
      mentorshipRequestsCount: mentee.mentorshipRequests.length
    };

    res.json({
      id: mentee.id,
      name: mentee.name,
      email: authCredentials?.email || '',
      bio: mentee.bio,
      skills: mentee.skills,
      reputation: mentee.reputation,
      joinedDate: mentee.createdAt,
      questions: mentee.questions,
      stats
    });

  } catch (error) {
    console.error('Error fetching mentee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mentee profile
router.put('/profile/me', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole !== 'mentee') {
      return res.status(403).json({ message: 'Access denied. Mentee role required.' });
    }

    const { name, bio, skills } = req.body;

    const updatedMentee = await prisma.mentee.update({
      where: { id: userId },
      data: {
        name,
        bio,
        skills: skills || []
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile: {
        id: updatedMentee.id,
        name: updatedMentee.name,
        bio: updatedMentee.bio,
        skills: updatedMentee.skills
      }
    });

  } catch (error) {
    console.error('Error updating mentee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as menteesRouter };
