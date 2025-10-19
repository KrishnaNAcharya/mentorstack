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
exports.menteesRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const router = express_1.default.Router();
exports.menteesRouter = router;
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
// Get all mentees
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mentees = yield prisma_1.prisma.mentee.findMany({
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
    }
    catch (error) {
        console.error('Error fetching mentees:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get mentee profile by ID
router.get('/:id', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const menteeId = parseInt(req.params.id);
        const mentee = yield prisma_1.prisma.mentee.findUnique({
            where: { id: menteeId },
            include: {
                questions: {
                    orderBy: { createdAt: 'desc' }
                },
                mentorshipRequests: true
            }
        });
        if (!mentee) {
            return res.status(404).json({ message: 'Mentee not found' });
        }
        // Get auth credentials for email
        const authCredentials = yield prisma_1.prisma.authCredentials.findFirst({
            where: { userId: menteeId, role: 'mentee' },
            select: { email: true }
        });
        // Calculate stats
        const stats = {
            questionsAsked: mentee.questions.length,
            mentorshipRequestsCount: mentee.mentorshipRequests.length
        };
        res.json({
            id: mentee.id,
            name: mentee.name,
            email: (authCredentials === null || authCredentials === void 0 ? void 0 : authCredentials.email) || '',
            bio: mentee.bio,
            skills: mentee.skills,
            reputation: mentee.reputation,
            joinedDate: mentee.createdAt,
            questions: mentee.questions,
            stats
        });
    }
    catch (error) {
        console.error('Error fetching mentee profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get current mentee profile (authenticated user)
router.get('/profile/me', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        if (userRole !== 'mentee') {
            return res.status(403).json({ message: 'Access denied. Mentee role required.' });
        }
        const mentee = yield prisma_1.prisma.mentee.findUnique({
            where: { id: userId },
            include: {
                questions: {
                    orderBy: { createdAt: 'desc' }
                },
                mentorshipRequests: true
            }
        });
        if (!mentee) {
            return res.status(404).json({ message: 'Mentee profile not found' });
        }
        // Get auth credentials for email
        const authCredentials = yield prisma_1.prisma.authCredentials.findFirst({
            where: { userId: userId, role: 'mentee' },
            select: { email: true }
        });
        // Calculate stats
        const stats = {
            questionsAsked: mentee.questions.length,
            mentorshipRequestsCount: mentee.mentorshipRequests.length
        };
        res.json({
            id: mentee.id,
            name: mentee.name,
            email: (authCredentials === null || authCredentials === void 0 ? void 0 : authCredentials.email) || '',
            bio: mentee.bio,
            skills: mentee.skills,
            reputation: mentee.reputation,
            joinedDate: mentee.createdAt,
            questions: mentee.questions,
            stats
        });
    }
    catch (error) {
        console.error('Error fetching mentee profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Update mentee profile
router.put('/profile/me', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        if (userRole !== 'mentee') {
            return res.status(403).json({ message: 'Access denied. Mentee role required.' });
        }
        const { name, bio, skills } = req.body;
        const updatedMentee = yield prisma_1.prisma.mentee.update({
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
    }
    catch (error) {
        console.error('Error updating mentee profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
