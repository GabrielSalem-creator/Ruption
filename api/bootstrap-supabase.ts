import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

function getConnectionString() {
  return process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const adminSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    return res.status(500).json({ error: 'Missing Postgres connection string' });
  }

  const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
  const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    await client.query(schemaSql);
    await client.query(seedSql);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Bootstrap failed' });
  } finally {
    await client.end().catch(() => undefined);
  }
}
