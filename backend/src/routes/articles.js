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
exports.articlesRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../../lib/prisma");
const router = express_1.default.Router();
exports.articlesRouter = router;
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/articles/'); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
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
// Get all articles with proper category filtering
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const skip = (page - 1) * limit;
        const whereClause = {};
        // Filter by category/tag if provided
        if (category && category !== 'all') {
            whereClause.tags = {
                some: {
                    tag: {
                        name: {
                            contains: category.toLowerCase(),
                            mode: 'insensitive'
                        }
                    }
                }
            };
        }
        const articles = yield prisma_1.prisma.article.findMany({
            where: whereClause,
            include: {
                author: {
                    select: {
                        name: true,
                        bio: true,
                        avatarUrl: true
                    }
                },
                votes: true,
                tags: {
                    include: {
                        tag: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        votes: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        const formattedArticles = articles.map(article => {
            const upvotes = article.votes.filter(vote => vote.voteType === 'upvote').length;
            const downvotes = article.votes.filter(vote => vote.voteType === 'downvote').length;
            return {
                id: article.id,
                title: article.title,
                content: article.content,
                imageUrls: article.imageUrls,
                authorName: article.author.name,
                authorBio: article.author.bio,
                authorAvatar: article.author.avatarUrl,
                upvotes,
                downvotes,
                tags: article.tags.map(at => at.tag.name),
                createdAt: article.createdAt,
                updatedAt: article.updatedAt
            };
        });
        // Get total count for pagination
        const totalArticles = yield prisma_1.prisma.article.count({ where: whereClause });
        const totalPages = Math.ceil(totalArticles / limit);
        res.json({
            articles: formattedArticles,
            pagination: {
                currentPage: page,
                totalPages,
                totalArticles,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get popular tags/categories - MUST come before /:id route
router.get('/tags/popular', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get actual tags from the database with article counts
        const tagsWithCounts = yield prisma_1.prisma.tag.findMany({
            include: {
                _count: {
                    select: {
                        articles: true
                    }
                }
            },
            orderBy: {
                articles: {
                    _count: 'desc'
                }
            },
            take: 20 // Top 20 tags
        });
        const colors = [
            'bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-yellow-100',
            'bg-pink-100', 'bg-indigo-100', 'bg-gray-100', 'bg-red-100',
            'bg-teal-100', 'bg-orange-100'
        ];
        const popularTags = tagsWithCounts.map((tag, index) => ({
            name: tag.name,
            count: tag._count.articles,
            color: colors[index % colors.length]
        }));
        // If we don't have enough tags, add some default ones
        if (popularTags.length < 10) {
            const defaultTags = [
                { name: 'Web Development', count: 45, color: 'bg-blue-100' },
                { name: 'AI', count: 32, color: 'bg-purple-100' },
                { name: 'Cybersecurity', count: 28, color: 'bg-green-100' },
                { name: 'IoT', count: 25, color: 'bg-yellow-100' },
                { name: 'Frontend', count: 22, color: 'bg-pink-100' },
                { name: 'Backend', count: 20, color: 'bg-indigo-100' },
                { name: 'NLP', count: 18, color: 'bg-gray-100' },
                { name: 'Machine Learning', count: 15, color: 'bg-red-100' },
                { name: 'DevOps', count: 12, color: 'bg-teal-100' },
                { name: 'Mobile Development', count: 10, color: 'bg-orange-100' }
            ];
            // Add default tags that aren't already in our database
            const existingTagNames = popularTags.map(t => t.name.toLowerCase());
            const missingTags = defaultTags.filter(t => !existingTagNames.includes(t.name.toLowerCase()));
            popularTags.push(...missingTags.slice(0, 10 - popularTags.length));
        }
        res.json(popularTags);
    }
    catch (error) {
        console.error('Error fetching popular tags:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get article by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articleId = parseInt(req.params.id);
        // Check for optional auth token to include user vote
        let currentUserId = null;
        let currentUserRole = null;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
                currentUserId = decoded.userId;
                currentUserRole = decoded.role;
            }
            catch (err) {
                // ignore invalid token and continue without user vote
            }
        }
        const article = yield prisma_1.prisma.article.findUnique({
            where: { id: articleId },
            include: {
                author: {
                    select: {
                        name: true,
                        bio: true,
                        avatarUrl: true
                    }
                },
                votes: true
            }
        });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const upvotes = article.votes.filter(vote => vote.voteType === 'upvote').length;
        const downvotes = article.votes.filter(vote => vote.voteType === 'downvote').length;
        // Determine current user's vote if available (only mentees can vote on articles)
        let userVote = null;
        if (currentUserId && currentUserRole === 'mentee') {
            const userVoteRecord = article.votes.find(v => v.menteeId === currentUserId);
            userVote = userVoteRecord ? userVoteRecord.voteType : null;
        }
        const formattedArticle = {
            id: article.id,
            title: article.title,
            content: article.content,
            imageUrls: article.imageUrls,
            authorName: article.author.name,
            authorBio: article.author.bio,
            authorAvatar: article.author.avatarUrl,
            upvotes,
            downvotes,
            userVote,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt
        };
        res.json(formattedArticle);
    }
    catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Create a new article (mentors only)
router.post('/', authenticateToken, upload.array('images', 5), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, tags } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;
        // Only mentors can create articles
        if (userRole !== 'mentor') {
            return res.status(403).json({ message: 'Only mentors can create articles' });
        }
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }
        // Handle uploaded images
        const imageUrls = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                // In production, you'd upload to cloud storage and get URLs
                // For now, we'll create local URLs
                const imageUrl = `/uploads/articles/${file.filename}`;
                imageUrls.push(imageUrl);
            }
        }
        // Parse tags if they're provided as a JSON string
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            }
            catch (error) {
                console.error('Error parsing tags:', error);
                parsedTags = [];
            }
        }
        // Create the article
        const article = yield prisma_1.prisma.article.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                authorId: userId,
                imageUrls: imageUrls
            },
            include: {
                author: {
                    select: {
                        name: true,
                        bio: true,
                        avatarUrl: true
                    }
                }
            }
        });
        // Create tags if they don't exist and link them to the article
        if (parsedTags.length > 0) {
            for (const tagName of parsedTags) {
                try {
                    // Find or create tag
                    let tag = yield prisma_1.prisma.tag.findUnique({
                        where: { name: tagName.toLowerCase().trim() }
                    });
                    if (!tag) {
                        tag = yield prisma_1.prisma.tag.create({
                            data: { name: tagName.toLowerCase().trim() }
                        });
                    }
                    // Link tag to article
                    yield prisma_1.prisma.articleTag.create({
                        data: {
                            articleId: article.id,
                            tagId: tag.id
                        }
                    });
                }
                catch (error) {
                    console.error(`Error creating/linking tag ${tagName}:`, error);
                    // Continue with other tags even if one fails
                }
            }
        }
        res.status(201).json({
            message: 'Article created successfully',
            article: {
                id: article.id,
                title: article.title,
                content: article.content,
                imageUrls: article.imageUrls,
                authorName: article.author.name,
                createdAt: article.createdAt,
                tags: parsedTags
            }
        });
    }
    catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'Server error', details: error === null || error === void 0 ? void 0 : error.message });
    }
}));
// Vote on an article
router.post('/:id/vote', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articleId = parseInt(req.params.id);
        const { voteType } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;
        // Only mentees can vote on articles
        if (userRole !== 'mentee') {
            return res.status(403).json({ message: 'Only mentees can vote on articles' });
        }
        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({ message: 'Invalid vote type' });
        }
        // Check if article exists
        const article = yield prisma_1.prisma.article.findUnique({
            where: { id: articleId }
        });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        // Check if user has already voted
        const existingVote = yield prisma_1.prisma.articleVote.findUnique({
            where: {
                menteeId_articleId: {
                    menteeId: userId,
                    articleId: articleId
                }
            }
        });
        if (existingVote) {
            // If user clicks the same vote type again, remove the vote (toggle off)
            if (existingVote.voteType === voteType) {
                yield prisma_1.prisma.articleVote.delete({
                    where: { id: existingVote.id }
                });
                return res.json({ message: 'Vote removed successfully' });
            }
            else {
                // Otherwise update the existing vote to the new type
                yield prisma_1.prisma.articleVote.update({
                    where: { id: existingVote.id },
                    data: { voteType: voteType }
                });
                return res.json({ message: 'Vote updated successfully' });
            }
        }
        // Create new vote
        yield prisma_1.prisma.articleVote.create({
            data: {
                menteeId: userId,
                articleId: articleId,
                voteType: voteType
            }
        });
        res.json({ message: 'Vote recorded successfully' });
    }
    catch (error) {
        console.error('Error voting on article:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
