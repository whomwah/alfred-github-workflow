import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { capitalize, fuzzyMatch, uniq } from "./utils.ts";
import "../alfred.d.ts";

Deno.test("#fuzzyMatch", async (t) => {
  await t.step("it handles various matches", () => {
    assert(fuzzyMatch("", "fallback"));
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

Deno.test("#uniq", async (t) => {
  await t.step("it handles duplicates", () => {
    const list: Alfred.Item[] = [
      {
        uid: "abc123",
        title: "my title",
        subtitle: "my subtitle",
        arg: "arg",
      },
      {
        uid: "abc123",
        title: "my title",
        subtitle: "my subtitle",
        arg: "arg",
      },
    ];

    assertEquals<Alfred.Item[]>(uniq(list), [list[0]]);
  });

  await t.step("it only removes dupes", () => {
    const list: Alfred.Item[] = [
      {
        uid: "abc123",
        title: "my title copied",
        subtitle: "my subtitle",
        arg: "arg",
      },
      {
        uid: "abc321",
        title: "my title",
        subtitle: "my subtitle",
        arg: "arg",
      },
    ];

    assertEquals<Alfred.Item[]>(uniq(list), list);
  });
});

Deno.test("#capitalise", async (t) => {
  await t.step("it capitalises the first letter", () => {
    assertEquals(capitalize("duncan"), "Duncan");
    assertEquals(capitalize("robertson"), "Robertson");
    assertEquals(capitalize("fred spanner"), "Fred spanner");
  });
});
