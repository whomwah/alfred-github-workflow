import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import {
  resolvesNext,
  stub,
} from "https://deno.land/std@0.156.0/testing/mock.ts";
import { DB } from "../deps.ts";
import { Config } from "./helpers/config.ts";
import { GhRepo, GhUser } from "./helpers/github.ts";
import { queryArgs } from "./helpers/query.ts";
import Search, { _internals } from "./search.ts";

const config = {
  baseUrl: "https://github.com",
  baseApiUrl: "https://api.github.com",
  baseGistUrl: "https://gist.github.com",
  perPage: 50,
  db: "" as unknown as DB,
} as Config;

Deno.test("When we have an empty access token", async (t) => {
  await t.step("it should show login options", async () => {
    const query = "";
    const items: Alfred.Item[] = [];
    const args = queryArgs(query);
    await Search(args, items, config);

    assertEquals(items.length, 2);

    assertEquals(items[0].title, "Login");
    assertEquals(items[0].autocomplete, "> login");
    assertEquals(
      items[0].arg,
      "###login###https://github.com/login/oauth/authorize?client_id=869cbedd6ed52af80986&scope=repo,gist&state=robotsonghalfredworkflow",
    );
    assertEquals(items[0].icon, { path: "./icons/login.png" });

    assertEquals(items[1].title, "Login <access_token>");
    assertEquals(items[1].autocomplete, "> login ");
    assertEquals(items[1].arg, "###login_with_token###<access_token>");
    assertEquals(items[1].icon, { path: "./icons/login.png" });
  });

  await t.step("it should handle token in query", async () => {
    const query = "login abc123";
    const items: Alfred.Item[] = [];
    const args = queryArgs(query);
    await Search(args, items, config);

    assertEquals(items.length, 1);

    assertEquals(items[0].title, "Login abc123");
    assertEquals(items[0].autocomplete, "> login ");
    assertEquals(items[0].arg, "###login_with_token###abc123");
    assertEquals(items[0].icon, { path: "./icons/login.png" });
  });
});

