import { Router } from 'express';
import prisma from '../prisma/client.js';

const router = Router();

// GET all seasons
router.get('/', async (req, res) => {
  const seasons = await prisma.season.findMany({ include: { games: true } });
  res.json(seasons);
});

// POST create a season
router.post('/', async (req, res) => {
  const { name, startDate, endDate } = req.body;
  const season = await prisma.season.create({
    data: { name, startDate: new Date(startDate), endDate: new Date(endDate) }
  });
  res.json(season);
});

export default router;