
import { Router } from 'express';
const router = Router();
import prisma from '../prisma/client.mjs';

// GET all games
router.get('/', async (req, res) => {
  const games = await prisma.game.findMany({ include: { homeTeam: true, awayTeam: true, athleteStats: true } });
  res.json(games);
});

// POST create a game
router.post('/', async (req, res) => {
  const { date, homeTeamId, awayTeamId, seasonId } = req.body;
  const game = await prisma.game.create({ data: { date, homeTeamId, awayTeamId, seasonId } });
  res.json(game);
});

export default router;