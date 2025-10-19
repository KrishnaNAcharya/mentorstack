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
exports.questionsRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const router = express_1.default.Router();
exports.questionsRouter = router;
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
// Get all questions (simplified)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questions = yield prisma_1.prisma.question.findMany({
            include: {
                mentee: true,
                answers: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const formattedQuestions = questions.map((question) => ({
            id: question.id,
            title: question.title,
            description: question.body,
            tags: [],
            createdAt: question.createdAt,
            authorName: question.mentee.name,
            answerCount: question.answers.length,
            voteScore: 0
        }));
        res.json(formattedQuestions);
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get question by ID (simplified)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionId = parseInt(req.params.id);
        const question = yield prisma_1.prisma.question.findUnique({
            where: { id: questionId },
            include: {
                mentee: true,
                answers: true
            }
        });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        // Get author names for answers
        const mentorIds = question.answers.filter((a) => a.userRole === 'mentor').map((a) => a.userId);
        const menteeIds = question.answers.filter((a) => a.userRole === 'mentee').map((a) => a.userId);
        const mentors = mentorIds.length > 0 ? yield prisma_1.prisma.mentor.findMany({
            where: { id: { in: mentorIds } },
            select: { id: true, name: true }
        }) : [];
        const mentees = menteeIds.length > 0 ? yield prisma_1.prisma.mentee.findMany({
            where: { id: { in: menteeIds } },
            select: { id: true, name: true }
        }) : [];
        const mentorLookup = new Map(mentors.map((m) => [m.id, m.name]));
        const menteeLookup = new Map(mentees.map((m) => [m.id, m.name]));
        const formattedQuestion = {
            id: question.id,
            title: question.title,
            description: question.body,
            tags: [],
            createdAt: question.createdAt,
            authorName: question.mentee.name,
            voteScore: 0,
            answers: question.answers.map((answer) => {
                let authorName = 'Unknown';
                if (answer.userRole === 'mentor') {
                    authorName = mentorLookup.get(answer.userId) || 'Unknown';
                }
                else if (answer.userRole === 'mentee') {
                    authorName = menteeLookup.get(answer.userId) || 'Unknown';
                }
                return {
                    id: answer.id,
                    content: answer.body,
                    createdAt: answer.createdAt,
                    authorName: authorName,
                    voteScore: 0
                };
            })
        };
        res.json(formattedQuestion);
    }
    catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Create answer for a question
router.post('/:questionId/answers', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const question = yield prisma_1.prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        // Create the answer using raw SQL to bypass Prisma type issues
        const result = yield prisma_1.prisma.$executeRaw `
      INSERT INTO "Answer" (body, "questionId", "userId", "userRole", "createdAt", "updatedAt")
      VALUES (${content.trim()}, ${questionId}, ${userId}, ${role}::"Role", NOW(), NOW())
      RETURNING id
    `;
        console.log('Answer created via raw SQL:', result);
        // Get author name based on role
        let authorName = 'Unknown';
        if (role === 'mentor') {
            const mentor = yield prisma_1.prisma.mentor.findUnique({
                where: { id: userId },
                select: { name: true }
            });
            authorName = (mentor === null || mentor === void 0 ? void 0 : mentor.name) || 'Unknown';
        }
        else if (role === 'mentee') {
            const mentee = yield prisma_1.prisma.mentee.findUnique({
                where: { id: userId },
                select: { name: true }
            });
            authorName = (mentee === null || mentee === void 0 ? void 0 : mentee.name) || 'Unknown';
        }
        const responseAnswer = {
            id: 'created',
            content: content.trim(),
            authorName: authorName,
            createdAt: new Date(),
            voteScore: 0
        };
        res.status(201).json({
            message: 'Answer created successfully',
            answer: responseAnswer
        });
    }
    catch (error) {
        console.error('Error creating answer:', error);
        res.status(500).json({ error: 'Failed to create answer', details: error.message });
    }
}));
