
import { Router } from 'express';
const router = Router();
import prisma from '../prisma/client.mjs';

// GET all users
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// POST create a user
router.post('/', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const user = await prisma.user.create({
    data: { firstName, lastName, email, password }
  });
  res.json(user);
});

export default router;