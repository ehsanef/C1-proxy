import { describe, it, expect, vi } from 'vitest';
import { ensureMigrations, resetMigrationCache, MIGRATIONS } from '../src/database/migrations';

describe('D1 Database Migrations Engine', () => {
  it('runs initial migrations idempotently on empty database', async () => {
    resetMigrationCache();

    const executedStatements: string[] = [];
    const appliedVersions = new Set<number>();

    const mockDb: any = {
      prepare: vi.fn((sql: string) => {
        return {
          bind: vi.fn((...args: any[]) => ({
            run: vi.fn(async () => {
              executedStatements.push(sql);
              if (sql.includes('INSERT INTO schema_migrations')) {
                appliedVersions.add(args[0]);
              }
              return { success: true };
            }),
            all: vi.fn(async () => {
              return { results: [] };
            }),
            first: vi.fn(async () => null),
          })),
          run: vi.fn(async () => {
            executedStatements.push(sql);
            return { success: true };
          }),
          all: vi.fn(async () => {
            const results = Array.from(appliedVersions).map((v) => ({ version: v }));
            return { results };
          }),
          first: vi.fn(async () => null),
        };
      }),
    };

    // 1. Initial run on empty DB
    await ensureMigrations(mockDb, true);
    expect(appliedVersions.has(1)).toBe(true);

    const firstRunCount = executedStatements.length;
    expect(firstRunCount).toBeGreaterThan(5);

    // 2. Second run - cached, no-op
    await ensureMigrations(mockDb, false);
    expect(executedStatements.length).toBe(firstRunCount);

    // 3. Forced second run - checks table, sees version 1 already applied, does not re-apply statements
    resetMigrationCache();
    await ensureMigrations(mockDb, true);
    // Only the schema_migrations check statements run, no CREATE TABLE re-runs
    const insertCount = executedStatements.filter((s) => s.includes('INSERT INTO schema_migrations')).length;
    expect(insertCount).toBe(1);
  });
});
