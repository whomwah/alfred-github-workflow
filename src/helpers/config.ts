import { DB } from "sqlite";
import {
  cacheUpdateFrequency,
  TWENTY_FOUR_HOURS,
  updateFrequency,
} from "./frequency.ts";

export interface Config {
  db: DB;
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

export function prefetchConfig(db: DB) {
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
    invalidateCacheDate: new Date().getTime() -
      TWENTY_FOUR_HOURS * cacheUpdateFrequency(),
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
