import { Database } from "sqlite";
import { emptyDir, ensureDir } from "@std/fs";
import { Config, prefetchConfig } from "./helpers/config.ts";
import { DATABASE, DB_DIR } from "../env.ts";

type InitCallback = (config: Config) => void;

export async function dbConnect() {
  try {
    await ensureDir(DB_DIR);
    await Deno.stat(DATABASE);

    return new Database(DATABASE);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return createDB(new Database(DATABASE));
    }
    throw err;
  }
}

export function init(db: Database, initCallback: InitCallback) {
  return new Promise((resolve) => {
    const config = prefetchConfig(db);
    resolve(initCallback({ ...config, ...{ db } }));
  });
}

function createDB(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS config(
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    ) WITHOUT ROWID
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS request_cache(
      url TEXT PRIMARY KEY NOT NULL,
      timestamp INTEGER NOT NULL,
      content TEXT,
      parent TEXT
    ) WITHOUT ROWID
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS parent_url ON request_cache(parent) WHERE parent IS NOT NULL
  `);

  return db;
}

export async function deleteDatabase(db: Database) {
  try {
    db.close();
    await emptyDir(DB_DIR);
  } catch (err) {
    console.error(err);
  }
}
