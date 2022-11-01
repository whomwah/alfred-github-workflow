import { assert } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { fuzzyMatch } from "./utils.ts";

Deno.test("#fuzzyMatch", async (t) => {
  await t.step("it handles various matches", () => {
    assert(fuzzyMatch("duncan", "du"));
    assert(fuzzyMatch("duncan", "can"));
    assert(fuzzyMatch("duncan", "dcan"));
    assert(fuzzyMatch("duncan", "unn"));
    assert(fuzzyMatch("whomwah", "w"));
    assert(fuzzyMatch("whomwah", "wm"));
    assert(fuzzyMatch("whomwah", "whh"));
    assert(fuzzyMatch("this is amazing", "thz"));
    assert(fuzzyMatch("this is amazing", "amin"));
    assert(fuzzyMatch("this is amazing", "tiiz"));
  });
});
