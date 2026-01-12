import { assertEquals, assertNotEquals } from "@std/assert";
import { Database } from "sqlite";
import {
  _internals,
  cleanCache,
  cleanupStatementCache,
  deleteCache,
  requestFromCache,
  updateCache,
} from "./cache.ts";
import { Config } from "./config.ts";

/**
 * Create an in-memory test database with the request_cache table
 */
function createTestDb(): Database {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE IF NOT EXISTS request_cache (
      url TEXT PRIMARY KEY,
      timestamp INTEGER,
      content TEXT,
      parent TEXT
    )
  `);
  return db;
}

Deno.test("Statement caching", async (t) => {
  await t.step("getCachedStatement caches statements by db and column", () => {
    const db = createTestDb();

    try {
      // First call should create a new statement
      const stmt1 = _internals.getCachedStatement(db, "url");
      assertNotEquals(stmt1, undefined);

      // Second call with same params should return cached statement
      const stmt2 = _internals.getCachedStatement(db, "url");
      assertEquals(stmt1, stmt2);

      // Different column should create a new statement
      const stmt3 = _internals.getCachedStatement(db, "parent");
      assertNotEquals(stmt3, undefined);

      // Verify the statements are different
      assertNotEquals(stmt1, stmt3);
    } finally {
      cleanupStatementCache(db);
      db.close();
    }
  });

  await t.step("cleanupStatementCache removes statements for a db", () => {
    const db1 = createTestDb();
    const db2 = createTestDb();

    try {
      // Create statements for both databases
      _internals.getCachedStatement(db1, "url");
      _internals.getCachedStatement(db1, "parent");
      _internals.getCachedStatement(db2, "url");

      // Clean up db1 statements
      cleanupStatementCache(db1);

      // Verify db1 cache is gone (WeakMap returns undefined for non-existent keys)
      assertEquals(_internals.statementCache.has(db1), false);

      // db2's statement should still exist
      assertEquals(_internals.statementCache.has(db2), true);
    } finally {
      cleanupStatementCache(db2);
      db1.close();
      db2.close();
    }
  });

  await t.step(
    "cached statements work correctly with requestFromCache",
    () => {
      const db = createTestDb();
      const config = { db } as Config;

      try {
        // Insert test data
        updateCache(db, [
          "https://api.github.com/test",
          12345,
          '{"foo":"bar"}',
          null,
        ]);

        // First request - should create cached statement
        const result1 = requestFromCache(
          config,
          "https://api.github.com/test",
          "url",
        );
        assertNotEquals(result1, undefined);
        if (result1) {
          assertEquals(result1.url, "https://api.github.com/test");
          assertEquals(result1.content, '{"foo":"bar"}');
          assertEquals(result1.timestamp, 12345);
        }

        // Second request - should use cached statement
        const result2 = requestFromCache(
          config,
          "https://api.github.com/test",
          "url",
        );
        assertNotEquals(result2, undefined);
        if (result2) {
          assertEquals(result2.url, "https://api.github.com/test");
        }

        // Verify statement was cached
        assertEquals(_internals.statementCache.has(db), true);
      } finally {
        cleanupStatementCache(db);
        db.close();
      }
    },
  );
});

Deno.test("cleanCache", async (t) => {
  await t.step("removes entries older than invalidation date", () => {
    const db = createTestDb();

    try {
      // Insert test data with different timestamps
      updateCache(db, [
        "https://api.github.com/old",
        1000,
        '{"data":"old"}',
        null,
      ]);
      updateCache(db, [
        "https://api.github.com/new",
        3000,
        '{"data":"new"}',
        null,
      ]);

      // Clean entries older than 2000
      cleanCache(db, 2000);

      // Check old entry is removed
      const stmt = db.prepare("SELECT * FROM request_cache WHERE url = ?");
      const oldRow = stmt.get("https://api.github.com/old");
      const newRow = stmt.get("https://api.github.com/new");
      stmt.finalize();

      assertEquals(oldRow, undefined);
      assertNotEquals(newRow, undefined);
    } finally {
      db.close();
    }
  });
});

Deno.test("deleteCache", async (t) => {
  await t.step("deletes all entries when no path provided", () => {
    const db = createTestDb();

    try {
      updateCache(db, ["https://api.github.com/test1", 1000, "{}", null]);
      updateCache(db, ["https://api.github.com/test2", 2000, "{}", null]);

      deleteCache(db);

      const stmt = db.prepare("SELECT COUNT(*) as count FROM request_cache");
      const result = stmt.get<{ count: number }>();
      stmt.finalize();

      assertEquals(result?.count, 0);
    } finally {
      db.close();
    }
  });

  await t.step("deletes only matching entries when path provided", () => {
    const db = createTestDb();

    try {
      updateCache(db, [
        "https://api.github.com/repos?page=1",
        1000,
        "{}",
        null,
      ]);
      updateCache(db, [
        "https://api.github.com/gists?page=1",
        2000,
        "{}",
        null,
      ]);

      deleteCache(db, "/repos");

      const stmt = db.prepare("SELECT url FROM request_cache");
      const rows = stmt.all<{ url: string }>();
      stmt.finalize();

      assertEquals(rows.length, 1);
      assertEquals(rows[0].url, "https://api.github.com/gists?page=1");
    } finally {
      db.close();
    }
  });
});

Deno.test("updateCache", async (t) => {
  await t.step("inserts new cache entries", () => {
    const db = createTestDb();

    try {
      updateCache(db, [
        "https://api.github.com/user",
        12345,
        '{"login":"test"}',
        null,
      ]);

      const stmt = db.prepare("SELECT * FROM request_cache WHERE url = ?");
      const row = stmt.get<{
        url: string;
        timestamp: number;
        content: string;
        parent: string | null;
      }>("https://api.github.com/user");
      stmt.finalize();

      assertNotEquals(row, undefined);
      if (row) {
        assertEquals(row.url, "https://api.github.com/user");
        assertEquals(row.timestamp, 12345);
        assertEquals(row.content, '{"login":"test"}');
        assertEquals(row.parent, null);
      }
    } finally {
      db.close();
    }
  });

  await t.step("replaces existing cache entries", () => {
    const db = createTestDb();

    try {
      updateCache(db, [
        "https://api.github.com/user",
        12345,
        '{"login":"old"}',
        null,
      ]);
      updateCache(db, [
        "https://api.github.com/user",
        67890,
        '{"login":"new"}',
        null,
      ]);

      const stmt = db.prepare("SELECT * FROM request_cache WHERE url = ?");
      const row = stmt.get<{
        url: string;
        timestamp: number;
        content: string;
      }>("https://api.github.com/user");
      stmt.finalize();

      assertNotEquals(row, undefined);
      if (row) {
        assertEquals(row.timestamp, 67890);
        assertEquals(row.content, '{"login":"new"}');
      }
    } finally {
      db.close();
    }
  });

  await t.step("handles parent references", () => {
    const db = createTestDb();

    try {
      updateCache(db, [
        "https://api.github.com/repos?page=2",
        12345,
        "[]",
        "https://api.github.com/repos?page=1",
      ]);

      const stmt = db.prepare("SELECT * FROM request_cache WHERE url = ?");
      const row = stmt.get<{
        url: string;
        parent: string | null;
      }>("https://api.github.com/repos?page=2");
      stmt.finalize();

      assertNotEquals(row, undefined);
      if (row) {
        assertEquals(row.parent, "https://api.github.com/repos?page=1");
      }
    } finally {
      db.close();
    }
  });
});

Deno.test("requestFromCache", async (t) => {
  await t.step("returns undefined for non-existent entries", () => {
    const db = createTestDb();
    const config = { db } as Config;

    try {
      const result = requestFromCache(
        config,
        "https://api.github.com/nonexistent",
        "url",
      );
      assertEquals(result, undefined);
    } finally {
      cleanupStatementCache(db);
      db.close();
    }
  });

  await t.step("finds entries by url column", () => {
    const db = createTestDb();
    const config = { db } as Config;

    try {
      updateCache(db, [
        "https://api.github.com/test",
        12345,
        '{"data":"test"}',
        null,
      ]);

      const result = requestFromCache(
        config,
        "https://api.github.com/test",
        "url",
      );
      assertNotEquals(result, undefined);
      if (result) {
        assertEquals(result.url, "https://api.github.com/test");
        assertEquals(result.content, '{"data":"test"}');
      }
    } finally {
      cleanupStatementCache(db);
      db.close();
    }
  });

  await t.step("finds entries by parent column", () => {
    const db = createTestDb();
    const config = { db } as Config;

    try {
      updateCache(db, [
        "https://api.github.com/repos?page=2",
        12345,
        "[]",
        "https://api.github.com/repos?page=1",
      ]);

      const result = requestFromCache(
        config,
        "https://api.github.com/repos?page=1",
        "parent",
      );
      assertNotEquals(result, undefined);
      if (result) {
        assertEquals(result.url, "https://api.github.com/repos?page=2");
        assertEquals(result.parent, "https://api.github.com/repos?page=1");
      }
    } finally {
      cleanupStatementCache(db);
      db.close();
    }
  });
});
