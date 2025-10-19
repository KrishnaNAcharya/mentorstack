import 'dotenv/config';
import amqp from 'amqplib';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const DIRECT_EXCHANGE = process.env.DIRECT_EXCHANGE || 'direct-exchange';
const USER_QUESTIONS_QUEUE = process.env.USER_QUESTIONS_QUEUE || 'user-questions-queue';
const AI_QUESTION_ROUTING_KEY = process.env.AI_QUESTION_ROUTING_KEY || 'ai-question';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function ensureTopology(ch) {
  await ch.assertExchange(DIRECT_EXCHANGE, 'direct', { durable: true });
  await ch.assertQueue(USER_QUESTIONS_QUEUE, { durable: true });
  await ch.bindQueue(USER_QUESTIONS_QUEUE, DIRECT_EXCHANGE, AI_QUESTION_ROUTING_KEY);
}

async function handleQuestion(ch, msg) {
  try {
    const payload = JSON.parse(msg.content.toString());
    const { userId, question } = payload;
    if (!userId || !question) throw new Error('Invalid payload');

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent(question);
    const response = await result.response;
    const answer = response.text();

    // Log to DB
    await prisma.aiLog.create({
      data: { menteeId: userId, prompt: question, response: answer }
    });

    // Publish reply
    const routingKey = `bot-reply.${userId}`;
    const message = { type: 'ai.reply', userId, answer, timestamp: new Date().toISOString() };
    ch.publish(DIRECT_EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)), {
      contentType: 'application/json', persistent: false,
    });

    ch.ack(msg);
  } catch (e) {
    console.error('Failed to process message', e);
    ch.nack(msg, false, false); // discard bad message
  }
}

async function start() {
  const conn = await amqp.connect(RABBITMQ_URL);
  const ch = await conn.createChannel();
  await ensureTopology(ch);
  console.log('🤖 Chatbot agent connected to RabbitMQ, consuming...');
  await ch.consume(USER_QUESTIONS_QUEUE, (msg) => msg && handleQuestion(ch, msg));
}

start().catch((e) => {
  console.error('Agent fatal error', e);
  process.exit(1);
});
