import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import {
  resolvesNext,
  stub,
} from "https://deno.land/std@0.160.0/testing/mock.ts";
import { FakeTime } from "https://deno.land/std@0.160.0/testing/time.ts";
import { Database } from "sqlite";
import { Config } from "./helpers/config.ts";
import { GhGist } from "./helpers/github.ts";
import { queryArgs } from "./helpers/query.ts";
import Gists, { _internals } from "./gists.ts";

const config = {
  baseUrl: "https://github.com",
  baseApiUrl: "https://api.github.com",
  baseGistUrl: "https://gist.github.com",
  perPage: 50,
  db: "" as unknown as Database,
} as Config;

Deno.test("When we have an empty token", async (t) => {
  await t.step("it should show nothing", async () => {
    const query = "my";
    const items: Alfred.Item[] = [];
    const args = queryArgs(query, "my");
    await Gists(args, items, config);

    assertEquals(items, []);
  });
});

Deno.test("When we have a access token", async (t) => {
  await t.step("it should show partial results", async () => {
    config.token = "abcdefg123444";
    const gist = {
      id: "abc123",
      description: "A lib for encoding QR Codes",
      public: true,
      html_url: "http://link/to/gist",
      updated_at: "2011-06-20T11:34:15Z",
    } as GhGist;

    const gistFetch = stub(_internals, "fetchGists", resolvesNext([[gist]]));
    const time = new FakeTime();

    try {
      const query = "code";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query);
      await Gists(args, items, config);

      assertEquals(items.length, 2);

      assertEquals(items[0].title, "A lib for encoding QR Codes");
      assertEquals(items[0].autocomplete, undefined);
      assertEquals(
        items[0].subtitle,
        "Last updated: Mon, 20 Jun 2011 11:34:15 GMT",
      );
      assertEquals(items[0].arg, "http://link/to/gist");
      assertEquals(items[0].icon, { path: "./icons/gists.png" });

      assertEquals(items[1].title, "Search Github for 'code'");
      assertEquals(items[1].arg, "https://github.com/search?q=code");
      assertEquals(items[1].icon, { path: "./icon.png" });
      assertEquals(items[1].valid, true);
    } finally {
      gistFetch.restore();
      time.restore();
    }
  });

  await t.step("it should fallback to search", async () => {
    config.token = "abcdefg123444";
    const gist = {
      id: "abc123",
      description: "A lib for encoding QR Codes",
      public: true,
      html_url: "http://link/to/gist",
    } as GhGist;

    const gistFetch = stub(_internals, "fetchGists", resolvesNext([[gist]]));

    try {
      const query = "xxxxxxxxxxxxxx";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query);
      await Gists(args, items, config);

      assertEquals(items.length, 1);
      assertEquals(items[0].title, "Search Github for 'xxxxxxxxxxxxxx'");
      assertEquals(items[0].arg, "https://github.com/search?q=xxxxxxxxxxxxxx");
      assertEquals(items[0].icon, { path: "./icon.png" });
      assertEquals(items[0].valid, true);
    } finally {
      gistFetch.restore();
    }
  });
});
