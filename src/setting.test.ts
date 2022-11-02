import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import {
  returnsNext,
  stub,
} from "https://deno.land/std@0.156.0/testing/mock.ts";
import { DB } from "../deps.ts";
import { CacheItem } from "./helpers/cache.ts";
import { Config } from "./helpers/config.ts";
import { queryArgs } from "./helpers/query.ts";
import Setting, { _internals } from "./setting.ts";

const config = {
  baseUrl: "https://github.com",
  baseApiUrl: "https://api.github.com",
  baseGistUrl: "https://gist.github.com",
  perPage: 50,
  db: "" as unknown as DB,
} as Config;

Deno.test("When we have no access token", async (t) => {
  await t.step("it should show login options", async () => {
    const query = ">";
    const items: Alfred.Item[] = [];
    const args = queryArgs(query, ">");
    await Setting(args, items, config);

    assertEquals(items.length, 2);
    assertEquals(items[0]?.title, "Login");
    assertEquals(items[0]?.autocomplete, "> login");
    assertEquals(items[1]?.title, "Login <access_token>");
    assertEquals(items[1]?.autocomplete, "> login ");
  });

  await t.step("it should show login with token", async () => {
    const query = "> login abc";
    const items: Alfred.Item[] = [];
    const args = queryArgs(query, ">");
    await Setting(args, items, config);

    assertEquals(items.length, 1);
    assertEquals(items[0]?.title, "Login abc");
    assertEquals(items[0]?.autocomplete, "> login ");
  });
});

