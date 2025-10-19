"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./middleware/auth"));
const mentees_1 = require("./routes/mentees");
const communities_1 = require("./routes/communities");
const questions_1 = require("./routes/questions");
const articles_1 = require("./routes/articles");
const tags_1 = require("./routes/tags");
const rephrase_1 = __importDefault(require("./routes/rephrase"));
const summarize_1 = __importDefault(require("./routes/summarize"));
const mentors_1 = require("./routes/mentors");
const rectags_1 = __importDefault(require("./routes/rectags"));
const http_1 = __importDefault(require("http"));
const discussions_1 = require("./realtime/discussions");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/mentees', mentees_1.menteesRouter);
app.use('/api/communities', communities_1.communitiesRouter);
app.use('/api/questions', questions_1.questionsRouter);
app.use('/api/articles', articles_1.articlesRouter);
app.use('/api/tags', tags_1.tagsRouter);
app.use('/api/rephrase', rephrase_1.default);
app.use("/api/summarize", summarize_1.default);
app.use('/api/mentors', mentors_1.mentorsRouter);
app.use("/api/rectags", rectags_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'MentorStack API is running' });
});
// Add a simple root endpoint for testing
app.get('/', (req, res) => {
    res.json({
        message: 'MentorStack Backend API',
        endpoints: [
            '/api/health',
            '/api/auth/signup',
            '/api/auth/login',
            '/api/auth/me',
            '/api/mentees',
            '/api/mentees/profile/me',
            '/api/communities',
            '/api/questions',
            '/api/articles'
        ]
    });
});
// Create HTTP server to attach WebSocket server
const server = http_1.default.createServer(app);
// Setup WebSocket handlers
(0, discussions_1.setupDiscussionsWebSocket)(server);
server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: PostgreSQL`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log(`🔌 WebSocket endpoints ready at /ws/*`);
});
