
import { Router } from 'express';
const router = Router();
import prisma from '../prisma/client.js';

// GET all sports
router.get('/', async (req, res) => {
  const sports = await prisma.sport.findMany({ include: { teams: true } });
  res.json(sports);
});

// POST create a sport
router.post('/', async (req, res) => {
  const { name } = req.body;
  const sport = await prisma.sport.create({ data: { name } });
  res.json(sport);
});

export default router;