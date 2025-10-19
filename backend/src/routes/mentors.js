"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentorsRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const router = express_1.default.Router();
exports.mentorsRouter = router;
// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};
// Get all mentors
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mentors = yield prisma_1.prisma.mentor.findMany({
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
    }
    catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get mentor profile by ID
router.get('/:id', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mentorId = parseInt(req.params.id);
        const mentor = yield prisma_1.prisma.mentor.findUnique({
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
        const authCredentials = yield prisma_1.prisma.authCredentials.findFirst({
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
            email: (authCredentials === null || authCredentials === void 0 ? void 0 : authCredentials.email) || '',
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
    }
    catch (error) {
        console.error('Error fetching mentor profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get current mentor profile (authenticated user)
router.get('/profile/me', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        if (userRole !== 'mentor') {
            return res.status(403).json({ message: 'Access denied. Mentor role required.' });
        }
        const mentor = yield prisma_1.prisma.mentor.findUnique({
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
        const authCredentials = yield prisma_1.prisma.authCredentials.findFirst({
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
            email: (authCredentials === null || authCredentials === void 0 ? void 0 : authCredentials.email) || '',
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
    }
    catch (error) {
        console.error('Error fetching mentor profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Update mentor profile
router.put('/profile/me', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        if (userRole !== 'mentor') {
            return res.status(403).json({ message: 'Access denied. Mentor role required.' });
        }
        const { name, bio, skills, location } = req.body;
        const updatedMentor = yield prisma_1.prisma.mentor.update({
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
    }
    catch (error) {
        console.error('Error updating mentor profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
