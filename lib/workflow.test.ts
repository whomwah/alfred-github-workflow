import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.154.0/testing/mock.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.154.0/testing/asserts.ts";
import Workflow from "./workflow.ts";
import User from "./user.ts";
import Mine from "./mine.ts";
import Search from "./search.ts";
import Repo from "./repo.ts";

Deno.test("It should return a payload", async () => {
  const result = await Workflow(["> "]);
  assertEquals(JSON.parse(result).items.length, 9);
});

Deno.test("It should trigger Setting with these queries:", async (t) => {
  await t.step(">", async () => {
    const result = await Workflow([">"]);
    assert(JSON.parse(result).items.length > 0);
  });

  await t.step("> ", async () => {
    const result = await Workflow([">"]);
    assert(JSON.parse(result).items.length > 0);
  });

  await t.step("> l", async () => {
    const result = await Workflow([">"]);
    assert(JSON.parse(result).items.length > 0);
  });

  await t.step("> login", async () => {
    const result = await Workflow([">"]);
    assert(JSON.parse(result).items.length > 0);
  });

  await t.step(">login", async () => {
    const result = await Workflow([">"]);
    assert(JSON.parse(result).items.length > 0);
  });
});

Deno.test("It should not trigger Setting with these queries:", async (t) => {
  await t.step(" >", async () => {
    const result = await Workflow([" >"]);
    assert(JSON.parse(result).items.length === 0);
  });
});

Deno.test("It should pass arg to User", async () => {
  const userSpy = spy(User, "run");

  try {
    const results = await Workflow(["@whomwah"]);
    assertEquals(results, '{"items":[]}');
  } finally {
    userSpy.restore();
  }

  assertSpyCall(userSpy, 0, {
    args: ["@whomwah", []],
  });
});

Deno.test("It should trigger User", async () => {
  const userSpy = spy(User, "run");

  try {
    await Workflow(["@"]);
    await Workflow(["@u"]);
    await Workflow(["@user"]);
    await Workflow(["@user overview"]);
    await Workflow(["@user repositories"]);
    await Workflow(["@user stars"]);
    await Workflow(["@user gists"]);
  } finally {
    userSpy.restore();
  }

  assertSpyCalls(userSpy, 7);
});

Deno.test("It should not trigger User", async () => {
  const userSpy = spy(User, "run");

  try {
    await Workflow([" @"]);
    await Workflow(["@ "]);
    await Workflow(["@  "]);
  } finally {
    userSpy.restore();
  }

  assertSpyCalls(userSpy, 0);
});

Deno.test("It should pass arg to Mine", async () => {
  const mySpy = spy(Mine, "run");

  try {
    await Workflow(["my pulls review requested"]);
  } finally {
    mySpy.restore();
  }

  assertSpyCall(mySpy, 0, {
    args: ["my pulls review requested", []],
  });
});

Deno.test("It should trigger Mine", async () => {
  const mySpy = spy(Mine, "run");

  try {
    await Workflow(["my"]);
    await Workflow(["my "]);
    await Workflow(["my d"]);
    await Workflow(["my dashboard"]);
    await Workflow(["my notifications"]);
    await Workflow(["my profile"]);
    await Workflow(["my issues"]);
    await Workflow(["my issues created"]);
    await Workflow(["my issues assigned"]);
    await Workflow(["my issues mentioned"]);
    await Workflow(["my pulls"]);
    await Workflow(["my pulls created"]);
    await Workflow(["my pulls assigned"]);
    await Workflow(["my pulls mentioned"]);
    await Workflow(["my pulls review requested"]);
    await Workflow(["my repos"]);
    await Workflow(["my settings"]);
    await Workflow(["my stars"]);
    await Workflow(["my gists"]);
  } finally {
    mySpy.restore();
  }

  assertSpyCalls(mySpy, 19);
});

Deno.test("It should not trigger Mine", async () => {
  const mySpy = spy(Mine, "run");

  try {
    await Workflow([" my"]);
  } finally {
    mySpy.restore();
  }

  assertSpyCalls(mySpy, 0);
});

Deno.test("It should pass arg to Search", async () => {
  const searchSpy = spy(Search, "run");

  try {
    await Workflow(["s repo"]);
  } finally {
    searchSpy.restore();
  }

  assertSpyCall(searchSpy, 0, {
    args: ["s repo", []],
  });
});

Deno.test("It should trigger Search", async () => {
  const searchSpy = spy(Search, "run");

  try {
    await Workflow(["s"]);
    await Workflow(["s "]);
    await Workflow(["s r"]);
    await Workflow(["s repo"]);
    await Workflow(["s @user"]);
  } finally {
    searchSpy.restore();
  }

  assertSpyCalls(searchSpy, 5);
});

Deno.test("It should not trigger Search", async () => {
  const searchSpy = spy(Search, "run");

  try {
    await Workflow([" s"]);
    await Workflow(["s  "]);
  } finally {
    searchSpy.restore();
  }

  assertSpyCalls(searchSpy, 0);
});

Deno.test("It should trigger Repo", async () => {
  const repoSpy = spy(Repo, "run");

  try {
    await Workflow(["who"]);
    await Workflow(["whomwah"]);
    await Workflow(["whomwah/rqrcode"]);
  } finally {
    repoSpy.restore();
  }

  assertSpyCalls(repoSpy, 3);
});
