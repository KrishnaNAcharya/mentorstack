import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';

const router = express.Router();

// Signup route
router.post('/signup', async (req: any, res: any) => {
    try {
        const { email, password, role, firstName, lastName, skills = [], bio = '' } = req.body;

        // Check if user already exists
        const existingAuth = await prisma.authCredentials.findUnique({
            where: { email }
        });

        if (existingAuth) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Combine firstName and lastName into name field
        const fullName = `${firstName} ${lastName}`.trim();

        // Create user based on role
        let newUser;
        let authCredentials;

        if (role === 'mentor') {
            newUser = await prisma.mentor.create({
                data: {
                    name: fullName,
                    bio,
                    skills: skills, // Already a string array
                }
            });

            authCredentials = await prisma.authCredentials.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'mentor',
                    userId: newUser.id
                }
            });
        } else if (role === 'mentee') {
            newUser = await prisma.mentee.create({
                data: {
                    name: fullName,
                    bio,
                    skills: skills, // Already a string array
                }
            });

            authCredentials = await prisma.authCredentials.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'mentee',
                    userId: newUser.id
                }
            });
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: authCredentials.email,
                role: authCredentials.role 
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
                email: authCredentials.email,
                role: authCredentials.role
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
        const authRecord = await prisma.authCredentials.findUnique({
            where: { email }
        });

        if (!authRecord) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, authRecord.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Get user data based on role
        let userData;
        if (authRecord.role === 'mentor') {
            userData = await prisma.mentor.findUnique({
                where: { id: authRecord.userId }
            });
        } else if (authRecord.role === 'mentee') {
            userData = await prisma.mentee.findUnique({
                where: { id: authRecord.userId }
            });
        } else if (authRecord.role === 'admin') {
            userData = await prisma.admin.findUnique({
                where: { id: authRecord.userId }
            });
        }

        if (!userData) {
            return res.status(400).json({ message: 'User data not found' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: userData.id, 
                email: authRecord.email,
                role: authRecord.role 
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: userData.id,
                name: userData.name,
                email: authRecord.email,
                role: authRecord.role
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
        
        // Find auth record
        const authRecord = await prisma.authCredentials.findUnique({
            where: { email: decoded.email }
        });

        if (!authRecord) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user data based on role
        let userData;
        if (authRecord.role === 'mentor') {
            userData = await prisma.mentor.findUnique({
                where: { id: authRecord.userId }
            });
        } else if (authRecord.role === 'mentee') {
            userData = await prisma.mentee.findUnique({
                where: { id: authRecord.userId }
            });
        } else if (authRecord.role === 'admin') {
            userData = await prisma.admin.findUnique({
                where: { id: authRecord.userId }
            });
        }

        if (!userData) {
            return res.status(404).json({ message: 'User data not found' });
        }

        res.json({
            user: {
                id: userData.id,
                name: userData.name,
                email: authRecord.email,
                role: authRecord.role
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
});

export default router;
