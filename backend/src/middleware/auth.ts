import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { Role } from '@prisma/client';

const router = express.Router();

// Signup route
router.post('/signup', async (req: any, res: any) => {
    try {
        const { email, password, role, firstName, lastName, skills = [], bio = '' } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate role
        if (!['mentor', 'mentee', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Combine firstName and lastName into name field
        const fullName = `${firstName} ${lastName}`.trim();

        // Create user with role
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role as Role,
                name: fullName,
                bio,
                skills: skills,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                bio: true,
                skills: true,
                avatarUrl: true
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email,
                role: newUser.role 
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', async (req: any, res: any) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user route
router.get('/me', async (req: any, res: any) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: decoded.email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                bio: true,
                skills: true,
                avatarUrl: true,
                jobTitle: true,
                department: true,
                location: true,
                reputation: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                skills: user.skills,
                avatarUrl: user.avatarUrl,
                jobTitle: user.jobTitle,
                department: user.department,
                location: user.location,
                reputation: user.reputation
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
});

export default router;
