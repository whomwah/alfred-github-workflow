import { DB, emptyDir, ensureDir } from "../deps.ts";
import { DATABASE, DB_DIR } from "../env.ts";
import { Config, prefetchConfig } from "../helpers/config.ts";

type InitCallback = (config: Config) => void;

export async function dbConnect() {
  try {
    await ensureDir(DB_DIR);
    await Deno.stat(DATABASE);

    return new DB(DATABASE);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return createDB(new DB(DATABASE));
    }
    throw err;
  }
}

export function init(db: DB, initCallback: InitCallback) {
  return new Promise((resolve) => {
    const config = prefetchConfig(db);
    resolve(initCallback({ ...config, ...{ db } }));
  });
}

function createDB(db: DB) {
  db.query(`
    CREATE TABLE IF NOT EXISTS config(
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    ) WITHOUT ROWID
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS request_cache(
      url TEXT PRIMARY KEY NOT NULL,
      timestamp INTEGER NOT NULL,
      content TEXT,
      parent TEXT
    ) WITHOUT ROWID
  `);

  db.query(`
    CREATE INDEX IF NOT EXISTS parent_url ON request_cache(parent) WHERE parent IS NOT NULL
  `);

  return db;
}

export async function deleteDatabase(db: DB) {
  try {
    db.close();
    await emptyDir(DB_DIR);
  } catch (err) {
    console.error(err);
  }
}
