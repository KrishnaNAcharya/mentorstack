import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './middleware/auth';
import { menteesRouter } from './routes/mentees';
import { communitiesRouter } from './routes/communities';
// import { questionsRouter } from './routes/questions';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mentees', menteesRouter);
app.use('/api/communities', communitiesRouter);
// app.use('/api/questions', questionsRouter);

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
      '/api/communities'
      // '/api/questions'
    ] 
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});