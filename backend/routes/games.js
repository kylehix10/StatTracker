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

  if (!date || !homeTeamId || !awayTeamId || !seasonId) {
    return res.status(400).json({
      error: 'Required fields: date, homeTeamId, awayTeamId, seasonId'
    });
  }

  if (homeTeamId === awayTeamId) {
    return res.status(400).json({ error: 'Home and away teams must be different' });
  }

  try {
    const game = await prisma.game.create({
      data: { date: new Date(date), homeTeamId, awayTeamId, seasonId },
      include: {
        homeTeam: true,
        awayTeam: true,
        season: true,
        athleteStats: { include: { athlete: true } }
      }
    });
    res.status(201).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create game' });
  }
});

// PUT update a game
router.put('/:id', async (req, res) => {
  const { date, homeTeamId, awayTeamId, seasonId } = req.body;
  try {
    const game = await prisma.game.update({
      where: { id: req.params.id },
      data: {
        date: date ? new Date(date) : undefined,
        homeTeamId,
        awayTeamId,
        seasonId
      }
    });
    res.json(game);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Game not found or could not be updated' });
  }
});

// DELETE remove a game
router.delete('/:id', async (req, res) => {
  try {
    await prisma.game.delete({ where: { id: req.params.id } });
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Game not found or could not be deleted' });
  }
});

export default router;
