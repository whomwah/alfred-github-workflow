import { assertEquals } from "@std/assert";
import { createHash } from "./md5.ts";

Deno.test("#createHash", () => {
  // Verify the sync hash produces consistent results
  assertEquals(createHash("duncan"), createHash("duncan"));
  assertEquals(createHash("whomwah"), createHash("whomwah"));

  // Different inputs produce different outputs
  const hash1 = createHash("duncan");
  const hash2 = createHash("whomwah");
  assertEquals(hash1 !== hash2, true);
});
