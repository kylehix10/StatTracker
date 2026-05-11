import { Router } from 'express';
import prisma from '../prisma/client.js';

const router = Router();

// GET all games
router.get('/', async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
      season: true,
      athleteStats: { include: { athlete: true } }
    }
  });
  res.json(games);
});

// GET single game
router.get('/:id', async (req, res) => {
  const game = await prisma.game.findUnique({
    where: { id: req.params.id },
    include: {
      homeTeam: true,
      awayTeam: true,
      season: true,
      athleteStats: { include: { athlete: true } }
    }
  });
  res.json(game);
});

// POST create a game
router.post('/', async (req, res) => {
  const { date, homeTeamId, awayTeamId, seasonId } = req.body;
  const game = await prisma.game.create({
    data: { date: new Date(date), homeTeamId, awayTeamId, seasonId }
  });
  res.json(game);
});

export default router;