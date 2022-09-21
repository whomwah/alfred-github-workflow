import { deleteCache } from "./helpers/cache.ts";
import { removeConfig, storeConfig } from "./helpers/config.ts";
import { dbConnect, deleteDatabase } from "./setup.ts";
import { openUrlInBrowser } from "./helpers/url.ts";
import { log } from "./helpers/log.ts";
import { startServer } from "./server.ts";

export default async function Action(query: string) {
  // In this case its up to the function being passed the
  // DB to close the connect when finished.
  const db = await dbConnect();
  const action = (name: string) => query.startsWith(name);

  switch (true) {
    // We want to generate a new auth token
    case action("###login###"): {
      await openUrlInBrowser(query.replace("###login###", ""));
      startServer(db, (message: string) => log(message));
      break;
    }
    // We want add our own auth token
    case action("###login_with_token###"): {
      storeConfig(
        db,
        "access_token",
        query.replace("###login_with_token###", ""),
      );
      db.close();
      log("Added token successfully!");
      break;
    }
    // We want to clear the current auth token set
    case action("###logout###"): {
      removeConfig(db, "access_token");
      db.close();
      log("Logged out successfully!");
      break;
    }
    // We want to delete the cache
    case action("###cache_delete###"): {
      deleteCache(db);
      db.close();
      log("Cache deleted successfully!");
      break;
    }
    // We want to delete the database
    case action("###database_delete###"): {
      await deleteDatabase(db);
      log("Database deleted successfully!");
      break;
    }
    // Lets assume it's a url
    default:
      await openUrlInBrowser(query);
  }
}
