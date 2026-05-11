import { Router } from 'express';
import prisma from '../prisma/client.js';

const router = Router();

// GET all teams
router.get('/', async (req, res) => {
  const teams = await prisma.team.findMany({
    include: {
      sport: true,
      roster: { include: { athlete: true } }
    }
  });
  res.json(teams);
});

// GET single team
router.get('/:id', async (req, res) => {
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: {
      sport: true,
      roster: { include: { athlete: true } },
      homeGames: true,
      awayGames: true
    }
  });
  res.json(team);
});

// POST create a team
router.post('/', async (req, res) => {
  const { name, town, type, sportId, year, userId } = req.body;
  const team = await prisma.team.create({
    data: { name, town, type, sportId, year, userId }
  });
  res.json(team);
});

// DELETE a team
router.delete('/:id', async (req, res) => {
  await prisma.team.delete({ where: { id: req.params.id } });
  res.json({ message: 'Team deleted' });
});

export default router;