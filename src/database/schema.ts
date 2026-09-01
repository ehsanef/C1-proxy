import type { Env } from '../types';

let ready = false;
let inFlight: Promise<void> | null = null;

export async function ensureSchema(env: Env): Promise<void> {
  if (ready) return;

  if (!inFlight) {
    inFlight = (async () => {
      // Verify that the D1 binding is alive and that the initial migration
      // has already created the required tables.
      const row = await env.DB
        .prepare(
          `SELECT name
           FROM sqlite_master
           WHERE type = 'table' AND name = 'users'
           LIMIT 1`
        )
        .first<{ name: string }>();

      if (!row || row.name !== 'users') {
        throw new Error(
          'C1 database schema is missing. Run migrations/0001_initial.sql.'
        );
      }

      ready = true;
    })().finally(() => {
      inFlight = null;
    });
  }

  await inFlight;
}