import { Database } from "sqlite";
import { Config, removeConfig } from "./config.ts";
import { fetchNewDataFromAPIandStore } from "./github.ts";

/**
 * [:url, :timestamp, :content, :parent]
 */
export type DbCache = [string, number, string, string | null];

export interface CacheItem {
  url: string;
  timestamp: number;
}

export function cleanCache(db: Database, invalidateCacheDate: number) {
  try {
    db.exec("DELETE FROM request_cache WHERE timestamp < :time", {
      time: invalidateCacheDate,
    });
  } catch (err) {
    console.error(err);
  }
}

export function deleteCache(db: Database, path?: string) {
  const query = path
    ? `DELETE FROM request_cache WHERE LIKE('%${path}?%',url)=1`
    : "DELETE FROM request_cache";
  try {
    db.exec(query);
  } catch (err) {
    console.error(err);
  }
}

export function cacheItems(db: Database) {
  const items: CacheItem[] = [];

  const query = db.prepare(
    "SELECT url, timestamp FROM request_cache WHERE parent IS NULL",
  );

  for (const { url, timestamp } of query.all(1)) {
    items.push({ url, timestamp });
  }
  query.finalize();

  return items;
}

export function requestFromCache(config: Config, url: string, column: string) {
  const stmt = config.db.prepare(
    `SELECT url, content, parent, timestamp FROM request_cache WHERE ${column} = :url`,
  );
  const row = stmt.get<{
    url: string;
    content: string;
    parent: string;
    timestamp: number;
  }>({ url });
  stmt.finalize();

  return row;
}

export function updateCache(db: Database, data: DbCache) {
  try {
    db.exec(
      "REPLACE INTO request_cache VALUES(?,?,?,?)",
      ...data,
    );
  } catch (err) {
    console.error(err);
  }
}

export function cacheFetchAll<T>(config: Config, url: string): Promise<T[]> {
  return recursiveDbCacheFetch<T>(url, [], config, true);
}

async function recursiveDbCacheFetch<T>(
  url: string,
  results: T[],
  config: Config,
  initialPage?: boolean,
): Promise<T[]> {
  const column = initialPage ? "url" : "parent";
  const row = requestFromCache(config, url, column);
  const apiFetch = async () => {
    try {
      await fetchNewDataFromAPIandStore(config, url, results);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "HttpError" && err.message === "Bad credentials") {
          // clear out old stored credentials
          removeConfig(config.db, "access_token");

          console.error("recursiveDbCacheFetchError:", {
            name: err.name,
            message: err.message,
          });
        }
      } else {
        console.error("Unknown error", err);
      }
    }
  };

  if (row) {
    console.warn("Cache data found for:", row.url);
    const lastChecked = row.timestamp;
    const data = JSON.parse(row.content);

    // This is the initial request and the data looks stale
    if (initialPage && lastChecked < config.invalidateCacheDate) {
      console.warn("We should fetch some new data! as this is OLD");

      // clear any stale data
      cleanCache(config.db, config.invalidateCacheDate);

      // fetch fresh data from the API
      await apiFetch();
    } else {
      // store the data found
      results.push(...(Array.isArray(data) ? data : [data]));

      // continue to fetch the next page
      return recursiveDbCacheFetch<T>(row.url, results, config);
    }
  } else {
    if (initialPage) {
      console.warn("Empty data cache! Initiating API fetch...");

      // fetch fresh data from the API
      await apiFetch();
    }
  }

  return Promise.resolve(results);
}
