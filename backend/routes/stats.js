
import { Router } from 'express';
const router = Router();
import prisma from '../prisma/client.js';

const statFields = [
  'completions',
  'passAttempts',
  'passingYards',
  'passingTds',
  'thrownInterceptions',
  'carries',
  'rushingYards',
  'rushingTouchdowns',
  'receptions',
  'receivingYards',
  'receivingTds',
  'tackles',
  'sacks',
  'passDeflections',
  'interceptions',
  'forcedFumbles'
];

function getStatData(body) {
  return statFields.reduce((data, field) => {
    if (body[field] !== undefined) {
      data[field] = body[field] === null || body[field] === '' ? null : Number(body[field]);
    }
    return data;
  }, {});
}

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
  const { athleteId, gameId } = req.body;

  if (!athleteId || !gameId) {
    return res.status(400).json({ error: 'Required fields: athleteId, gameId' });
  }

  try {
    const stat = await prisma.athleteGameStat.create({
      data: { athleteId, gameId, ...getStatData(req.body) }
    });
    res.status(201).json(stat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create stat entry' });
  }
});

// PUT update a stat entry
router.put('/:id', async (req, res) => {
  try {
    const stat = await prisma.athleteGameStat.update({
      where: { id: req.params.id },
      data: getStatData(req.body)
    });
    res.json(stat);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Stat entry not found or could not be updated' });
  }
});

// DELETE remove a stat entry
router.delete('/:id', async (req, res) => {
  try {
    await prisma.athleteGameStat.delete({ where: { id: req.params.id } });
    res.json({ message: 'Stat entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Stat entry not found or could not be deleted' });
  }
});

export default router;
