import generatedClient from '../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { PrismaClient } = generatedClient;
const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';

  if (!url.startsWith('file:./') && !url.startsWith('file:../')) {
    return url;
  }

  const relativePath = url.slice('file:'.length);
  const absolutePath = path.resolve(backendDir, relativePath).replaceAll(path.sep, '/');
  return `file:${absolutePath}`;
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: getDatabaseUrl()
  })
});

export default prisma;