Deno.test("When we have a access token", async (t) => {
  await t.step("it should show partial results", async () => {
    config.token = "abcdefg123444";
    const user = {
      login: "whomwah",
      html_url: "http://foo.com",
    } as GhUser;
    const repo = {
      full_name: "whomwah/rqrcode",
      description: "A lib for encoding QR Codes",
      private: false,
      html_url: "http://rqrcode.com",
    } as GhRepo;
    const star = {
      full_name: "whomwah/rqrcode_core",
      description: "A core lib for encoding QR Codes",
      private: true,
      html_url: "http://rqrcode-core.com",
    } as GhRepo;

    const userFetch = stub(_internals, "fetchUsers", resolvesNext([[user]]));
    const repoFetch = stub(_internals, "fetchRepos", resolvesNext([[repo]]));
    const starFetch = stub(_internals, "fetchStars", resolvesNext([[star]]));

    try {
      const query = "rqre";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query);
      await Search(args, items, config);

      assertEquals(items.length, 3);

      assertEquals(items[0].title, "whomwah/rqrcode");
      assertEquals(items[0].autocomplete, "whomwah/rqrcode ");
      assertEquals(items[0].subtitle, "A lib for encoding QR Codes");
      assertEquals(items[0].arg, "http://rqrcode.com");
      assertEquals(items[0].icon, { path: "./icons/repos.png" });

      assertEquals(items[1].title, "whomwah/rqrcode_core");
      assertEquals(items[1].autocomplete, "whomwah/rqrcode_core ");
      assertEquals(items[1].subtitle, "A core lib for encoding QR Codes");
      assertEquals(items[1].arg, "http://rqrcode-core.com");
      assertEquals(items[1].icon, { path: "./icons/private-repo.png" });

      assertEquals(items[2].title, "Search Github for 'rqre'");
      assertEquals(items[2].arg, "https://github.com/search?q=rqre");
      assertEquals(items[2].icon, { path: "./icon.png" });
      assertEquals(items[2].valid, true);
    } finally {
      userFetch.restore();
      repoFetch.restore();
      starFetch.restore();
    }
  });

  await t.step("it should show full results", async () => {
    config.token = "abcdefg123444";
    const user = {
      login: "whomwah",
      html_url: "http://foo.com",
    } as GhUser;
    const repo = {
      full_name: "whomwah/rqrcode",
      description: "A lib for encoding QR Codes",
      private: false,
      html_url: "http://rqrcode.com",
    } as GhRepo;
    const star = {
      full_name: "whomwah/rqrcode_core",
      description: "A core lib for encoding QR Codes",
      private: true,
      html_url: "http://rqrcode-core.com",
    } as GhRepo;

    const userFetch = stub(_internals, "fetchUsers", resolvesNext([[user]]));
    const repoFetch = stub(_internals, "fetchRepos", resolvesNext([[repo]]));
    const starFetch = stub(_internals, "fetchStars", resolvesNext([[star]]));

    try {
      const query = "";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query);
      await Search(args, items, config);

      assertEquals(items.length, 5);

      assertEquals(items[0].title, "My ...");
      assertEquals(items[0].subtitle, "Pull requests, Repos, Setting etc...");
      assertEquals(items[0].icon, { path: "./icons/forward.png" });

      assertEquals(items[1].title, "Gists ...");
      assertEquals(items[1].subtitle, "View your Gists");
      assertEquals(items[1].icon, { path: "./icons/forward.png" });

      assertEquals(items[2].title, "whomwah/rqrcode");
      assertEquals(items[2].subtitle, "A lib for encoding QR Codes");
      assertEquals(items[2].arg, "http://rqrcode.com");
      assertEquals(items[2].icon, { path: "./icons/repos.png" });

      assertEquals(items[3].title, "@whomwah");
      assertEquals(items[3].arg, "http://foo.com");
      assertEquals(items[3].icon, { path: "./icons/user.png" });

      assertEquals(items[4].title, "whomwah/rqrcode_core");
      assertEquals(items[4].subtitle, "A core lib for encoding QR Codes");
      assertEquals(items[4].arg, "http://rqrcode-core.com");
      assertEquals(items[4].icon, { path: "./icons/private-repo.png" });
    } finally {
      userFetch.restore();
      repoFetch.restore();
      starFetch.restore();
    }
  });

  await t.step("it should fallback to search", async () => {
    config.token = "abcdefg123444";
    const user = {
      login: "whomwah",
      html_url: "http://foo.com",
    } as GhUser;
    const repo = {
      full_name: "whomwah/rqrcode",
      description: "A lib for encoding QR Codes",
      private: false,
      html_url: "http://rqrcode.com",
    } as GhRepo;
    const star = {
      full_name: "whomwah/rqrcode_core",
      description: "A core lib for encoding QR Codes",
      private: true,
      html_url: "http://rqrcode-core.com",
    } as GhRepo;

    const userFetch = stub(_internals, "fetchUsers", resolvesNext([[user]]));
    const repoFetch = stub(_internals, "fetchRepos", resolvesNext([[repo]]));
    const starFetch = stub(_internals, "fetchStars", resolvesNext([[star]]));

    try {
      const query = "xxxxxxxxxxxxxx";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query);
      await Search(args, items, config);

      assertEquals(items.length, 1);
      assertEquals(items[0].title, "Search Github for 'xxxxxxxxxxxxxx'");
      assertEquals(items[0].arg, "https://github.com/search?q=xxxxxxxxxxxxxx");
      assertEquals(items[0].icon, { path: "./icon.png" });
      assertEquals(items[0].valid, true);
    } finally {
      userFetch.restore();
      starFetch.restore();
      repoFetch.restore();
    }
  });
});
