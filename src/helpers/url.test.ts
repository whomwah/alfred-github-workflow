import { assertEquals } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import {
  returnsNext,
  stub,
} from "https://deno.land/std@0.160.0/testing/mock.ts";
import { hasCustomSrcPath, openUrlInBrowser } from "./url.ts";

const result = {
  success: false,
  stderr: new Uint8Array(32),
  stdout: new Uint8Array(32),
  code: 1,
  signal: null,
} as Deno.CommandOutput;

const status = {
  output: () => Promise.resolve(result),
} as Deno.Command;

Deno.test("#openUrlInBrowser", async (t) => {
  await t.step("it opens valid urls", async () => {
    const denoRun = stub(Deno, "Command", returnsNext([status]));

    try {
      const open = await openUrlInBrowser("http://whomwah.com");
      assertEquals(open, undefined);
    } finally {
      denoRun.restore();
    }
  });

  await t.step("it ignores invalid urls", async () => {
    const denoRun = stub(Deno, "Command", returnsNext([status]));
    const consoleStub = stub(console, "error");

    try {
      const open = await openUrlInBrowser("http/whomwah.com");
      assertEquals(open, true);
    } finally {
      denoRun.restore();
      consoleStub.restore();
    }
  });
});

Deno.test("#hasCustomSrcPath", async (t) => {
  await t.step("it handles when INIT_FILE has changed", () => {
    const before = Deno.env.get("INIT_FILE");
    Deno.env.set("INIT_FILE", "mynewvalue");

    assertEquals(hasCustomSrcPath(), true);

    if (before) {
      Deno.env.set("INIT_FILE", before);
    }
  });

  await t.step("it handles when INIT_FILE has not been changed", () => {
    const before = Deno.env.get("INIT_FILE");
    Deno.env.set("INIT_FILE", "mod.min.js");

    assertEquals(hasCustomSrcPath(), false);

    if (before) {
      Deno.env.set("INIT_FILE", before);
    }
  });
});
