import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import Setting from "./setting.ts";

Deno.test("It should filter to show login", async () => {
  const items = await Setting("> login", []).run();
  assertEquals(items.length, 1);
  assertEquals(items[0].subtitle, "Generate OAuth access token");
});

Deno.test("It should filter to show logout", async () => {
  const items = await Setting("> logout", []).run();
  assertEquals(items.length, 1);
  assertEquals(items[0].subtitle, "Log out this workflow");
});

Deno.test("It should filter to show delete cache", async () => {
  const items = await Setting("> delete cache", []).run();
  assertEquals(items.length, 1);
  assertEquals(items[0].subtitle, "Delete GitHub Cache");
});

Deno.test("It should filter to show delete db", async () => {
  const items = await Setting("> delete database", []).run();
  assertEquals(items.length, 1);
  assertEquals(
    items[0].subtitle,
    "Delete database (contains login, config and cache)",
  );
});

Deno.test("It should filter to show update", async () => {
  const items = await Setting("> update", []).run();
  assertEquals(items.length, 3);
  assertEquals(
    items[0].subtitle,
    "There is an update for this Alfred workflow",
  );
});

Deno.test("It should filter to activate autoupdate", async () => {
  const items = await Setting("> activate autoupdate", []).run();
  assertEquals(items.length, 2);
  assertEquals(
    items[0].subtitle,
    "Activate auto updating this Alfred Workflow",
  );
});

Deno.test("It should filter to deactivate autoupdate", async () => {
  const items = await Setting("> deactivate autoupdate", []).run();
  assertEquals(items.length, 1);
  assertEquals(
    items[0].subtitle,
    "Deactivate auto updating this Alfred Workflow",
  );
});

Deno.test("It should filter to help", async () => {
  const items = await Setting("> help", []).run();
  assertEquals(items.length, 1);
  assertEquals(items[0].subtitle, "View the README");
});

Deno.test("It should filter to changelog", async () => {
  const items = await Setting("> changelog", []).run();
  assertEquals(items.length, 1);
  assertEquals(items[0].subtitle, "View the CHANGELOG");
});

Deno.test("It should filter to show login", async () => {
  const items = await Setting("> login", []).run();
  assertEquals(items.length, 1);
  assertEquals(items[0].subtitle, "Generate OAuth access token");
});

Deno.test("It should filter to show all options", async () => {
  const items = await Setting("> ", []).run();
  assertEquals(items.length, 9);
});
