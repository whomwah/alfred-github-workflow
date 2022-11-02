import "./alfred.d.ts";
import Builder, { BuildItem, loginCommands } from "./helpers/builder.ts";
import { Config } from "./helpers/config.ts";
import { cacheItems } from "./helpers/cache.ts";
import { mapCacheItemToItem } from "./helpers/mapping.ts";
import { hasCustomSrcPath } from "./helpers/url.ts";
import { updateAvailableItem } from "./helpers/updateAvailable.ts";
import { QueryArgs } from "./helpers/query.ts";
import { capitalize } from "./helpers/utils.ts";

export default function Setting(
  queryArgs: QueryArgs,
  listItems: Alfred.Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const prefix = queryArgs.prefix;
  const isCache = queryArgs.action === "clear";

  const commands = async () => {
    if (!config.token) return loginCommands(queryArgs, builder);

    await Promise.all([
      updateAvailableItem(builder, config),
      isCache ? cacheItems() : results(),
      hasCustomSrcPath() ? builder.addItem(openSrcItem) : null,
    ]);

    return fallback();
  };

  const cacheItems = () => {
    const items = _internals.fetchCacheItems(config);

    const cmd: BuildItem = {
      matchStr: `${prefix} ${queryArgs.action} all data`,
      title: `${capitalize(queryArgs.action)} all data`,
      subtitle: "Deletes the whole cache (forces fresh data to be fetched)",
      arg: "###cache_delete###",
      icon: "delete",
    };

    return Promise.all([
      ...items.map((cmd) =>
        builder.addItem(mapCacheItemToItem(cmd, queryArgs))
      ),
      builder.addItem(cmd),
    ]);
  };

  const fallback = () => builder.addItem(helpItem);

  const helpItem: BuildItem = {
    matchStr: `${prefix} help`,
    title: "Help",
    subtitle: "View the README",
    arg: `${config.baseUrl}/whomwah/alfred-github-workflow/blob/main/README.md`,
    icon: "help",
    skipUID: true,
    skipMatch: true,
  };

  const openSrcItem: BuildItem = {
    matchStr: `${prefix} source`,
    title: "Source folder",
    subtitle: "Open workflow src folder",
    arg: "###workflow_open###",
    icon: "book",
  };

  const results = () => {
    const cmds: BuildItem[] = [
      {
        matchStr: `${prefix} logout`,
        title: "Logout",
        subtitle: "Log out this workflow",
        arg: `###logout###`,
        icon: "logout",
      },
      {
        matchStr: `${prefix} delete database`,
        title: "Delete database",
        subtitle: "Delete ALL data (includes login, config and cache)",
        arg: "###database_delete###",
        icon: "delete",
      },
      {
        matchStr: `${prefix} clear `,
        title: "Clear",
        subtitle: "Clear local cache data",
        icon: "delete",
        valid: false,
      },
      {
        matchStr: `${prefix} check`,
        title: "Check",
        subtitle: "Check for an update to the workflow",
        arg: `###update_available###`,
        icon: "refresh",
      },
    ];

    return Promise.all(cmds.map((cmd) => builder.addItem(cmd)));
  };

  return commands();
}

const fetchCacheItems = (config: Config) => cacheItems(config.db);

export const _internals = { fetchCacheItems };
