import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';

// Define role type locally to match Prisma schema
type UserRole = 'mentor' | 'mentee' | 'admin';

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  bio?: string;
  location?: string;
  skills: string[];
  role: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

const router = Router();

// Signup endpoint
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, bio, location, skills, role } = req.body as SignupRequest;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        error: 'Email, password, name, and role are required'
      });
    }

    // Validate role
    if (!['mentor', 'mentee', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be mentor, mentee, or admin'
      });
    }

    // Check if user already exists
    const existingAuth = await prisma.authCredentials.findUnique({
      where: { email }
    });

    if (existingAuth) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user based on role
    let userData;
    if (role === 'mentor') {
      userData = await prisma.mentor.create({
        data: {
          name,
          bio: bio || '',
          location: location || '',
          skills: skills || []
        }
      });
    } else if (role === 'mentee') {
      userData = await prisma.mentee.create({
        data: {
          name,
          bio: bio || '',
          location: location || '',
          skills: skills || []
        }
      });
    } else if (role === 'admin') {
      userData = await prisma.admin.create({
        data: {
          name
        }
      });
    }

    if (!userData) {
      return res.status(500).json({
        error: 'Failed to create user profile'
      });
    }

    // Create auth credentials
    const authCredentials = await prisma.authCredentials.create({
      data: {
        email,
        password: hashedPassword,
        role,
        userId: userData.id
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.id, 
        email: authCredentials.email, 
        role: authCredentials.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user data without password
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userData.id,
        name: userData.name,
        email: authCredentials.email,
        role: authCredentials.role,
        bio: 'bio' in userData ? userData.bio : undefined,
        location: 'location' in userData ? userData.location : undefined,
        skills: 'skills' in userData ? userData.skills : undefined
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error during signup'
    });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find auth credentials
    const authCredentials = await prisma.authCredentials.findUnique({
      where: { email }
    });

    if (!authCredentials) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, authCredentials.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Get user data based on role
    let userData;
    if (authCredentials.role === 'mentor') {
      userData = await prisma.mentor.findUnique({
        where: { id: authCredentials.userId }
      });
    } else if (authCredentials.role === 'mentee') {
      userData = await prisma.mentee.findUnique({
        where: { id: authCredentials.userId }
      });
    } else if (authCredentials.role === 'admin') {
      userData = await prisma.admin.findUnique({
        where: { id: authCredentials.userId }
      });
    }

    if (!userData) {
      return res.status(404).json({
        error: 'User profile not found'
      });
    }

    // Update last login
    await prisma.authCredentials.update({
      where: { email },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userData.id, 
        email: authCredentials.email, 
        role: authCredentials.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user data
    res.json({
      message: 'Login successful',
      user: {
        id: userData.id,
        name: userData.name,
        email: authCredentials.email,
        role: authCredentials.role,
        bio: 'bio' in userData ? userData.bio : undefined,
        location: 'location' in userData ? userData.location : undefined,
        skills: 'skills' in userData ? userData.skills : undefined
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login'
    });
  }
});

// Get current user endpoint (protected)
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Get user data based on role
    let userData;
    if (decoded.role === 'mentor') {
      userData = await prisma.mentor.findUnique({
        where: { id: decoded.userId }
      });
    } else if (decoded.role === 'mentee') {
      userData = await prisma.mentee.findUnique({
        where: { id: decoded.userId }
      });
    } else if (decoded.role === 'admin') {
      userData = await prisma.admin.findUnique({
        where: { id: decoded.userId }
      });
    }

    if (!userData) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: decoded.email,
        role: decoded.role,
        bio: 'bio' in userData ? userData.bio : undefined,
        location: 'location' in userData ? userData.location : undefined,
        skills: 'skills' in userData ? userData.skills : undefined
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;
