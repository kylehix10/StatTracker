
import { Router } from 'express';
const router = Router();
import prisma from '../prisma/client.mjs';

// GET all athletes
router.get('/', async (req, res) => {
  const athletes = await prisma.athlete.findMany({ include: { teams: true } });
  res.json(athletes);
});

// POST create an athlete
router.post('/', async (req, res) => {
  const { firstName, lastName, position } = req.body;
  const athlete = await prisma.athlete.create({ data: { firstName, lastName, position } });
  res.json(athlete);
});

export default router;