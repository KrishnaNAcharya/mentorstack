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

// Get all mentees
router.get('/', async (req, res) => {
  try {
    const mentees = await prisma.user.findMany({
      where: { role: Role.mentee },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        skills: true,
        reputation: true,
        jobTitle: true,
        department: true,
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
    
    const mentee = await prisma.user.findFirst({
      where: { 
        id: menteeId,
        role: Role.mentee 
      },
      include: {
        questions: {
          orderBy: { createdAt: 'desc' }
        },
        menteeRequests: true
      }
    });

    if (!mentee) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    // Calculate stats
    const stats = {
      questionsAsked: mentee.questions.length,
      mentorshipRequestsCount: mentee.menteeRequests.length
    };

    res.json({
      id: mentee.id,
      name: mentee.name,
      email: mentee.email,
      bio: mentee.bio,
      skills: mentee.skills,
      jobTitle: mentee.jobTitle,
      department: mentee.department,
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

    const mentee = await prisma.user.findFirst({
      where: { 
        id: userId,
        role: Role.mentee 
      },
      include: {
        questions: {
          orderBy: { createdAt: 'desc' }
        },
        menteeRequests: true
      }
    });

    if (!mentee) {
      return res.status(404).json({ message: 'Mentee profile not found' });
    }

    // Calculate stats
    const stats = {
      questionsAsked: mentee.questions.length,
      mentorshipRequestsCount: mentee.menteeRequests.length
    };

    res.json({
      id: mentee.id,
      name: mentee.name,
      email: mentee.email,
      bio: mentee.bio,
      skills: mentee.skills,
      jobTitle: mentee.jobTitle,
      department: mentee.department,
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

    const { name, bio, skills, jobTitle, department, avatarUrl, location } = req.body;

    const updatedMentee = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(skills && { skills }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(department !== undefined && { department }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(location !== undefined && { location })
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile: {
        id: updatedMentee.id,
        name: updatedMentee.name,
        email: updatedMentee.email,
        bio: updatedMentee.bio,
        skills: updatedMentee.skills,
        jobTitle: updatedMentee.jobTitle,
        department: updatedMentee.department,
        avatarUrl: updatedMentee.avatarUrl,
        location: updatedMentee.location
      }
    });

  } catch (error) {
    console.error('Error updating mentee profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as menteesRouter };
