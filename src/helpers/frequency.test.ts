import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { updateFrequency } from "./frequency.ts";

Deno.test("#updateFrequency", async (t) => {
  await t.step("it has a default of weekly", () => {
    assertEquals(updateFrequency(), 7);
  });

  await t.step("it uses passed in value", () => {
    assertEquals(updateFrequency("monthly"), 30);
  });
});

Deno.test("#cacheUpdateFrequency", async (t) => {
  await t.step("it has a default of weekly", () => {
    assertEquals(updateFrequency(), 7);
  });

  await t.step("it uses passed in value", () => {
    assertEquals(updateFrequency("daily"), 1);
  });
});
