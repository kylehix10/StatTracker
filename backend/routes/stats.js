
import { Router } from 'express';
const router = Router();
import prisma from '../prisma/client.mjs';

// GET stats for a specific game
router.get('/game/:gameId', async (req, res) => {
  const stats = await prisma.athleteGameStat.findMany({
    where: { gameId: req.params.gameId },
    include: { athlete: true }
  });
  res.json(stats);
});

// GET stats for a specific athlete
router.get('/athlete/:athleteId', async (req, res) => {
  const stats = await prisma.athleteGameStat.findMany({
    where: { athleteId: req.params.athleteId },
    include: { game: true }
  });
  res.json(stats);
});

// POST log stats for an athlete in a game
router.post('/', async (req, res) => {
  const { athleteId, gameId, minutesPlayed, points, assists, rebounds, goals, shots, hits, homeRuns } = req.body;
  const stat = await prisma.athleteGameStat.create({
    data: { athleteId, gameId, minutesPlayed, points, assists, rebounds, goals, shots, hits, homeRuns }
  });
  res.json(stat);
});

export default router;