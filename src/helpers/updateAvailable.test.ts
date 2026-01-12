import { assertEquals } from "@std/assert";
import { assertSpyCall, stub } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";
import { Config } from "./config.ts";
import { _internals, updateAvailableItem } from "./updateAvailable.ts";

Deno.test("#updateAvailableItem", async (t) => {
  await t.step("it handle not checking for updates", async () => {
    const config = {
      checkForUpdates: false,
    } as Config;
    const builder = { addItem: () => Promise.resolve() };
    const update = await updateAvailableItem(builder, config);
    assertEquals(update, null);
  });

  await t.step(
    "it handles when current version is 1.0.0 and latest 1.0.0",
    async () => {
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
    },
  );

  await t.step(
    "it handles when current version is 1.0.0 and latest 0.9.0",
    async () => {
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
    },
  );

  await t.step(
    "it handles when current version is 1.0.0 and latest 2.0.0",
    async () => {
      const cacheRelease = stub(_internals, "cacheRelease");
      const builder = { addItem: () => Promise.resolve() };
      const buildStub = stub(builder, "addItem");

      try {
        const config = {
          checkForUpdates: true,
          latestVersion: "2.0.0",
          currentVersion: "1.0.0",
        } as Config;
        const update = await updateAvailableItem(builder, config);
        assertSpyCall(buildStub, 0, {
          args: [
            {
              arg: "###update_available###",
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
    },
  );

  await t.step("it does check weekly minus 1 second ago", async () => {
    const { promise, resolve } = Promise.withResolvers<void>();
    const fetchAndStore = stub(_internals, "fetchAndStore", () => {
      resolve();
      return Promise.resolve();
    });
    const builder = { addItem: () => Promise.resolve() };
    const timeEpoch = 1666000000; // in seconds
    const time = new FakeTime(timeEpoch * 1000);
    // 7 days - 1 second ago
    const lastChecked = timeEpoch - 60 * 60 * 24 * 7 - 1;

    try {
      const config = {
        checkForUpdates: true,
        latestVersion: "2.0.0",
        currentVersion: "1.0.0",
        latestVersionLastChecked: lastChecked,
      } as Config;
      const update = await updateAvailableItem(builder, config);
      // Wait for fire-and-forget to complete
      await promise;
      assertSpyCall(fetchAndStore, 0, {
        args: [config, timeEpoch],
      });
      assertEquals(update, undefined);
    } finally {
      fetchAndStore.restore();
      time.restore();
    }
  });

  await t.step("it doesn't check weekly plus 1 second ago", async () => {
    const builder = { addItem: () => Promise.resolve() };
    const timeEpoch = 1666000000; // in seconds
    const time = new FakeTime(timeEpoch);
    // 7 days and 1 second ago
    const lastChecked = timeEpoch - 60 * 60 * 24 * 7 + 1;

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

  await t.step(
    "it does check daily if set in preferences plus 1 second",
    async () => {
      const originalInitFile = Deno.env.get("updateFrequency");
      Deno.env.set("updateFrequency", "daily");

      const builder = { addItem: () => Promise.resolve() };
      const timeEpoch = 1666000000; // in seconds
      const time = new FakeTime(timeEpoch);
      // 1 day and 1 second ago
      const lastChecked = timeEpoch - 60 * 60 * 24 * 1 + 1;

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

      if (originalInitFile) {
        Deno.env.set("updateFrequency", originalInitFile);
      } else {
        Deno.env.delete("updateFrequency");
      }
    },
  );
});
