import { Router } from 'express';
import prisma from '../prisma/client.js';

const router = Router();

// GET all teams
router.get('/', async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        sport: true,
        roster: { include: { athlete: true } }
      }
    });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch teams' });
  }
});

// GET single team
router.get('/:id', async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        sport: true,
        roster: { include: { athlete: true } },
        homeGames: true,
        awayGames: true
      }
    });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch team' });
  }
});

// POST create a team
router.post('/', async (req, res) => {
  const { name, town, level, type, sportId, year, userId } = req.body;
  const teamLevel = level ?? type;
  const teamYear = year !== undefined ? Number(year) : undefined;
  const teamUserId = userId !== undefined ? Number(userId) : undefined;

  if (!name || !town || !teamLevel || !sportId || teamYear === undefined || teamUserId === undefined) {
    return res.status(400).json({
      error: 'Required fields: name, town, level/type, sportId, year, userId'
    });
  }

  try {
    const team = await prisma.team.create({
      data: {
        name,
        town,
        level: teamLevel,
        sportId,
        year: teamYear,
        userId: teamUserId
      }
    });
    res.status(201).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create team' });
  }
});

// PUT update a team
router.put('/:id', async (req, res) => {
  const { name, town, level, type, sportId, year, userId } = req.body;
  const teamLevel = level ?? type;
  const teamYear = year !== undefined ? Number(year) : undefined;
  const teamUserId = userId !== undefined ? Number(userId) : undefined;

  try {
    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: {
        name,
        town,
        level: teamLevel,
        sportId,
        year: teamYear,
        userId: teamUserId
      }
    });
    res.json(team);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.status(500).json({ error: 'Unable to update team' });
  }
});

// DELETE a team
router.delete('/:id', async (req, res) => {
  try {
    await prisma.team.delete({ where: { id: req.params.id } });
    res.json({ message: 'Team deleted' });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.status(500).json({ error: 'Unable to delete team' });
  }
});

export default router;