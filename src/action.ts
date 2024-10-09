import { dirname } from "@std/path";
import { deleteCache } from "./helpers/cache.ts";
import { removeConfig, storeConfig } from "./helpers/config.ts";
import { dbConnect, deleteDatabase } from "./setup.ts";
import { openPath, openUrlInBrowser } from "./helpers/url.ts";
import { log } from "./helpers/log.ts";

export default async function Action(query: string) {
  // In this case its up to the function being passed the
  // Database to close the connect when finished.
  const db = await dbConnect();
  const action = (name: string) => query.startsWith(name);

  switch (true) {
    // We want to generate a new auth token
    case action("###login###"): {
      await openUrlInBrowser(query.replace("###login###", ""));
      break;
    }
    // There was an issue with the token
    case action("@@@error@@@"): {
      const message = query.replace("@@@error@@@", "");
      log(`Oops! There was a problem: ${message}`);
      break;
    }
    // We want save our auth token
    case action("@@@token@@@"): {
      storeConfig(db, "access_token", query.replace("@@@token@@@", ""));
      db.close();
      log("Success! Your token has been saved. Enjoy this Alfred workflow.");
      break;
    }
    // We want to clear the current auth token set
    case action("###logout###"): {
      removeConfig(db, "access_token");
      db.close();
      log("Logged out successfully!");
      break;
    }
    // We want to delete the database
    case action("###database_delete###"): {
      await deleteDatabase(db);
      log("Database deleted successfully!");
      break;
    }
    // We want to delete the cache
    case action("###cache_delete###"): {
      deleteCache(db);
      db.close();
      log("Cache deleted successfully!");
      break;
    }
    // We want to clear a specific cache
    case action("###refresh_cache###"): {
      const path = query.replace("###refresh_cache###", "");
      deleteCache(db, path);
      db.close();
      log(`Cache for ${path} cleared!`);
      break;
    }
    // Attempt to download latest version
    case action("###update_available###"): {
      removeConfig(db, "latestVersion");
      removeConfig(db, "latestVersionLastChecked");
      db.close();
      log(query);
      break;
    }
    // We want to open the workflow src
    case action("###workflow_open###"): {
      const srcPath = Deno.env.get("INIT_FILE");
      if (srcPath) openPath(dirname(srcPath));
      break;
    }
    // Lets assume it's a url
    default:
      await openUrlInBrowser(query);
  }
}
