import { Router } from 'express';
import prisma from '../prisma/client.js';

const router = Router();

// GET all users
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({ include: { Team: true } });
  res.json(users);
});

// GET single user
router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    include: { Team: true }
  });
  res.json(user);
});

// POST create a user
router.post('/', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const user = await prisma.user.create({
    data: { firstName, lastName, email, password }
  });
  res.json(user);
});

// DELETE a user
router.delete('/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'User deleted' });
});

export default router;