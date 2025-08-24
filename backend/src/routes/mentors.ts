import express from 'express';

const router = express.Router();

// Placeholder routes - you can implement these later
router.get('/', (req, res) => {
  res.json({ message: 'Mentors routes' });
});

export { router as mentorsRouter };
