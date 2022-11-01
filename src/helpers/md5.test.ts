import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { createMd5Hash } from "./md5.ts";

Deno.test("#createMd5Hash", async () => {
  assertEquals(
    await createMd5Hash("duncan"),
    "f4d677934c35431de0c814a1bdc9993c"
  );

  assertEquals(
    await createMd5Hash("whomwah"),
    "f20c1b3028aca7d8f28bc5ac0ab4067b"
  );
});
