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
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const router = express_1.default.Router();
// Signup route
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role, firstName, lastName, skills = [], bio = '' } = req.body;
        // Check if user already exists
        const existingAuth = yield prisma_1.prisma.authCredentials.findUnique({
            where: { email }
        });
        if (existingAuth) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        // Combine firstName and lastName into name field
        const fullName = `${firstName} ${lastName}`.trim();
        // Create user based on role
        let newUser;
        let authCredentials;
        if (role === 'mentor') {
            newUser = yield prisma_1.prisma.mentor.create({
                data: {
                    name: fullName,
                    bio,
                    skills: skills,
                }
            });
            authCredentials = yield prisma_1.prisma.authCredentials.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'mentor',
                    userId: newUser.id
                }
            });
        }
        else if (role === 'mentee') {
            newUser = yield prisma_1.prisma.mentee.create({
                data: {
                    name: fullName,
                    bio,
                    skills: skills,
                }
            });
            authCredentials = yield prisma_1.prisma.authCredentials.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'mentee',
                    userId: newUser.id
                }
            });
        }
        else {
            return res.status(400).json({ message: 'Invalid role' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: newUser.id,
            email: authCredentials.email,
            role: authCredentials.role
        }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Login route
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const authRecord = yield prisma_1.prisma.authCredentials.findUnique({
            where: { email }
        });
        if (!authRecord) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Check password
        const isPasswordValid = yield bcryptjs_1.default.compare(password, authRecord.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Get user data based on role
        let userData;
        if (authRecord.role === 'mentor') {
            userData = yield prisma_1.prisma.mentor.findUnique({
                where: { id: authRecord.userId }
            });
        }
        else if (authRecord.role === 'mentee') {
            userData = yield prisma_1.prisma.mentee.findUnique({
                where: { id: authRecord.userId }
            });
        }
        else if (authRecord.role === 'admin') {
            userData = yield prisma_1.prisma.admin.findUnique({
                where: { id: authRecord.userId }
            });
        }
        if (!userData) {
            return res.status(400).json({ message: 'User data not found' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: userData.id,
            email: authRecord.email,
            role: authRecord.role
        }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get current user route
router.get('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get token from header
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        // Find auth record
        const authRecord = yield prisma_1.prisma.authCredentials.findUnique({
            where: { email: decoded.email }
        });
        if (!authRecord) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Get user data based on role
        let userData;
        if (authRecord.role === 'mentor') {
            userData = yield prisma_1.prisma.mentor.findUnique({
                where: { id: authRecord.userId }
            });
        }
        else if (authRecord.role === 'mentee') {
            userData = yield prisma_1.prisma.mentee.findUnique({
                where: { id: authRecord.userId }
            });
        }
        else if (authRecord.role === 'admin') {
            userData = yield prisma_1.prisma.admin.findUnique({
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
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
}));
exports.default = router;
