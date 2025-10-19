import { Router } from 'express';
import authenticateToken, { AuthenticatedRequest } from '../middleware/authenticateToken';
import { publish } from '../realtime/rabbit';
import { EXCHANGES } from '../realtime/constants';

export const chatRouter = Router();

// POST /api/chat/ask { question: string }
chatRouter.post('/ask', authenticateToken as any, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { question } = req.body as { question?: string };
    if (!question || !question.trim()) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const userId = req.user!.userId;

    await publish({
      exchange: EXCHANGES.direct,
      routingKey: 'ai-question',
      message: { userId, question: question.trim() },
    });

    res.json({ status: 'queued' });
  } catch (e) {
    console.error('chat/ask error', e);
    res.status(500).json({ error: 'Failed to queue question' });
  }
});
