import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import {
  resolvesNext,
  stub,
} from "https://deno.land/std@0.156.0/testing/mock.ts";
import { DB } from "../deps.ts";
import { Config } from "./helpers/config.ts";
import { GhUser } from "./helpers/github.ts";
import { queryArgs } from "./helpers/query.ts";
import Mine, { _internals } from "./mine.ts";

const config = {
  baseUrl: "https://github.com",
  baseApiUrl: "https://api.github.com",
  baseGistUrl: "https://gist.github.com",
  perPage: 50,
  db: "" as unknown as DB,
} as Config;

Deno.test("When we have an empty token", async (t) => {
  await t.step("it should show nothing", async () => {
    const query = "my";
    const items: Alfred.Item[] = [];
    const args = queryArgs(query, "my");
    await Mine(args, items, config);

    assertEquals(items, []);
  });
});

Deno.test("When we have an empty token", async (t) => {
  await t.step("it should show options that user", async () => {
    config.token = "abcdefg123444";
    const user = { login: "whomwah" } as GhUser;
    const userFetch = stub(_internals, "fetchUser", resolvesNext([[user]]));

    try {
      const query = "my";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, "my");
      await Mine(args, items, config);

      assertEquals(items.length, 12);

      assertEquals(items[0].title, "Pull requests");
      assertEquals(items[0].autocomplete, "my pull requests");
      assertEquals(items[0].subtitle, "View your pull requests");
      assertEquals(items[0].arg, "https://github.com/pulls");
      assertEquals(items[0].icon, { path: "./icons/prs.png" });

      assertEquals(items[1].title, "Gists");
      assertEquals(items[1].autocomplete, "my gists");
      assertEquals(items[1].subtitle, "View your gists");
      assertEquals(items[1].arg, "https://gist.github.com/whomwah");
      assertEquals(items[1].icon, { path: "./icons/gists.png" });

      assertEquals(items[2].title, "Repos");
      assertEquals(items[2].autocomplete, "my repos");
      assertEquals(items[2].subtitle, "View your repositories");
      assertEquals(items[2].arg, "https://github.com/whomwah?tab=repositories");
      assertEquals(items[2].icon, { path: "./icons/repos.png" });

      assertEquals(items[3].title, "Repos new");
      assertEquals(items[3].autocomplete, "my repos new");
      assertEquals(items[3].subtitle, "Create a new repository");
      assertEquals(items[3].arg, "https://github.com/new");
      assertEquals(items[3].icon, { path: "./icons/repos.png" });

      assertEquals(items[4].title, "Issues");
      assertEquals(items[4].autocomplete, "my issues");
      assertEquals(items[4].subtitle, "View your issues");
      assertEquals(items[4].arg, "https://github.com/issues");
      assertEquals(items[4].icon, { path: "./icons/issues.png" });

      assertEquals(items[5].title, "Profile");
      assertEquals(items[5].autocomplete, "my profile");
      assertEquals(items[5].subtitle, "View your public user profile");
      assertEquals(items[5].arg, "https://github.com/whomwah");
      assertEquals(items[5].icon, { path: "./icons/profile.png" });

      assertEquals(items[6].title, "Dashboard");
      assertEquals(items[6].autocomplete, "my dashboard");
      assertEquals(items[6].subtitle, "View your dashboard");
      assertEquals(items[6].arg, "https://github.com");
      assertEquals(items[6].icon, { path: "./icons/dashboard.png" });

      assertEquals(items[7].title, "Stars");
      assertEquals(items[7].autocomplete, "my stars");
      assertEquals(items[7].subtitle, "View your stars");
      assertEquals(items[7].arg, "https://github.com/whomwah?tab=stars");
      assertEquals(items[7].icon, { path: "./icons/stars.png" });

      assertEquals(items[8].title, "Notifications");
      assertEquals(items[8].autocomplete, "my notifications");
      assertEquals(items[8].subtitle, "View your notifications");
      assertEquals(items[8].arg, "https://github.com/notifications");
      assertEquals(items[8].icon, { path: "./icons/notifications.png" });

      assertEquals(items[9].title, "Keys");
      assertEquals(items[9].autocomplete, "my keys");
      assertEquals(items[9].subtitle, "View and manage your SSH/GPG keys");
      assertEquals(items[9].arg, "https://github.com/settings/keys");
      assertEquals(items[9].icon, { path: "./icons/security.png" });

      assertEquals(items[10].title, "Settings");
      assertEquals(items[10].autocomplete, "my settings");
      assertEquals(items[10].subtitle, "View and manage your settings");
      assertEquals(items[10].arg, "https://github.com/settings/profile");
      assertEquals(items[10].icon, { path: "./icons/settings.png" });

      assertEquals(items[11].title, "Search Github for 'my'");
      assertEquals(items[11].arg, "https://github.com/search?q=my");
      assertEquals(items[11].icon, { path: "./icon.png" });
      assertEquals(items[11].valid, true);
    } finally {
      userFetch.restore();
    }
  });

  await t.step("it should show partial results", async () => {
    config.token = "abcdefg123444";
    const user = { login: "whomwah" } as GhUser;
    const userFetch = stub(_internals, "fetchUser", resolvesNext([[user]]));

    try {
      const query = "my notifications";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, "my");
      await Mine(args, items, config);

      assertEquals(items.length, 2);

      assertEquals(items[0].title, "Notifications");
      assertEquals(items[0].autocomplete, "my notifications");
      assertEquals(items[0].subtitle, "View your notifications");
      assertEquals(items[0].arg, "https://github.com/notifications");
      assertEquals(items[0].icon, { path: "./icons/notifications.png" });

      assertEquals(items[1].title, "Search Github for 'my notifications'");
      assertEquals(
        items[1].arg,
        "https://github.com/search?q=my notifications",
      );
      assertEquals(items[1].icon, { path: "./icon.png" });
      assertEquals(items[1].valid, true);
    } finally {
      userFetch.restore();
    }
  });

  await t.step("it should fallback to search", async () => {
    config.token = "abcdefg123444";
    const user = { login: "whomwah" } as GhUser;
    const userFetch = stub(_internals, "fetchUser", resolvesNext([[user]]));

    try {
      const query = "my zzzzzzzzzzzzzzzzzzzzz";
      const items: Alfred.Item[] = [];
      const args = queryArgs(query, "my");
      await Mine(args, items, config);

      assertEquals(items.length, 1);
      assertEquals(
        items[0].title,
        "Search Github for 'my zzzzzzzzzzzzzzzzzzzzz'",
      );
      assertEquals(
        items[0].arg,
        "https://github.com/search?q=my zzzzzzzzzzzzzzzzzzzzz",
      );
      assertEquals(items[0].icon, { path: "./icon.png" });
      assertEquals(items[0].valid, true);
    } finally {
      userFetch.restore();
    }
  });
});
