import { Router } from 'express';
import prisma from '../prisma/client.js';

const router = Router();

// GET all athletes
router.get('/', async (req, res) => {
  const athletes = await prisma.athlete.findMany({
    include: { teamHistory: { include: { team: true } } }
  });
  res.json(athletes);
});

// POST create an athlete
router.post('/', async (req, res) => {
  const { firstName, lastName, dateOfBirth } = req.body;
  const athlete = await prisma.athlete.create({
    data: { firstName, lastName, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }
  });
  res.json(athlete);
});

// POST add athlete to a team
router.post('/:id/teams', async (req, res) => {
  const { teamId, startDate } = req.body;
  const entry = await prisma.athleteTeam.create({
    data: { athleteId: req.params.id, teamId, startDate: new Date(startDate) }
  });
  res.json(entry);
});

// PUT update an athlete
router.put('/:id', async (req, res) => {
  const { firstName, lastName, dateOfBirth } = req.body;
  try {
    const athlete = await prisma.athlete.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
      }
    });
    res.json(athlete);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Athlete not found or could not be updated' });
  }
});

// DELETE remove an athlete
router.delete('/:id', async (req, res) => {
  try {
    await prisma.athlete.delete({ where: { id: req.params.id } });
    res.json({ message: 'Athlete deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Athlete not found or could not be deleted' });
  }
});

export default router;