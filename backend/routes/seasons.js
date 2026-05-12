import { Router } from 'express';
import prisma from '../prisma/client.js';

const router = Router();

// GET all seasons
router.get('/', async (req, res) => {
  const seasons = await prisma.season.findMany({ include: { games: true } });
  res.json(seasons);
});

// GET a single season
router.get('/:id', async (req, res) => {
  try {
    const season = await prisma.season.findUnique({
      where: { id: req.params.id },
      include: { games: true }
    });
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
    res.json(season);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch season' });
  }
});

// POST create a season
router.post('/', async (req, res) => {
  const { name, startDate, endDate } = req.body;
  const season = await prisma.season.create({
    data: { name, startDate: new Date(startDate), endDate: new Date(endDate) }
  });
  res.json(season);
});

// PUT update a season
router.put('/:id', async (req, res) => {
  const { name, startDate, endDate } = req.body;

  try {
    const season = await prisma.season.update({
      where: { id: req.params.id },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    });

    res.json(season);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Season not found or could not be updated' });
  }
});

// DELETE remove a season
router.delete('/:id', async (req, res) => {
  try {
    await prisma.season.delete({ where: { id: req.params.id } });
    res.json({ message: 'Season deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Season not found or could not be deleted' });
  }
});

export default router;

//PUT


