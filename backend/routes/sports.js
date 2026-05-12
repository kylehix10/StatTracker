
import { Router } from 'express';
const router = Router();
import prisma from '../prisma/client.js';

// GET all sports
router.get('/', async (req, res) => {
  const sports = await prisma.sport.findMany({ include: { teams: true } });
  res.json(sports);
});

// GET single sport
router.get('/:id', async (req, res) => {
  const sport = await prisma.sport.findUnique({
    where: { id: req.params.id },
    include: { teams: true }
  });
  res.json(sport);
});

// POST create a sport
router.post('/', async (req, res) => {
  const { name } = req.body;
  const sport = await prisma.sport.create({ data: { name } });
  res.json(sport);
});

// PUT update a sport
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  try {
    const sport = await prisma.sport.update({
      where: { id: req.params.id },
      data: { name }
    });
    res.json(sport);
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Sport not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE a sport
router.delete('/:id', async (req, res) => {
  try {
    await prisma.sport.delete({ where: { id: req.params.id } });
    res.json({ message: 'Sport deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Sport not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;