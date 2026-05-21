import 'dotenv/config';
import generatedClient from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = generatedClient;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to connect to the database');
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

export default prisma;
