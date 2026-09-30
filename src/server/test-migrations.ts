import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** Apply the complete SQL history only in a caller-owned isolated test schema. */
export async function applyTestMigrations(client: { query(sql: string): Promise<unknown> }) {
  const dir = join(process.cwd(), "drizzle");
  const files = readdirSync(dir).filter((name) => /^\d{4}_.+\.sql$/.test(name)).sort();
  for (const name of files) await client.query(readFileSync(join(dir, name), "utf8"));
}
