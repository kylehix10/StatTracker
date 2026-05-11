
import { Router } from 'express';
const router = Router();
import prisma from '../prisma/client.mjs';

// GET all teams
router.get('/', async (req, res) => {
  const teams = await prisma.team.findMany({ include: { sport: true, roster: true } });
  res.json(teams);
});

// POST create a team
router.post('/', async (req, res) => {
  const { name, town, type, sportId, year } = req.body;
  const team = await prisma.team.create({ data: { name, town, type, sportId, year } });
  res.json(team);
});

export default router;