Deno.test("When we have an access token", async (t) => {
  await t.step("it should valid settings", async () => {
    config.token = "abcdefg123444";
    const query = ">";
    const items: Alfred.Item[] = [];
    const args = queryArgs(query, ">");
    await Setting(args, items, config);

    assertEquals(items.length, 6);

    assertEquals(items[0]?.title, "Logout");
    assertEquals(items[0]?.autocomplete, "> logout");
    assertEquals(items[0]?.arg, "###logout###");
    assertEquals(items[0]?.icon, { path: "./icons/logout.png" });

    assertEquals(items[1]?.title, "Delete database");
    assertEquals(items[1]?.autocomplete, "> delete database");
    assertEquals(items[1]?.arg, "###database_delete###");
    assertEquals(items[1]?.icon, { path: "./icons/delete.png" });

    assertEquals(items[2]?.title, "Clear");
    assertEquals(items[2]?.autocomplete, "> clear ");
    assertEquals(items[2]?.icon, { path: "./icons/delete.png" });

    assertEquals(items[3]?.title, "Check");
    assertEquals(items[3]?.autocomplete, "> check");
    assertEquals(items[3]?.icon, { path: "./icons/refresh.png" });
    assertEquals(items[3]?.arg, "###update_available###");

    assertEquals(items[4]?.title, "Source folder");
    assertEquals(items[4]?.autocomplete, "> source");
    assertEquals(items[4]?.icon, { path: "./icons/book.png" });
    assertEquals(items[4]?.arg, "###workflow_open###");

    assertEquals(items[5]?.title, "Help");
    assertEquals(items[5]?.autocomplete, "> help");
    assertEquals(
      items[5]?.arg,
      "https://github.com/whomwah/alfred-github-workflow/blob/main/README.md",
    );
    assertEquals(items[5]?.icon, { path: "./icons/help.png" });
  });

  await t.step(
    "it shouldn't show src if INIT_PATH hasn't changed",
    async () => {
      const originalInitFile = Deno.env.get("INIT_FILE");
      Deno.env.set("INIT_FILE", "mod.min.js");

      config.token = "abcdefg123444";
      const query = ">";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, ">");
      await Setting(args, items, config);

      assertEquals(items.length, 5);

      assertEquals(items[0]?.title, "Logout");
      assertEquals(items[0]?.autocomplete, "> logout");
      assertEquals(items[0]?.arg, "###logout###");
      assertEquals(items[0]?.icon, { path: "./icons/logout.png" });

      assertEquals(items[1]?.title, "Delete database");
      assertEquals(items[1]?.autocomplete, "> delete database");
      assertEquals(items[1]?.arg, "###database_delete###");
      assertEquals(items[1]?.icon, { path: "./icons/delete.png" });

      assertEquals(items[2]?.title, "Clear");
      assertEquals(items[2]?.autocomplete, "> clear ");
      assertEquals(items[2]?.icon, { path: "./icons/delete.png" });

      assertEquals(items[3]?.title, "Check");
      assertEquals(items[3]?.autocomplete, "> check");
      assertEquals(items[3]?.icon, { path: "./icons/refresh.png" });
      assertEquals(items[3]?.arg, "###update_available###");

      assertEquals(items[4]?.title, "Help");
      assertEquals(items[4]?.autocomplete, "> help");
      assertEquals(
        items[4]?.arg,
        "https://github.com/whomwah/alfred-github-workflow/blob/main/README.md",
      );
      assertEquals(items[4]?.icon, { path: "./icons/help.png" });

      if (originalInitFile) {
        Deno.env.set("INIT_FILE", originalInitFile);
      } else {
        Deno.env.delete("INIT_FILE");
      }
    },
  );

  await t.step("it should all clear settings", async () => {
    config.token = "abcdefg123444";
    const cache = {
      url: "https://api.github.com/user/repos?per_page=100",
      timestamp: 1663964070392,
    } as CacheItem;
    const cacheFetch = stub(
      _internals,
      "fetchCacheItems",
      returnsNext([[cache]]),
    );

    try {
      const query = "> clear";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, ">");
      await Setting(args, items, config);

      assertEquals(items.length, 3);

      assertEquals(items[0]?.title, "Clear your repos");
      assertEquals(items[0]?.autocomplete, "> clear your repos");
      assertEquals(items[0]?.arg, "###refresh_cache###/user/repos");
      assertEquals(items[0]?.icon, { path: "./icons/refresh.png" });

      assertEquals(items[1]?.title, "Clear all data");
      assertEquals(items[1]?.autocomplete, "> clear all data");
      assertEquals(items[1]?.arg, "###cache_delete###");
      assertEquals(items[1]?.icon, { path: "./icons/delete.png" });

      assertEquals(items[2]?.title, "Help");
      assertEquals(items[2]?.autocomplete, "> help");
      assertEquals(
        items[2]?.arg,
        "https://github.com/whomwah/alfred-github-workflow/blob/main/README.md",
      );
      assertEquals(items[2]?.icon, { path: "./icons/help.png" });
    } finally {
      cacheFetch.restore();
    }
  });

  await t.step("it should specific clear settings", async () => {
    config.token = "abcdefg123444";
    const cache1 = {
      url: "https://api.github.com/user/repos?per_page=100",
      timestamp: 1663964070392,
    } as CacheItem;
    const cache2 = {
      url: "https://api.github.com/user/following?per_page=100",
      timestamp: 1663964070392,
    } as CacheItem;
    const cacheFetch = stub(
      _internals,
      "fetchCacheItems",
      returnsNext([[cache1, cache2]]),
    );

    try {
      const query = "> clear follow";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, ">");
      await Setting(args, items, config);

      assertEquals(items.length, 2);

      assertEquals(items[0]?.title, "Clear users you follow");
      assertEquals(items[0]?.autocomplete, "> clear users you follow");
      assertEquals(items[0]?.arg, "###refresh_cache###/user/following");
      assertEquals(items[0]?.icon, { path: "./icons/refresh.png" });

      assertEquals(items[1]?.title, "Help");
      assertEquals(items[1]?.autocomplete, "> help");
      assertEquals(
        items[1]?.arg,
        "https://github.com/whomwah/alfred-github-workflow/blob/main/README.md",
      );
      assertEquals(items[1]?.icon, { path: "./icons/help.png" });
    } finally {
      cacheFetch.restore();
    }
  });
});
