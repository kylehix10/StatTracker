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

export default router;