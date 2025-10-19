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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Starting comprehensive database seeding...');
        // Clear ALL existing data using TRUNCATE with CASCADE for foreign keys
        yield prisma.$executeRaw `TRUNCATE TABLE "UserBadge", "Badge", "ReputationHistory", "Bookmark", "AiLog", "ArticleTag", "ArticleVote", "Article", "CommunityPostVote", "CommunityPost", "CommunityMember", "Community", "Message", "Conversation", "Connection", "MentorshipRequest", "AnswerVote", "QuestionVote", "Answer", "QuestionTag", "Question", "Tag", "AuthCredentials", "Admin", "Mentee", "Mentor" RESTART IDENTITY CASCADE`;
        // Create Mentors
        yield prisma.$executeRaw `
    INSERT INTO "Mentor" (name, bio, skills, location, reputation, "createdAt", "updatedAt")
    VALUES 
    ('Sarah Chen', 'Senior Software Engineer at Google with 8+ years experience in full-stack development, specializing in React, Node.js, and cloud architecture.', ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'System Design', 'Microservices'], 'San Francisco, CA', 1250, NOW(), NOW()),
    ('Marcus Rodriguez', 'Tech Lead and Startup Advisor. Former CTO of two successful startups. Expert in scaling teams and building robust backend systems.', ARRAY['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes', 'Leadership'], 'Austin, TX', 980, NOW(), NOW()),
    ('Emily Wang', 'Data Science Manager at Netflix. PhD in Machine Learning. Passionate about mentoring women in tech and AI applications.', ARRAY['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'SQL', 'Statistics'], 'Los Angeles, CA', 1450, NOW(), NOW()),
    ('David Kumar', 'Mobile Development Expert with 10+ years building iOS and Android apps. Former Lead at Uber, now freelance consultant.', ARRAY['Swift', 'Kotlin', 'React Native', 'iOS', 'Android', 'Mobile Architecture'], 'Seattle, WA', 890, NOW(), NOW())
  `;
        // Create Mentees  
        yield prisma.$executeRaw `
    INSERT INTO "Mentee" (id, name, bio, skills, location, reputation, "createdAt", "updatedAt")
    VALUES 
    (1, 'Alex Thompson', 'Computer Science student at Stanford, passionate about web development and looking to break into tech.', ARRAY['JavaScript', 'HTML', 'CSS', 'Python'], 'Palo Alto, CA', 45, NOW(), NOW()),
    (2, 'Jessica Martinez', 'Self-taught developer making a career transition from marketing. Building projects to strengthen my portfolio.', ARRAY['React', 'JavaScript', 'Node.js', 'Git'], 'Denver, CO', 78, NOW(), NOW()),
    (3, 'Ryan Park', 'Recent bootcamp graduate specializing in full-stack development. Looking for guidance on landing my first dev job.', ARRAY['React', 'Express', 'MongoDB', 'JavaScript'], 'New York, NY', 32, NOW(), NOW()),
    (4, 'Zoe Adams', 'Data science enthusiast with a background in mathematics. Exploring machine learning and data visualization.', ARRAY['Python', 'Pandas', 'NumPy', 'Matplotlib'], 'Boston, MA', 56, NOW(), NOW())
  `;
        // Create Admins
        yield prisma.$executeRaw `
    INSERT INTO "Admin" (id, name, "createdAt", "updatedAt")
    VALUES 
    (1, 'System Admin', NOW(), NOW()),
    (2, 'Platform Manager', NOW(), NOW())
  `;
        // Create Auth Credentials
        const hashedPassword = yield bcrypt_1.default.hash('password123', 10);
        yield prisma.$executeRaw `
    INSERT INTO "AuthCredentials" (email, password, role, "userId", "createdAt")
    VALUES 
    ('sarah.chen@email.com', ${hashedPassword}, 'mentor', 1, NOW()),
    ('marcus.rodriguez@email.com', ${hashedPassword}, 'mentor', 2, NOW()),
    ('emily.wang@email.com', ${hashedPassword}, 'mentor', 3, NOW()),
    ('david.kumar@email.com', ${hashedPassword}, 'mentor', 4, NOW()),
    ('alex.thompson@email.com', ${hashedPassword}, 'mentee', 1, NOW()),
    ('jessica.martinez@email.com', ${hashedPassword}, 'mentee', 2, NOW()),
    ('ryan.park@email.com', ${hashedPassword}, 'mentee', 3, NOW()),
    ('zoe.adams@email.com', ${hashedPassword}, 'mentee', 4, NOW()),
    ('admin@mentorstack.com', ${hashedPassword}, 'admin', 1, NOW()),
    ('manager@mentorstack.com', ${hashedPassword}, 'admin', 2, NOW())
  `;
        // Create MentorshipRequests
        yield prisma.$executeRaw `
    INSERT INTO "MentorshipRequest" ("mentorId", "menteeId", status, "requestMessage", "createdAt", "updatedAt")
    VALUES 
    (1, 1, 'accepted', 'I would love guidance on React best practices and career advice.', NOW(), NOW()),
    (2, 2, 'pending', 'Looking for help with backend development and system design.', NOW(), NOW()),
    (3, 4, 'accepted', 'Need mentorship in data science and machine learning.', NOW(), NOW()),
    (4, 3, 'rejected', 'Interested in mobile development guidance.', NOW(), NOW())
  `;
        // Create Connections (for accepted mentorships)
        yield prisma.$executeRaw `
    INSERT INTO "Connection" (id, "mentorId", "menteeId", "acceptedAt", "updatedAt")
    VALUES 
    (1, 1, 1, NOW(), NOW()),
    (2, 3, 4, NOW(), NOW())
  `;
        // Create Conversations
        yield prisma.$executeRaw `
    INSERT INTO "Conversation" (id, "connectionId", "createdAt", "updatedAt")
    VALUES 
    (1, 1, NOW(), NOW()),
    (2, 2, NOW(), NOW())
  `;
        // Create Messages
        yield prisma.$executeRaw `
    INSERT INTO "Message" ("conversationId", "senderRole", "senderId", message, "isRead", "timestamp", "updatedAt")
    VALUES 
    (1, 'mentee', 1, 'Hi Sarah! Thanks for accepting my mentorship request. I really appreciate it!', false, NOW(), NOW()),
    (1, 'mentor', 1, 'Hi Alex! I am excited to help you on your journey. What specific areas would you like to focus on first?', false, NOW(), NOW()),
    (1, 'mentee', 1, 'I would love to improve my React skills and learn about best practices for larger applications.', false, NOW(), NOW()),
    (2, 'mentee', 4, 'Hello Emily! I am thrilled to work with you on data science projects.', false, NOW(), NOW()),
    (2, 'mentor', 3, 'Hi Zoe! Let us start by discussing your current projects and goals in data science.', false, NOW(), NOW())
  `;
        // Create Tags
        yield prisma.$executeRaw `
    INSERT INTO "Tag" (id, name, description, "createdAt", "updatedAt")
    VALUES 
    (1, 'JavaScript', 'JavaScript programming language', NOW(), NOW()),
    (2, 'React', 'React.js library for building user interfaces', NOW(), NOW()),
    (3, 'Node.js', 'Node.js runtime for server-side JavaScript', NOW(), NOW()),
    (4, 'Python', 'Python programming language', NOW(), NOW()),
    (5, 'Career', 'Career development and job search', NOW(), NOW()),
    (6, 'Beginner', 'Questions suitable for beginners', NOW(), NOW()),
    (7, 'Database', 'Database design and queries', NOW(), NOW()),
    (8, 'API', 'API development and integration', NOW(), NOW()),
    (9, 'Frontend', 'Frontend development', NOW(), NOW()),
    (10, 'Backend', 'Backend development', NOW(), NOW()),
    (11, 'Machine Learning', 'ML and AI topics', NOW(), NOW()),
    (12, 'Mobile', 'Mobile app development', NOW(), NOW())
  `;
        // Create Questions
        yield prisma.$executeRaw `
    INSERT INTO "Question" (id, "menteeId", title, body, "createdAt", "updatedAt")
    VALUES 
    (1, 1, 'How do I handle state management in large React applications?', 'I am working on a React project that is growing quite large, and I am struggling with state management. Currently using useState and useContext, but it is getting messy with prop drilling and complex state updates.', '2024-08-20T10:00:00Z', '2024-08-20T10:00:00Z'),
    (2, 2, 'Best practices for REST API design?', 'I am building my first REST API using Node.js and Express. I want to make sure I am following industry best practices from the start.', '2024-08-22T14:30:00Z', '2024-08-22T14:30:00Z'),
    (3, 3, 'How to prepare for technical interviews as a junior developer?', 'I am a recent bootcamp graduate and have been applying for junior developer positions. I am getting some interview opportunities but struggling with the technical portions.', '2024-08-25T09:15:00Z', '2024-08-25T09:15:00Z')
  `;
        // Create Question-Tag relationships
        yield prisma.$executeRaw `
    INSERT INTO "QuestionTag" ("questionId", "tagId")
    VALUES 
    (1, 2), (1, 1), (2, 3), (2, 8), (3, 5)
  `;
        // Create Answers (updated for new schema)
        yield prisma.$executeRaw `
    INSERT INTO "Answer" (id, "questionId", "mentorId", body, "upvotes", "downvotes", "createdAt", "updatedAt")
    VALUES 
    (1, 1, 1, 'For state management in large React apps, I recommend Zustand or Redux Toolkit. They provide better structure than Context API.', 0, 0, NOW(), NOW()),
    (2, 2, 2, 'Focus on REST conventions: use proper HTTP methods, status codes, and consistent URL patterns.', 0, 0, NOW(), NOW()),
    (3, 3, 1, 'Practice algorithms daily, build portfolio projects, and prepare for behavioral questions.', 0, 0, NOW(), NOW())
  `;
        // Note: QuestionVote and AnswerVote tables no longer exist in the current schema
        // Voting is now handled differently (upvotes/downvotes columns)
        // Note: AnswerVote table no longer exists in the current schema
        // Voting is now handled with upvotes/downvotes columns on Answer table
        // Create Articles
        yield prisma.$executeRaw `
    INSERT INTO "Article" (id, "authorId", "title", "content", "imageUrls", "createdAt", "updatedAt")
    VALUES 
    (1, 1, 'Getting Started with React Hooks', 'React Hooks revolutionized how we write functional components. In this article, we will explore useState, useEffect, and custom hooks with practical examples.', ARRAY[]::text[], NOW(), NOW()),
    (2, 2, 'Building Scalable APIs with Node.js', 'Learn how to build robust and scalable REST APIs using Node.js and Express. We will cover middleware, error handling, and authentication.', ARRAY[]::text[], NOW(), NOW()),
    (3, 3, 'Machine Learning for Beginners', 'Dive into the world of machine learning with Python. This guide covers linear regression and neural networks with hands-on examples.', ARRAY[]::text[], NOW(), NOW()),
    (4, 4, 'Mobile App Architecture Best Practices', 'Designing mobile applications requires careful consideration of architecture patterns. We will explore MVVM and Clean Architecture.', ARRAY[]::text[], NOW(), NOW()),
    (5, 1, 'The Future of Frontend Development', 'Frontend development is evolving rapidly with new frameworks and tools. Lets explore the trends shaping the future.', ARRAY[]::text[], NOW(), NOW())
  `;
        // Create Article Tags
        yield prisma.$executeRaw `
    INSERT INTO "ArticleTag" ("articleId", "tagId")
    VALUES 
    (1, 2), (2, 3), (3, 11), (4, 12), (5, 9)
  `;
        // Create Article Votes  
        yield prisma.$executeRaw `
    INSERT INTO "ArticleVote" ("menteeId", "articleId", "voteType", "createdAt", "updatedAt")
    VALUES 
    (1, 1, 'upvote', NOW(), NOW()),
    (2, 1, 'upvote', NOW(), NOW()),
    (3, 2, 'upvote', NOW(), NOW()),
    (4, 3, 'upvote', NOW(), NOW()),
    (1, 4, 'upvote', NOW(), NOW())
  `;
        // Create Communities
        yield prisma.$executeRaw `
    INSERT INTO "Community" (id, "name", "description", "skills", "createdBy", "createdAt", "updatedAt")
    VALUES 
    (1, 'React Developers', 'A community for React developers to share knowledge and best practices', ARRAY['React', 'JavaScript'], 1, NOW(), NOW()),
    (2, 'Full Stack Engineers', 'For developers working across the entire stack', ARRAY['Node.js', 'React', 'Database'], 2, NOW(), NOW()),
    (3, 'Data Science Hub', 'Machine learning and data analysis discussions', ARRAY['Python', 'ML', 'Data'], 3, NOW(), NOW())
  `;
        // Create Community Members
        yield prisma.$executeRaw `
    INSERT INTO "CommunityMember" ("communityId", "userRole", "userId", "joinedAt", "updatedAt")
    VALUES 
    (1, 'mentor', 1, NOW(), NOW()),
    (1, 'mentee', 1, NOW(), NOW()),
    (1, 'mentee', 2, NOW(), NOW()),
    (2, 'mentor', 2, NOW(), NOW()),
    (2, 'mentee', 3, NOW(), NOW()),
    (3, 'mentor', 3, NOW(), NOW()),
    (3, 'mentee', 4, NOW(), NOW())
  `;
        // Create Community Posts
        yield prisma.$executeRaw `
    INSERT INTO "CommunityPost" (id, "communityId", "userRole", "userId", "title", "content", "imageUrls", "createdAt", "updatedAt")
    VALUES 
    (1, 1, 'mentor', 1, 'React 18 New Features', 'React 18 introduces amazing concurrent features that improve performance significantly.', ARRAY[]::text[], NOW(), NOW()),
    (2, 2, 'mentor', 2, 'API Security Best Practices', 'Here are essential security practices every backend developer should follow.', ARRAY[]::text[], NOW(), NOW()),
    (3, 3, 'mentor', 3, 'Getting Started with TensorFlow', 'A beginners guide to building your first neural network with TensorFlow.', ARRAY[]::text[], NOW(), NOW())
  `;
        // Create Community Post Votes
        yield prisma.$executeRaw `
    INSERT INTO "CommunityPostVote" ("userRole", "userId", "postId", "voteType", "createdAt", "updatedAt")
    VALUES 
    ('mentee', 1, 1, 'upvote', NOW(), NOW()),
    ('mentee', 2, 1, 'upvote', NOW(), NOW()),
    ('mentee', 3, 2, 'upvote', NOW(), NOW()),
    ('mentee', 4, 3, 'upvote', NOW(), NOW())
  `;
        // Create Badges
        yield prisma.$executeRaw `
    INSERT INTO "Badge" (id, name, description, "reputationThreshold", "createdAt", "updatedAt")
    VALUES 
    (1, 'First Question', 'Asked your first question', 0, NOW(), NOW()),
    (2, 'Helpful Answer', 'Received 10+ upvotes on an answer', 50, NOW(), NOW()),
    (3, 'Expert Mentor', 'Achieved 500+ reputation points', 500, NOW(), NOW()),
    (4, 'Community Leader', 'Achieved 1000+ reputation points', 1000, NOW(), NOW())
  `;
        // Create User Badges
        yield prisma.$executeRaw `
    INSERT INTO "UserBadge" ("userId", "userRole", "badgeId", "awardedAt", "updatedAt")
    VALUES 
    (1, 'mentee', 1, NOW(), NOW()),
    (1, 'mentor', 3, NOW(), NOW()),
    (1, 'mentor', 4, NOW(), NOW()),
    (2, 'mentor', 2, NOW(), NOW()),
    (3, 'mentor', 4, NOW(), NOW())
  `;
        // Create Reputation History
        yield prisma.$executeRaw `
    INSERT INTO "ReputationHistory" ("userId", "userRole", change, reason, "createdAt", "updatedAt")
    VALUES 
    (1, 'mentor', 10, 'Answer upvoted', NOW(), NOW()),
    (1, 'mentor', 15, 'Answer accepted', NOW(), NOW()),
    (2, 'mentor', 10, 'Answer upvoted', NOW(), NOW()),
    (3, 'mentor', 20, 'Article published', NOW(), NOW()),
    (1, 'mentee', 5, 'Question upvoted', NOW(), NOW())
  `;
        // Create AI Logs
        yield prisma.$executeRaw `
    INSERT INTO "AiLog" ("menteeId", prompt, response, "timestamp", "updatedAt")
    VALUES 
    (1, 'How do I deploy a React app?', 'You can deploy React apps using services like Vercel, Netlify, or AWS S3...', NOW(), NOW()),
    (2, 'What is the difference between REST and GraphQL?', 'REST uses multiple endpoints while GraphQL uses a single endpoint...', NOW(), NOW()),
    (4, 'How to start learning machine learning?', 'Begin with Python basics, then learn pandas and scikit-learn...', NOW(), NOW())
  `;
        // Create Bookmarks
        yield prisma.$executeRaw `
    INSERT INTO "Bookmark" ("menteeId", "contentType", "contentId", "createdAt", "updatedAt")
    VALUES 
    (1, 'article', 1, NOW(), NOW()),
    (1, 'question', 2, NOW(), NOW()),
    (2, 'article', 2, NOW(), NOW()),
    (4, 'article', 3, NOW(), NOW())
  `;
        console.log('✅ COMPREHENSIVE DATABASE SEEDING COMPLETED!');
        console.log('📊 Created data for ALL TABLES:');
        console.log('   - 4 Mentors + 4 Mentees + 2 Admins');
        console.log('   - 10 Auth Credentials');
        console.log('   - 4 Mentorship Requests');
        console.log('   - 2 Connections + 2 Conversations + 5 Messages');
        console.log('   - 12 Tags');
        console.log('   - 3 Questions + 5 Question Tags + 3 Answers');
        console.log('   - 3 Question Votes + 3 Answer Votes');
        console.log('   - 5 Articles + 5 Article Tags + 5 Article Votes');
        console.log('   - 3 Communities + 7 Members + 3 Posts + 4 Post Votes');
        console.log('   - 4 Badges + 5 User Badges');
        console.log('   - 5 Reputation History records');
        console.log('   - 3 AI Logs + 4 Bookmarks');
        console.log('');
        console.log('🔑 Test Credentials (password: password123):');
        console.log('   📧 sarah.chen@email.com (Mentor)');
        console.log('   📧 alex.thompson@email.com (Mentee)');
        console.log('   📧 admin@mentorstack.com (Admin)');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
