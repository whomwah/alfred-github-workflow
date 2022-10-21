import { lte, validVersion } from "../../deps.ts";
import { BuilderType, BuildItem } from "./builder.ts";
import { Config, storeConfig } from "./config.ts";
import { fetchData, GhRelease } from "./github.ts";

const workflowRepo = "whomwah/alfred-github-workflow";

export async function updateAvailableItem(
  builder: BuilderType,
  config: Config,
) {
  if (!config.checkForUpdates) return null;
  const now = new Date().getTime();

  await _internals.cacheRelease(now, config);

  const isValid = validVersion(config.latestVersion) &&
    lte(config.latestVersion, config.currentVersion);
  if (isValid) return null;

  const item: BuildItem = {
    title: `Update available (${config.latestVersion})`,
    subtitle:
      `A new version ${config.latestVersion} (current: ${config.currentVersion}) is available for download`,
    icon: "folder",
    arg: `${config.baseUrl}/${workflowRepo}/releases/v${config.latestVersion}`,
    skipUID: true,
    skipMatch: true,
  };

  return builder.addItem(item);
}

async function fetchAndStore(config: Config, now: number) {
  const response = await fetchData(
    `${config.baseApiUrl}/repos/${workflowRepo}/releases`,
    config.token,
  );
  const releases: GhRelease[] = await response.json();

  storeConfig(
    config.db,
    "latestVersion",
    releases[0].tag_name.replace("v", ""),
  );
  storeConfig(config.db, "latestVersionLastChecked", String(now));
}

async function cacheRelease(now: number, config: Config) {
  const invalidateCacheDate = now - 1000 * 60 * 60 * 24 * 7; // 7 days
  const lastChecked = config.latestVersionLastChecked;

  if (lastChecked < invalidateCacheDate) {
    await _internals.fetchAndStore(config, now);
  }
}

export const _internals = { cacheRelease, fetchAndStore };
