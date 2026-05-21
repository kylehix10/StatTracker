import { Router } from 'express';
import prisma from '../prisma/client.js';

const router = Router();

function getSeasonDates(gameDate) {
  const year = gameDate.getUTCFullYear();

  return {
    name: String(year),
    startDate: new Date(Date.UTC(year, 0, 1)),
    endDate: new Date(Date.UTC(year, 11, 31))
  };
}

async function resolveSeasonId(seasonId, gameDate) {
  if (seasonId) {
    return seasonId;
  }

  const seasonData = getSeasonDates(gameDate);
  const existingSeason = await prisma.season.findFirst({
    where: { name: seasonData.name },
    select: { id: true }
  });

  if (existingSeason) {
    return existingSeason.id;
  }

  const season = await prisma.season.create({ data: seasonData });
  return season.id;
}

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
  const { date, homeTeamId, awayTeamId, opponentName, seasonId } = req.body;
  const cleanedOpponentName = opponentName?.trim();
  const gameDate = date ? new Date(date) : null;

  if (!date || Number.isNaN(gameDate.getTime()) || (!homeTeamId && !awayTeamId) || !cleanedOpponentName) {
    return res.status(400).json({
      error: 'Required fields: date, one team, and opponentName'
    });
  }

  if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
    return res.status(400).json({ error: 'Home and away teams must be different' });
  }

  try {
    const resolvedSeasonId = await resolveSeasonId(seasonId, gameDate);

    const game = await prisma.game.create({
      data: {
        date: gameDate,
        homeTeamId: homeTeamId || null,
        awayTeamId: awayTeamId || null,
        opponentName: cleanedOpponentName || null,
        seasonId: resolvedSeasonId
      },
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
  const { date, homeTeamId, awayTeamId, opponentName, seasonId } = req.body;
  const gameDate = date ? new Date(date) : null;

  if (date && Number.isNaN(gameDate.getTime())) {
    return res.status(400).json({ error: 'Invalid game date' });
  }

  try {
    const resolvedSeasonId = gameDate
      ? await resolveSeasonId(seasonId, gameDate)
      : seasonId;

    const game = await prisma.game.update({
      where: { id: req.params.id },
      data: {
        date: gameDate || undefined,
        homeTeamId,
        awayTeamId,
        opponentName: opponentName?.trim(),
        seasonId: resolvedSeasonId
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        season: true,
        athleteStats: { include: { athlete: true } }
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
    await prisma.$transaction([
      prisma.athleteGameStat.deleteMany({ where: { gameId: req.params.id } }),
      prisma.game.delete({ where: { id: req.params.id } })
    ]);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Game not found or could not be deleted' });
  }
});

export default router;
