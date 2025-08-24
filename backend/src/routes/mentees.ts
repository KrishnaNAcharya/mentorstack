import express from 'express';

const router = express.Router();

// Placeholder routes - you can implement these later
router.get('/', (req, res) => {
  res.json({ message: 'Mentees routes' });
});

export { router as menteesRouter };
