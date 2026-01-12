import { lessOrEqual, parse } from "@std/semver";
import { BuilderType, BuildItem } from "./builder.ts";
import { Config, storeConfig } from "./config.ts";
import { TWENTY_FOUR_HOURS, updateFrequency } from "./frequency.ts";
import { fetchData, GhRelease } from "./github.ts";

const workflowRepo = "whomwah/alfred-github-workflow";

export async function updateAvailableItem(
  builder: BuilderType,
  config: Config,
) {
  if (!config.checkForUpdates) return null;
  const now = Math.floor(new Date().getTime() / 1000); // Convert to seconds

  await _internals.cacheRelease(now, config);

  try {
    const isValid = lessOrEqual(
      parse(config.latestVersion),
      parse(config.currentVersion),
    );
    if (isValid) return null;
  } catch (_) {
    return null;
  }

  const item: BuildItem = {
    title: `Update available (${config.latestVersion})`,
    subtitle:
      `A new version ${config.latestVersion} (current: ${config.currentVersion}) is available for download`,
    icon: "folder",
    arg: `###update_available###`,
    skipUID: true,
    skipMatch: true,
  };

  return builder.addItem(item);
}

async function fetchAndStore(config: Config, now: number) {
  const response = await fetchData(
    `${config.baseApiUrl}/repos/${workflowRepo}/releases/latest`,
    config.token,
  );
  const releases: GhRelease = await response.json();

  storeConfig(config.db, "latestVersion", releases.tag_name.replace("v", ""));
  storeConfig(config.db, "latestVersionLastChecked", String(now));
}

async function cacheRelease(now: number, config: Config) {
  const invalidateCacheDate = now - TWENTY_FOUR_HOURS * updateFrequency();
  const lastChecked = config.latestVersionLastChecked;

  if (lastChecked < invalidateCacheDate) {
    await _internals.fetchAndStore(config, now).catch(console.error);
  }
}

export const _internals = { cacheRelease, fetchAndStore };
