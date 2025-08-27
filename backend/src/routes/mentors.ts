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

// Get all mentors
router.get('/', async (req, res) => {
  try {
    const mentors = await prisma.mentor.findMany({
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        skills: true,
        location: true,
        reputation: true,
        createdAt: true
      }
    });
    res.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get mentor profile by ID
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const mentorId = parseInt(req.params.id);

    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                createdAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        articles: {
          orderBy: { createdAt: 'desc' }
        },
        connections: {
          include: {
            mentee: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        mentorshipRequests: {
          include: {
            mentee: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Get auth credentials for email
    const authCredentials = await prisma.authCredentials.findFirst({
      where: { userId: mentorId, role: 'mentor' },
      select: { email: true }
    });

    // Calculate stats
    const stats = {
      answersProvided: mentor.answers.length,
      articlesWritten: mentor.articles.length,
      menteesConnected: mentor.connections.length,
      mentorshipRequests: mentor.mentorshipRequests.length
    };

    res.json({
      id: mentor.id,
      name: mentor.name,
      email: authCredentials?.email || '',
      bio: mentor.bio,
      avatarUrl: mentor.avatarUrl,
      skills: mentor.skills,
      location: mentor.location,
      reputation: mentor.reputation,
      joinedDate: mentor.createdAt,
      answers: mentor.answers,
      articles: mentor.articles,
      connections: mentor.connections,
      mentorshipRequests: mentor.mentorshipRequests,
      stats
    });

  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current mentor profile (authenticated user)
router.get('/profile/me', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole !== 'mentor') {
      return res.status(403).json({ message: 'Access denied. Mentor role required.' });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { id: userId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                createdAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        articles: {
          orderBy: { createdAt: 'desc' }
        },
        connections: {
          include: {
            mentee: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        mentorshipRequests: {
          include: {
            mentee: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }

    // Get auth credentials for email
    const authCredentials = await prisma.authCredentials.findFirst({
      where: { userId: userId, role: 'mentor' },
      select: { email: true }
    });

    // Calculate stats
    const stats = {
      answersProvided: mentor.answers.length,
      articlesWritten: mentor.articles.length,
      menteesConnected: mentor.connections.length,
      mentorshipRequests: mentor.mentorshipRequests.length
    };

    res.json({
      id: mentor.id,
      name: mentor.name,
      email: authCredentials?.email || '',
      bio: mentor.bio,
      avatarUrl: mentor.avatarUrl,
      skills: mentor.skills,
      location: mentor.location,
      reputation: mentor.reputation,
      joinedDate: mentor.createdAt,
      answers: mentor.answers,
      articles: mentor.articles,
      connections: mentor.connections,
      mentorshipRequests: mentor.mentorshipRequests,
      stats
    });

  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mentor profile
router.put('/profile/me', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole !== 'mentor') {
      return res.status(403).json({ message: 'Access denied. Mentor role required.' });
    }

    const { name, bio, skills, location } = req.body;

    const updatedMentor = await prisma.mentor.update({
      where: { id: userId },
      data: {
        name,
        bio,
        skills: skills || [],
        location
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile: {
        id: updatedMentor.id,
        name: updatedMentor.name,
        bio: updatedMentor.bio,
        skills: updatedMentor.skills,
        location: updatedMentor.location
      }
    });

  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as mentorsRouter };
