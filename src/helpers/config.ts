import { DB } from "../../deps.ts";

export interface Config {
  baseApiUrl: string;
  baseGistUrl: string;
  baseUrl: string;
  checkForUpdates: boolean;
  currentVersion: string;
  db: DB;
  latestVersion: string;
  latestVersionLastChecked: number;
  perPage: number;
  token?: string;
}

export function prefetchConfig(db: DB) {
  const config: Config = {
    checkForUpdates: !!parseInt(Deno.env.get("checkForUpdates") || "1"),
    currentVersion: Deno.env.get("alfred_workflow_version") || "",
    baseUrl: "https://github.com",
    baseApiUrl: "https://api.github.com",
    baseGistUrl: "https://gist.github.com",
    perPage: 100,
    latestVersion: "",
    latestVersionLastChecked: 0,
    db,
  };

  for (const [key, value] of db.query("SELECT key, value FROM config")) {
    if (key === "access_token") config["token"] = value as string;
    if (key === "latestVersionLastChecked") {
      config.latestVersionLastChecked = parseInt(value as string);
    }
    if (key === "latestVersion") config.latestVersion = value as string;
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
