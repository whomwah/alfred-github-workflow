import { DB } from "../../deps.ts";
import { Config, removeConfig } from "./config.ts";
import { fetchNewDataFromAPIandStore } from "./github.ts";

const INVALIDATE_CACHE_DATE = new Date().getTime() - 1000 * 60 * 60 * 24 * 14; // 14 days

/**
 * [:url, :timestamp, :content, :parent]
 */
export type DbCache = [string, number, string, string | undefined];

export interface CacheItem {
  url: string;
  timestamp: number;
}

export function cleanCache(db: DB) {
  try {
    db.query("DELETE FROM request_cache WHERE timestamp < :time", {
      time: INVALIDATE_CACHE_DATE,
    });
  } catch (err) {
    console.error(err);
  }
}

export function deleteCache(db: DB, path?: string) {
  const query = path
    ? `DELETE FROM request_cache WHERE LIKE('%${path}?%',url)=1`
    : "DELETE FROM request_cache";
  try {
    db.query(query);
  } catch (err) {
    console.error(err);
  }
}

export function cacheItems(db: DB) {
  const items: CacheItem[] = [];

  const query = db.prepareQuery<[CacheItem["url"], CacheItem["timestamp"]]>(
    "SELECT url, timestamp FROM request_cache WHERE parent IS NULL",
  );

  for (const [url, timestamp] of query.iter()) {
    items.push({ url, timestamp });
  }
  query.finalize();

  return items;
}

export function requestFromCache(config: Config, url: string, column: string) {
  const stmt = config.db.prepareQuery<
    [string, string, string, number],
    {
      url: string;
      content: string;
      parent: string;
      timestamp: number;
    },
    { url: string }
  >(
    `SELECT url, content, parent, timestamp FROM request_cache WHERE ${column} = :url`,
  );
  const row = stmt.firstEntry({ url });
  stmt.finalize();

  return row;
}

export function updateCache(db: DB, data: DbCache) {
  try {
    db.query(
      "REPLACE INTO request_cache VALUES(:url, :timestamp, :content, :parent)",
      data,
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
      if (err.name === "HttpError" && err.message === "Bad credentials") {
        // clear out old stored credentials
        removeConfig(config.db, "access_token");

        console.error("recursiveDbCacheFetchError:", {
          name: err.name,
          message: err.message,
        });
      }
    }
  };

  if (row) {
    console.warn("Cache data found for:", row.url);
    const lastChecked = new Date(row.timestamp).getTime();
    const data = JSON.parse(row.content);

    // This is the initial request and the data looks stale
    if (initialPage && lastChecked < INVALIDATE_CACHE_DATE) {
      console.warn("We should fetch some new data! as this is OLD");

      // clear any stale data
      cleanCache(config.db);

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
