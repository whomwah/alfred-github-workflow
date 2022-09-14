import { DB } from "../deps.ts";

export interface Config {
  baseUrl: string;
  baseApiUrl: string;
  baseGistUrl: string;
  perPage: number;
  token?: string;
  version?: string;
  db: DB;
}

export function prefetchConfig(db: DB) {
  const config: Config = {
    baseUrl: "https://github.com",
    baseApiUrl: "https://api.github.com",
    baseGistUrl: "https://gist.github.com",
    perPage: 50,
    db,
  };

  for (const [key, value] of db.query("SELECT key, value FROM config")) {
    if (key === "access_token") config["token"] = value as string;
    if (key === "version") config["version"] = value as string;
  }

  return config;
}

export function removeConfig(db: DB, key: string) {
  try {
    db.query("DELETE FROM config WHERE key = :key", { key });
  } catch (err) {
    console.error(err);
  }
}

export function storeConfig(db: DB, key: string, val: string) {
  try {
    db.query("REPLACE INTO config VALUES(:key, :value)", { key, value: val });
  } catch (err) {
    console.error(err);
  }
}
