import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { assert } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.156.0/testing/bdd.ts";
import { fuzzyMatch, uniqByKey } from "./utils.ts";

describe("#fuzzyMatch", () => {
  it("it handles various matches", () => {
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

describe("#uniqByKey", () => {
  it("it removes duplicates", () => {
    const items = [
      { uid: "111" },
      { uid: "222" },
      { uid: "333" },
      { uid: "111" },
    ];

    assertEquals(uniqByKey("uid", items), [
      { uid: "111" },
      { uid: "222" },
      { uid: "333" },
    ]);
  });
});
