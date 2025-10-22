import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './middleware/auth';
import { menteesRouter } from './routes/mentees';
import { communitiesRouter } from './routes/communities';
import { questionsRouter } from './routes/questions';
import { articlesRouter } from './routes/articles';
import { tagsRouter } from './routes/tags';
import rephraseRoute from './routes/rephrase';
import summarizeRoute from "./routes/summarize";
import { mentorsRouter } from './routes/mentors';
import { mentorListRouter } from './routes/mentorlist';
import { menteeRequestRouter } from './routes/mentee-request';
import tagsRoute from "./routes/rectags";
import spellcheckerRoute from './routes/spellcheck-express';
import http from 'http';
// inlined discussions connection handler to avoid import/init order issues
import { prisma } from '../lib/prisma';
import { chatRouter } from './routes/chat';
import WebSocket, { WebSocketServer, RawData } from 'ws';
import { IncomingMessage } from 'http';
import url from 'url';
import jwt from 'jsonwebtoken';
import { getRabbitChannel, createEphemeralConsumer, publish } from './realtime/rabbit';
import { WS_PATHS, ROUTING_KEYS, EXCHANGES } from './realtime/constants';
import { ensureAiTopology } from './realtime/ai-topology';
import wordleRouter from "./routes/wordle";
import wordsRouter from "./routes/words";

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
app.use('/api/questions', questionsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/rephrase', rephraseRoute);
app.use("/api/summarize", summarizeRoute);
app.use('/api/mentors', mentorsRouter);
app.use('/api/mentor-list', mentorListRouter);
app.use('/api/mentee-request', menteeRequestRouter);
app.use("/api/rectags", tagsRoute);
app.use("/api/wordle", wordleRouter);
app.use("/api/words", wordsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/spellcheck', spellcheckerRoute);
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
const server = http.createServer(app);

// Create WebSocket servers without attaching them to the HTTP server directly.
const discussionsWss = new WebSocketServer({ noServer: true });
const mainWss = new WebSocketServer({ noServer: true });

// Helper: auth from query
function authenticateFromQuery(reqUrl: string | undefined) {
  if (!reqUrl) return null as any;
  const parsed = url.parse(reqUrl, true);
  const token = (parsed.query.token as string) || '';
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    return payload; // { userId, role, email }
  } catch {
    return null;
  }
}

// Assign connection handlers
discussionsWss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
  try {
    const parsed = url.parse(req.url || '', true);
    const communityId = Number(parsed.query.communityId);
    const auth = authenticateFromQuery(req.url);

    if (!auth || !communityId || Number.isNaN(communityId)) {
      ws.close(1008, 'Unauthorized or invalid community');
      return;
    }

    // Verify membership
    const isMember = await prisma.communityMember.findFirst({
      where: { communityId, userId: auth.userId, userRole: auth.role },
    });
    if (!isMember) {
      ws.close(1008, 'Not a member of this community');
      return;
    }

    // Create ephemeral RabbitMQ consumer bound to topic community.<id>
    const bindingKey = ROUTING_KEYS.community(communityId);
    const consumer = await createEphemeralConsumer(bindingKey, (msg) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      }
    });

    ws.on('message', async (raw: RawData) => {
      try {
        const text = raw.toString();
        const payload = JSON.parse(text);
        const content = String(payload?.content || '').slice(0, 4000);
        if (!content) return;

        const enriched = {
          type: 'community.message',
          communityId,
          content,
          senderId: auth.userId,
          senderRole: auth.role,
          timestamp: new Date().toISOString(),
        } as any;

        await publish({
          exchange: EXCHANGES.discussions,
          routingKey: bindingKey,
          message: enriched,
        });
      } catch (e) {
        console.error('Failed to process incoming message', e);
      }
    });

    ws.on('close', async () => {
      try { await consumer.cancel(); } catch {}
    });

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'system', message: 'joined', communityId }));
    }
  } catch (err) {
    console.error('WS connection error', err);
    try { ws.close(1011, 'Internal error'); } catch {}
  }
});

mainWss.on('connection', async (ws: WebSocket, req) => {
  try {
    const parsed = url.parse(req.url || '', true);
    const token = (parsed.query.token as string) || '';
    if (!token) { ws.close(1008, 'Unauthorized'); return; }
    const auth = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    const userId = auth.userId;
    if (!userId) { ws.close(1008, 'Unauthorized'); return; }

    const bindingKey = `bot-reply.${userId}`;
    // Inline direct-exchange ephemeral consumer to avoid import issues
    const ch = await getRabbitChannel();
    const q = await ch.assertQueue('', { exclusive: true, durable: false, autoDelete: true });
    await ch.bindQueue(q.queue, EXCHANGES.direct, bindingKey);
    const consumerTag = (await ch.consume(q.queue, (msg: any) => {
      if (!msg) return;
      try {
        const content = JSON.parse(msg.content.toString());
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(content));
      } catch (e) {
        console.error('Failed to parse direct message', e);
      } finally {
        ch.ack(msg);
      }
    })).consumerTag;

    ws.on('close', async () => {
      try { await ch.cancel(consumerTag); } catch {}
      try { await ch.unbindQueue(q.queue, EXCHANGES.direct, bindingKey); } catch {}
      try { await ch.deleteQueue(q.queue); } catch {}
    });
  } catch (e) {
    console.error('WS /ws error', e);
    try { ws.close(1011, 'Internal error'); } catch {}
  }
});

// Centralized upgrade handler
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url || '').pathname;

  if (pathname === WS_PATHS.discussions) {
    discussionsWss.handleUpgrade(request, socket, head, (ws) => {
      discussionsWss.emit('connection', ws, request);
    });
  } else if (pathname === '/ws') {
    mainWss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      mainWss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});


server.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`🔌 WebSocket endpoints ready for /ws and /ws/discussions`);
  try {
    await ensureAiTopology();
    console.log('🧠 AI topology ensured (direct exchange + user-questions-queue)');
  } catch (e) {
    console.error('Failed to ensure AI topology', e);
  }
});