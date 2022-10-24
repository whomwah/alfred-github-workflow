import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.156.0/testing/bdd.ts";
import {
  resolvesNext,
  stub,
} from "https://deno.land/std@0.156.0/testing/mock.ts";
import { DB } from "../deps.ts";
import { Config } from "./helpers/config.ts";
import { GhUser } from "./helpers/github.ts";
import { queryArgs } from "./helpers/query.ts";
import User, { _internals } from "./user.ts";

const config = {
  baseUrl: "https://github.com",
  baseApiUrl: "https://api.github.com",
  baseGistUrl: "https://gist.github.com",
  perPage: 50,
  db: "" as unknown as DB,
} as Config;

describe("When we have an empty token", () => {
  it("it should show nothing", async () => {
    const query = "@";
    const items: Alfred.Item[] = [];
    const args = queryArgs(query, "@");
    await User(args, items, config);

    assertEquals(items, []);
  });
});

describe("When we have a access token", () => {
  it("it should show partial results", async () => {
    config.token = "abcdefg123444";
    const user1 = {
      login: "whomwah",
      html_url: "http://foo.com",
    } as GhUser;
    const user2 = {
      login: "hawmohw",
      html_url: "http://bar.com",
    } as GhUser;
    const userFetch = stub(
      _internals,
      "fetchUsers",
      resolvesNext([[user1, user2]]),
    );

    try {
      const query = "@whomwah";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, "@");
      await User(args, items, config);

      assertEquals(items.length, 2);

      assertEquals(items[0].title, "@whomwah");
      assertEquals(items[0].arg, "http://foo.com");
      assertEquals(items[0].icon, { path: "./icons/user.png" });

      assertEquals(items[1].title, "Search Github for '@whomwah'");
      assertEquals(items[1].arg, "https://github.com/search?q=@whomwah");
      assertEquals(items[1].icon, { path: "./icon.png" });
      assertEquals(items[1].valid, true);
    } finally {
      userFetch.restore();
    }
  });

  it("it should show full results", async () => {
    config.token = "abcdefg123444";
    const user1 = {
      login: "whomwah",
      html_url: "http://foo.com",
    } as GhUser;
    const user2 = {
      login: "hawmohw",
      html_url: "http://bar.com",
    } as GhUser;
    const userFetch = stub(
      _internals,
      "fetchUsers",
      resolvesNext([[user1, user2]]),
    );

    try {
      const query = "@";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, "@");
      await User(args, items, config);

      assertEquals(items.length, 3);

      assertEquals(items[0].title, "@whomwah");
      assertEquals(items[0].arg, "http://foo.com");
      assertEquals(items[0].icon, { path: "./icons/user.png" });

      assertEquals(items[1].title, "@hawmohw");
      assertEquals(items[1].arg, "http://bar.com");
      assertEquals(items[1].icon, { path: "./icons/user.png" });

      assertEquals(items[2].title, "Search Github for '@'");
      assertEquals(items[2].arg, "https://github.com/search?q=@");
      assertEquals(items[2].icon, { path: "./icon.png" });
      assertEquals(items[2].valid, true);
    } finally {
      userFetch.restore();
    }
  });

  it("it should show sub commands", async () => {
    config.token = "abcdefg123444";
    const user = {
      login: "whomwah",
      html_url: "http://foo.com",
    } as GhUser;
    const userFetch = stub(_internals, "fetchUsers", resolvesNext([[user]]));

    try {
      const query = "@whomwah ";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, "@");
      await User(args, items, config);

      assertEquals(items.length, 5);

      assertEquals(items[0].title, "@whomwah overview");
      assertEquals(items[0].subtitle, "View whomwah's overview");
      assertEquals(items[0].arg, "https://github.com/whomwah");
      assertEquals(items[0].icon, { path: "./icons/user.png" });

      assertEquals(items[1].title, "@whomwah repositories");
      assertEquals(items[1].subtitle, "View whomwah's repositories");
      assertEquals(items[1].arg, "https://github.com/whomwah?tab=repositories");
      assertEquals(items[1].icon, { path: "./icons/repos.png" });

      assertEquals(items[2].title, "@whomwah stars");
      assertEquals(items[2].subtitle, "View whomwah's stars");
      assertEquals(items[2].arg, "https://github.com/whomwah?tab=stars");
      assertEquals(items[2].icon, { path: "./icons/stars.png" });

      assertEquals(items[3].title, "@whomwah gists");
      assertEquals(items[3].subtitle, "View whomwah's gists");
      assertEquals(items[3].arg, "https://gist.github.com/whomwah");
      assertEquals(items[3].icon, { path: "./icons/gists.png" });

      assertEquals(items[4].title, "Search Github for '@whomwah '");
      assertEquals(items[4].arg, "https://github.com/search?q=@whomwah ");
      assertEquals(items[4].icon, { path: "./icon.png" });
    } finally {
      userFetch.restore();
    }
  });

  it("it should fallback to search", async () => {
    config.token = "abcdefg123444";
    const user = {
      login: "whomwah",
      html_url: "http://foo.com",
    } as GhUser;
    const userFetch = stub(_internals, "fetchUsers", resolvesNext([[user]]));

    try {
      const query = "@xxxxxxxxxxx";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, "@");
      await User(args, items, config);

      assertEquals(items.length, 1);
      assertEquals(items[0].title, "Search Github for '@xxxxxxxxxxx'");
      assertEquals(items[0].arg, "https://github.com/search?q=@xxxxxxxxxxx");
      assertEquals(items[0].icon, { path: "./icon.png" });
      assertEquals(items[0].valid, true);
    } finally {
      userFetch.restore();
    }
  });
});
