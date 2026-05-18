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

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Required fields: firstName, lastName, email, password' });
  }

  try {
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password }
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'An account already exists for this email' });
    }
    console.error(error);
    res.status(500).json({ error: 'Unable to create user' });
  }
});

// POST log in a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Required fields: email, password' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { Team: true }
  });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json(user);
});

// PUT update a user
router.put('/:id', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { firstName, lastName, email, password }
    });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// DELETE a user
router.delete('/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'User deleted' });
});

export default router;

