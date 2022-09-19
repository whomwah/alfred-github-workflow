import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.156.0/testing/bdd.ts";
import { DB } from "../deps.ts";
import { Config } from "./helpers/config.ts";
import { queryArgs } from "./helpers/query.ts";
import { Item } from "./item.ts";
import Setting from "./setting.ts";

const config: Config = {
  baseUrl: "https://github.com",
  baseApiUrl: "https://api.github.com",
  baseGistUrl: "https://gist.github.com",
  perPage: 50,
  db: "" as unknown as DB,
};

describe("When we have no access token", () => {
  it("it should show login options", async () => {
    const query = ">";
    const items: Item[] = [];
    const args = queryArgs(query, ">");
    await Setting(args, items, config);

    assertEquals(items.length, 2);
    assertEquals(items[0]?.title, "> login");
    assertEquals(items[1]?.title, "> login <access_token>");
  });

  it("it should show login with token", async () => {
    const query = "> login abc";
    const items: Item[] = [];
    const args = queryArgs(query, ">");
    await Setting(args, items, config);

    assertEquals(items.length, 1);
    assertEquals(items[0]?.title, "> login abc");
  });
});

describe("When we have an access token", () => {
  it("it should valid settings", async () => {
    config.token = "abcdefg123444";
    const query = ">";
    const items: Item[] = [];
    const args = queryArgs(query, ">");
    await Setting(args, items, config);

    assertEquals(items.length, 4);

    assertEquals(items[0]?.title, "> help");
    assertEquals(
      items[0]?.arg,
      "https://github.com/whomwah/alfred-github-workflow/blob/main/README.md",
    );
    assertEquals(items[0]?.icon, { path: "./icons/help.png" });

    assertEquals(items[1]?.title, "> logout");
    assertEquals(items[1]?.arg, "###logout###");
    assertEquals(items[1]?.icon, { path: "./icons/logout.png" });

    assertEquals(items[2]?.title, "> delete cache");
    assertEquals(items[2]?.arg, "###cache_delete###");
    assertEquals(items[2]?.icon, { path: "./icons/delete.png" });

    assertEquals(items[3]?.title, "> delete database");
    assertEquals(items[3]?.arg, "###database_delete###");
    assertEquals(items[3]?.icon, { path: "./icons/delete.png" });
  });
});
