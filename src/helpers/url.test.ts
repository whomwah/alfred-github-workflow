import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.156.0/testing/bdd.ts";
import {
  returnsNext,
  stub,
} from "https://deno.land/std@0.156.0/testing/mock.ts";
import { hasCustomSrcPath, openUrlInBrowser } from "./url.ts";

const result: Deno.ProcessStatus = {
  success: false,
  code: 1,
};

const status = {
  status: () => Promise.resolve(result),
} as Deno.Process;

describe("#openUrlInBrowser", () => {
  it("it opens valid urls", async () => {
    const denoRun = stub(
      Deno,
      "run",
      returnsNext([status]),
    );

    try {
      const open = await openUrlInBrowser("http://whomwah.com");
      assertEquals(open, undefined);
    } finally {
      denoRun.restore();
    }
  });

  it("it ignores invalid urls", async () => {
    const denoRun = stub(
      Deno,
      "run",
      returnsNext([status]),
    );
    const consoleStub = stub(
      console,
      "error",
    );

    try {
      const open = await openUrlInBrowser("http/whomwah.com");
      assertEquals(open, true);
    } finally {
      denoRun.restore();
      consoleStub.restore();
    }
  });
});

describe("#hasCustomSrcPath", () => {
  it("it handles when INIT_FILE has changed", () => {
    const before = Deno.env.get("INIT_FILE");
    Deno.env.set("INIT_FILE", "mynewvalue");

    assertEquals(hasCustomSrcPath(), true);

    if (before) {
      Deno.env.set("INIT_FILE", before);
    }
  });

  it("it handles when INIT_FILE has not been changed", () => {
    const before = Deno.env.get("INIT_FILE");
    Deno.env.set("INIT_FILE", "mod.min.js");

    assertEquals(hasCustomSrcPath(), false);

    if (before) {
      Deno.env.set("INIT_FILE", before);
    }
  });
});
