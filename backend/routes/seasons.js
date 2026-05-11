
import { Router } from 'express';
const router = Router();
import prisma from '../prisma/client.mjs';

// GET all seasons
router.get('/', async (req, res) => {
  const seasons = await prisma.season.findMany({ include: { games: true } });
  res.json(seasons);
});

// POST create a season
router.post('/', async (req, res) => {
  const { year, sportId } = req.body;
  const season = await prisma.season.create({ data: { year, sportId } });
  res.json(season);
});

export default router;