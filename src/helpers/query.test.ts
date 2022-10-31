import { assertEquals } from "https://deno.land/std@0.156.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.156.0/testing/bdd.ts";
import { queryArgs } from "./query.ts";

describe("#queryArgs", () => {
  it("it handles a default query", () => {
    assertEquals(queryArgs("whomwah/rqrcode"), {
      prefix: undefined,
      action: "whomwah/rqrcode",
      parts: [
        "whomwah/rqrcode",
      ],
      lastPart: "whomwah/rqrcode",
      query: "whomwah/rqrcode",
      isSubCmd: false,
    });
  });

  it("it handles a sub query", () => {
    assertEquals(queryArgs("whomwah/rqrcode dashboard"), {
      prefix: undefined,
      action: "whomwah/rqrcode",
      parts: [
        "whomwah/rqrcode",
        "dashboard",
      ],
      lastPart: "dashboard",
      query: "whomwah/rqrcode dashboard",
      isSubCmd: true,
    });
  });

  it("it handles a prefix", () => {
    assertEquals(queryArgs(">", ">"), {
      prefix: ">",
      action: "",
      parts: [""],
      lastPart: "",
      query: ">",
      isSubCmd: false,
    });
  });

  it("it handles a prefix sub command", () => {
    assertEquals(queryArgs("my help", "my"), {
      prefix: "my",
      action: "help",
      parts: ["help"],
      lastPart: "help",
      query: "my help",
      isSubCmd: false,
    });
  });
});