import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.156.0/testing/bdd.ts";
import {
  assertSpyCall,
  stub,
} from "https://deno.land/std@0.160.0/testing/mock.ts";
import { FakeTime } from "https://deno.land/std@0.160.0/testing/time.ts";
import { Config } from "./config.ts";
import { _internals, updateAvailableItem } from "./updateAvailable.ts";

describe("#updateAvailableItem", () => {
  it("it handle not checking for updates", async () => {
    const config = {
      checkForUpdates: false,
    } as Config;
    const builder = { addItem: () => Promise.resolve() };
    const update = await updateAvailableItem(builder, config);
    assertEquals(update, null);
  });

  it("it handles when current version is 1.0.0 and latest 1.0.0", async () => {
    const cacheRelease = stub(_internals, "cacheRelease");

    try {
      const config = {
        checkForUpdates: true,
        latestVersion: "1.0.0",
        currentVersion: "1.0.0",
      } as Config;
      const builder = { addItem: () => Promise.resolve() };
      const update = await updateAvailableItem(builder, config);
      assertEquals(update, null);
    } finally {
      cacheRelease.restore();
    }
  });

  it("it handles when current version is 1.0.0 and latest 0.9.0", async () => {
    const cacheRelease = stub(_internals, "cacheRelease");

    try {
      const config = {
        checkForUpdates: true,
        latestVersion: "0.9.0",
        currentVersion: "1.0.0",
      } as Config;
      const builder = { addItem: () => Promise.resolve() };
      const update = await updateAvailableItem(builder, config);
      assertEquals(update, null);
    } finally {
      cacheRelease.restore();
    }
  });

  it("it handles when current version is 1.0.0 and latest 2.0.0", async () => {
    const cacheRelease = stub(_internals, "cacheRelease");
    const builder = { addItem: () => Promise.resolve() };
    const buildStub = stub(builder, "addItem");

    try {
      const config = {
        checkForUpdates: true,
        latestVersion: "2.0.0",
        currentVersion: "1.0.0",
        baseUrl: "githubUrl",
      } as Config;
      const update = await updateAvailableItem(builder, config);
      assertSpyCall(buildStub, 0, {
        args: [
          {
            arg: "githubUrl/whomwah/alfred-github-workflow/releases/v2.0.0",
            icon: "folder",
            skipMatch: true,
            skipUID: true,
            subtitle:
              "A new version 2.0.0 (current: 1.0.0) is available for download",
            title: "Update available (2.0.0)",
          },
        ],
      });
      assertEquals(update, undefined);
    } finally {
      cacheRelease.restore();
    }
  });

  it("it does check 7 days minus 1 second ago", async () => {
    const fetchAndStore = stub(_internals, "fetchAndStore");
    const builder = { addItem: () => Promise.resolve() };
    const timeEpoch = 1666000000000;
    const time = new FakeTime(timeEpoch);
    // 7 days - 1 second ago
    const lastChecked = timeEpoch - 1000 * 60 * 60 * 24 * 7 - 1;

    try {
      const config = {
        checkForUpdates: true,
        latestVersion: "2.0.0",
        currentVersion: "1.0.0",
        latestVersionLastChecked: lastChecked,
      } as Config;
      const update = await updateAvailableItem(builder, config);
      assertSpyCall(fetchAndStore, 0, {
        args: [config, 1666000000000],
      });
      assertEquals(update, undefined);
    } finally {
      fetchAndStore.restore();
      time.restore();
    }
  });

  it("it doesn't check 7 days plus 1 second ago", async () => {
    const builder = { addItem: () => Promise.resolve() };
    const timeEpoch = 1666000000000;
    const time = new FakeTime(timeEpoch);
    // 7 days and 1 second ago
    const lastChecked = timeEpoch - 1000 * 60 * 60 * 24 * 7 + 1;

    try {
      const config = {
        checkForUpdates: true,
        latestVersion: "2.0.0",
        currentVersion: "1.0.0",
        latestVersionLastChecked: lastChecked,
      } as Config;
      const update = await updateAvailableItem(builder, config);
      assertEquals(update, undefined);
    } finally {
      time.restore();
    }
  });
});
