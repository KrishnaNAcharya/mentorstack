import dotenv from 'dotenv';
import amqp from 'amqplib';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load chatbot-agent env first.
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import only GEMINI_API_KEY from backend env so we share the same key
// without accidentally overriding chatbot-specific vars like PORT.
const backendEnv = dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
if (backendEnv?.parsed?.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = backendEnv.parsed.GEMINI_API_KEY;
}

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const PORT = Number(process.env.CHATBOT_AGENT_PORT || process.env.AGENT_PORT || 10000);
const DIRECT_EXCHANGE = process.env.DIRECT_EXCHANGE || 'direct-exchange';
const USER_QUESTIONS_QUEUE = process.env.USER_QUESTIONS_QUEUE || 'user-questions-queue';
const AI_QUESTION_ROUTING_KEY = process.env.AI_QUESTION_ROUTING_KEY || 'ai-question';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing for chatbot-agent');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const AGENT_TOKEN = process.env.AGENT_TOKEN || '';
const GEMINI_MODELS = ['gemini-2.5-flash-lite', 'gemini-1.5-flash'];

async function generateAnswer(question) {
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(question);
      const response = await result.response;
      const answer = response.text();
      if (answer && answer.trim()) {
        return answer.trim();
      }
    } catch (err) {
      lastError = err;
      console.error(`Gemini model failed (${modelName})`, err?.message || err);
    }
  }

  throw lastError || new Error('No Gemini model produced a response');
}

function publishAiReply(ch, userId, answer) {
  const routingKey = `bot-reply.${userId}`;
  const message = { type: 'ai.reply', userId, answer, timestamp: new Date().toISOString() };
  ch.publish(DIRECT_EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)), {
    contentType: 'application/json', persistent: false,
  });
}

async function ensureTopology(ch) {
  await ch.assertExchange(DIRECT_EXCHANGE, 'direct', { durable: true });
  await ch.assertQueue(USER_QUESTIONS_QUEUE, { durable: true });
  await ch.bindQueue(USER_QUESTIONS_QUEUE, DIRECT_EXCHANGE, AI_QUESTION_ROUTING_KEY);
}

async function handleQuestion(ch, msg) {
  let userId = null;
  try {
    const payload = JSON.parse(msg.content.toString());
    userId = Number(payload?.userId);
    const question = payload?.question;
    if (!userId || !question) throw new Error('Invalid payload');

    const answer = await generateAnswer(question);

    // Log to DB via backend API (decoupled from Prisma)
    try {
      await axios.post(`${BACKEND_URL}/api/ai/log`, { userId, prompt: question, response: answer }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Token': AGENT_TOKEN,
        },
        timeout: 5000,
      });
    } catch (logErr) {
      console.error('Failed to log AI interaction to backend', logErr?.response?.data || logErr?.message || logErr);
      // continue; logging failure should not prevent user reply
    }

    // Publish reply to websocket subscribers on backend
    publishAiReply(ch, userId, answer);

    ch.ack(msg);
  } catch (e) {
    console.error('Failed to process message', e);
    // Always respond so frontend is never stuck waiting forever.
    if (userId) {
      const fallback = "Sorry, I'm having trouble generating a response right now. Please try again in a moment.";
      try {
        publishAiReply(ch, userId, fallback);
      } catch (publishErr) {
        console.error('Failed to publish fallback AI reply', publishErr);
      }
    }
    ch.ack(msg);
  }
}

async function start() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  await ensureTopology(ch);
  console.log('🤖 Chatbot agent connected to RabbitMQ, consuming...');
  await ch.consume(USER_QUESTIONS_QUEUE, (msg) => msg && handleQuestion(ch, msg));

  // Health check HTTP server for Render free tier
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'chatbot-agent', uptime: process.uptime() }));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    console.log(`🏥 Health check server running on port ${PORT}`);
  });
}

start().catch((e) => {
  console.error('Agent fatal error', e);
  process.exit(1);
});
