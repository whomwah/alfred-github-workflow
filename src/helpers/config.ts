import { Database } from "sqlite";
import {
  cacheUpdateFrequency,
  TWENTY_FOUR_HOURS,
  updateFrequency,
} from "./frequency.ts";

export interface Config {
  db: Database;
  // Github
  baseApiUrl: string;
  baseGistUrl: string;
  baseUrl: string;
  perPage: number;
  token?: string;
  // Workflow updates
  currentVersion: string;
  latestVersion: string;
  latestVersionLastChecked: number;
  invalidateCacheDate: number;
  // Project settings
  checkForUpdates: boolean;
  updateFrequency: number;
}

export function prefetchConfig(db: Database) {
  const config: Config = {
    db,
    baseUrl: "https://github.com",
    baseApiUrl: "https://api.github.com",
    baseGistUrl: "https://gist.github.com",
    perPage: 100,
    checkForUpdates: !!parseInt(Deno.env.get("checkForUpdates") || "1"),
    updateFrequency: updateFrequency(),
    currentVersion: Deno.env.get("alfred_workflow_version") || "",
    latestVersion: "",
    latestVersionLastChecked: 0,
    invalidateCacheDate: Math.floor(
      new Date().getTime() / 1000 - TWENTY_FOUR_HOURS * cacheUpdateFrequency(),
    ),
  };

  const query = db.prepare("SELECT key, value FROM config");

  for (const row of query.all<Record<string, string>>(1)) {
    if (row.key === "access_token") config["token"] = row.value;
    if (row.key === "latestVersionLastChecked") {
      config.latestVersionLastChecked = parseInt(row.value);
    }
    if (row.key === "latestVersion") config.latestVersion = row.value;
  }

  return config;
}

export function removeConfig(db: Database, key: string) {
  try {
    db.exec("DELETE FROM config WHERE key = :key", { key });
  } catch (err) {
    console.error(err);
  }
}

export function storeConfig(db: Database, key: string, val: string) {
  try {
    db.exec("REPLACE INTO config VALUES(:key, :value)", { key, value: val });
  } catch (err) {
    console.error(err);
  }
}
