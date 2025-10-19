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
exports.communitiesRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const router = express_1.default.Router();
exports.communitiesRouter = router;
// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};
// Get community categories based on real-time skills
router.get('/categories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all communities with their skills
        const communities = yield prisma_1.prisma.community.findMany({
            include: {
                members: true,
                _count: {
                    select: {
                        members: true,
                        posts: true
                    }
                }
            }
        });
        // Aggregate all skills from communities and their members
        const skillCounts = {};
        for (const community of communities) {
            const allSkills = [...community.skills];
            // Get skills from all members
            for (const member of community.members) {
                try {
                    if (member.userRole === 'mentor') {
                        const mentor = yield prisma_1.prisma.mentor.findUnique({
                            where: { id: member.userId },
                            select: { skills: true }
                        });
                        if (mentor === null || mentor === void 0 ? void 0 : mentor.skills) {
                            allSkills.push(...mentor.skills);
                        }
                    }
                    else if (member.userRole === 'mentee') {
                        const mentee = yield prisma_1.prisma.mentee.findUnique({
                            where: { id: member.userId },
                            select: { skills: true }
                        });
                        if (mentee === null || mentee === void 0 ? void 0 : mentee.skills) {
                            allSkills.push(...mentee.skills);
                        }
                    }
                }
                catch (error) {
                    console.error(`Error fetching skills for member ${member.userId}:`, error);
                }
            }
            // Count each skill
            const uniqueSkills = [...new Set(allSkills)];
            for (const skill of uniqueSkills) {
                if (!skillCounts[skill]) {
                    skillCounts[skill] = { count: 0, communities: [] };
                }
                skillCounts[skill].count += 1;
                skillCounts[skill].communities.push(community.name);
            }
        }
        // Convert to array and sort by count
        const categories = Object.entries(skillCounts)
            .map(([skill, data]) => ({
            name: skill,
            count: data.count,
            communities: data.communities.slice(0, 3) // Show up to 3 example communities
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20); // Top 20 categories
        res.json(categories);
    }
    catch (error) {
        console.error('Error fetching community categories:', error);
        res.status(500).json({ error: 'Failed to fetch community categories' });
    }
}));
// Get all communities with real-time skills from members
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const communities = yield prisma_1.prisma.community.findMany({
            include: {
                members: {
                    include: Object.assign({}, (req.query.includeSkills === 'true' && {
                    // We'll need to fetch member skills based on their role
                    }))
                },
                _count: {
                    select: {
                        members: true,
                        posts: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // For each community, aggregate skills from all members
        const communitiesWithRealTimeSkills = yield Promise.all(communities.map((community) => __awaiter(void 0, void 0, void 0, function* () {
            const memberSkills = [];
            // Get skills from all members
            for (const member of community.members) {
                try {
                    if (member.userRole === 'mentor') {
                        const mentor = yield prisma_1.prisma.mentor.findUnique({
                            where: { id: member.userId },
                            select: { skills: true }
                        });
                        if (mentor === null || mentor === void 0 ? void 0 : mentor.skills) {
                            memberSkills.push(...mentor.skills);
                        }
                    }
                    else if (member.userRole === 'mentee') {
                        const mentee = yield prisma_1.prisma.mentee.findUnique({
                            where: { id: member.userId },
                            select: { skills: true }
                        });
                        if (mentee === null || mentee === void 0 ? void 0 : mentee.skills) {
                            memberSkills.push(...mentee.skills);
                        }
                    }
                }
                catch (error) {
                    console.error(`Error fetching skills for member ${member.userId}:`, error);
                }
            }
            // Combine community's original skills with member skills
            const allSkills = [...new Set([...community.skills, ...memberSkills])];
            return Object.assign(Object.assign({}, community), { skills: allSkills, memberSkills: memberSkills // Keep track of member-contributed skills
             });
        })));
        res.json(communitiesWithRealTimeSkills);
    }
    catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({ error: 'Failed to fetch communities' });
    }
}));
// Get community by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const community = yield prisma_1.prisma.community.findUnique({
            where: { id: parseInt(id) },
            include: {
                members: true,
                posts: {
                    include: {
                        votes: true,
                        _count: {
                            select: {
                                votes: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        members: true,
                        posts: true
                    }
                }
            }
        });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }
        res.json(community);
    }
    catch (error) {
        console.error('Error fetching community:', error);
        res.status(500).json({ error: 'Failed to fetch community' });
    }
}));
// Check if user is a member of a community
router.get('/:id/membership', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;
        const member = yield prisma_1.prisma.communityMember.findFirst({
            where: {
                communityId: parseInt(id),
                userId: userId,
                userRole: role
            }
        });
        res.json({ isMember: !!member });
    }
    catch (error) {
        console.error('Error checking membership:', error);
        res.status(500).json({ error: 'Failed to check membership' });
    }
}));
// Create a new community
router.post('/', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, skills } = req.body;
        const { userId, role } = req.user;
        if (!name) {
            return res.status(400).json({ error: 'Community name is required' });
        }
        // Check if community name already exists
        const existingCommunity = yield prisma_1.prisma.community.findUnique({
            where: { name }
        });
        if (existingCommunity) {
            return res.status(400).json({ error: 'Community name already exists' });
        }
        const community = yield prisma_1.prisma.community.create({
            data: {
                name,
                description: description || '',
                skills: skills || [],
                createdBy: userId
            }
        });
        // Add creator as first member
        yield prisma_1.prisma.communityMember.create({
            data: {
                communityId: community.id,
                userRole: role,
                userId: userId
            }
        });
        res.status(201).json(community);
    }
    catch (error) {
        console.error('Error creating community:', error);
        res.status(500).json({ error: 'Failed to create community' });
    }
}));
// Join a community
router.post('/:id/join', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;
        // Check if community exists
        const community = yield prisma_1.prisma.community.findUnique({
            where: { id: parseInt(id) }
        });
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }
        // Check if user is already a member
        const existingMember = yield prisma_1.prisma.communityMember.findFirst({
            where: {
                communityId: parseInt(id),
                userId: userId,
                userRole: role
            }
        });
        if (existingMember) {
            return res.status(400).json({ error: 'Already a member of this community' });
        }
        const member = yield prisma_1.prisma.communityMember.create({
            data: {
                communityId: parseInt(id),
                userRole: role,
                userId: userId
            }
        });
        res.status(201).json({ message: 'Successfully joined community', member });
    }
    catch (error) {
        console.error('Error joining community:', error);
        res.status(500).json({ error: 'Failed to join community' });
    }
}));
// Leave a community
router.delete('/:id/leave', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;
        const member = yield prisma_1.prisma.communityMember.findFirst({
            where: {
                communityId: parseInt(id),
                userId: userId,
                userRole: role
            }
        });
        if (!member) {
            return res.status(404).json({ error: 'Not a member of this community' });
        }
        yield prisma_1.prisma.communityMember.delete({
            where: {
                id: member.id
            }
        });
        res.json({ message: 'Successfully left community' });
    }
    catch (error) {
        console.error('Error leaving community:', error);
        res.status(500).json({ error: 'Failed to leave community' });
    }
}));
// Create a post in a community
router.post('/:id/posts', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, content, imageUrls } = req.body;
        const { userId, role } = req.user;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        // Check if user is a member of the community
        const member = yield prisma_1.prisma.communityMember.findFirst({
            where: {
                communityId: parseInt(id),
                userId: userId,
                userRole: role
            }
        });
        if (!member) {
            return res.status(403).json({ error: 'Must be a member to post in this community' });
        }
        const post = yield prisma_1.prisma.communityPost.create({
            data: {
                communityId: parseInt(id),
                userRole: role,
                userId: userId,
                title,
                content,
                imageUrls: imageUrls || []
            }
        });
        res.status(201).json(post);
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
}));
// Get posts in a community
router.get('/:id/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        // Check if user is authenticated (optional for viewing posts)
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
                // Token invalid, but still allow viewing posts
            }
        }
        const posts = yield prisma_1.prisma.communityPost.findMany({
            where: { communityId: parseInt(id) },
            include: {
                votes: true,
                _count: {
                    select: {
                        votes: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });
        // Fetch user details for each post
        const postsWithUserDetails = yield Promise.all(posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
            let userName = `User${post.userId}`;
            try {
                if (post.userRole === 'mentor') {
                    const mentor = yield prisma_1.prisma.mentor.findUnique({
                        where: { id: post.userId },
                        select: { name: true }
                    });
                    if (mentor)
                        userName = mentor.name;
                }
                else if (post.userRole === 'mentee') {
                    const mentee = yield prisma_1.prisma.mentee.findUnique({
                        where: { id: post.userId },
                        select: { name: true }
                    });
                    if (mentee)
                        userName = mentee.name;
                }
            }
            catch (error) {
                console.error('Error fetching user details:', error);
            }
            return Object.assign(Object.assign({}, post), { userName });
        })));
        // Add user vote status to each post
        const postsWithUserVotes = postsWithUserDetails.map(post => {
            let userVote = null;
            if (currentUserId && currentUserRole) {
                const userVoteRecord = post.votes.find(vote => vote.userId === currentUserId && vote.userRole === currentUserRole);
                userVote = userVoteRecord ? userVoteRecord.voteType : null;
            }
            return Object.assign(Object.assign({}, post), { userVote });
        });
        res.json(postsWithUserVotes);
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
}));
// Vote on a community post
router.post('/:communityId/posts/:postId/vote', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { communityId, postId } = req.params;
        const { voteType } = req.body; // 'upvote' or 'downvote'
        const { userId, role } = req.user;
        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({ error: 'Vote type must be upvote or downvote' });
        }
        // Check if user is a member
        const member = yield prisma_1.prisma.communityMember.findFirst({
            where: {
                communityId: parseInt(communityId),
                userId: userId,
                userRole: role
            }
        });
        if (!member) {
            return res.status(403).json({ error: 'Must be a member to vote' });
        }
        // Check if user already voted
        const existingVote = yield prisma_1.prisma.communityPostVote.findFirst({
            where: {
                userId: userId,
                postId: parseInt(postId),
                userRole: role
            }
        });
        if (existingVote) {
            // If user clicks the same vote type, remove the vote
            if (existingVote.voteType === voteType) {
                yield prisma_1.prisma.communityPostVote.delete({
                    where: { id: existingVote.id }
                });
                res.json({ message: 'Vote removed successfully' });
            }
            else {
                // Update existing vote to new type
                yield prisma_1.prisma.communityPostVote.update({
                    where: { id: existingVote.id },
                    data: { voteType: voteType }
                });
                res.json({ message: 'Vote updated successfully' });
            }
        }
        else {
            // Create new vote
            yield prisma_1.prisma.communityPostVote.create({
                data: {
                    userRole: role,
                    userId: userId,
                    postId: parseInt(postId),
                    voteType: voteType
                }
            });
            res.json({ message: 'Vote recorded successfully' });
        }
    }
    catch (error) {
        console.error('Error voting on post:', error);
        res.status(500).json({ error: 'Failed to vote on post' });
    }
}));
// Search communities
router.get('/search/:query', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.params;
        const communities = yield prisma_1.prisma.community.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { skills: { hasSome: [query] } }
                ]
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        posts: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(communities);
    }
    catch (error) {
        console.error('Error searching communities:', error);
        res.status(500).json({ error: 'Failed to search communities' });
    }
}));
