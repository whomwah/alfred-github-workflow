import Builder, { BuildItem, loginCommands } from "./helpers/builder.ts";
import { Item } from "./item.ts";
import { Config } from "./helpers/config.ts";
import { QueryArgs } from "./helpers/query.ts";
import { cacheItems } from "./helpers/cache.ts";
import { mapCacheItemToItem } from "./helpers/mapping.ts";
import { hasCustomSrcPath } from "./helpers/url.ts";
import { updateAvailableItem } from "./helpers/updateAvailable.ts";

export default function Setting(
  queryArgs: QueryArgs,
  listItems: Item[],
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
      hasCustomSrcPath() ? builder.addItem(openSrcItem()) : null,
    ]);

    return fallback();
  };

  const cacheItems = () => {
    const items = _internals.fetchCacheItems(config);

    const cmd = {
      title: `${prefix} ${queryArgs.action} all data`,
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

  const fallback = () => builder.addItem(helpItem());

  const helpItem = (): BuildItem => ({
    title: `${prefix} help`,
    subtitle: "View the README",
    arg: `${config.baseUrl}/whomwah/alfred-github-workflow/blob/main/README.md`,
    icon: "help",
    skipUID: true,
    skipMatch: true,
  });

  const openSrcItem = () => ({
    title: `${prefix} src`,
    subtitle: "Open workflow src folder",
    arg: "###workflow_open###",
    icon: "book",
  });

  const results = () => {
    const cmds = [
      {
        title: `${prefix} logout`,
        subtitle: "Log out this workflow",
        arg: `###logout###`,
        icon: "logout",
      },
      {
        title: `${prefix} delete database`,
        subtitle: "Delete ALL data (includes login, config and cache)",
        arg: "###database_delete###",
        icon: "delete",
      },
      {
        title: `${prefix} clear`,
        subtitle: "Clear local cache data",
        icon: "delete",
        valid: false,
      },
      {
        title: `${prefix} check`,
        subtitle: "Check for newer available versions of the workflow",
        arg:
          `###workflow_updates###${config.baseUrl}/whomwah/alfred-github-workflow/releases`,
        icon: "refresh",
      },
    ];

    return Promise.all(cmds.map((cmd) => builder.addItem(cmd)));
  };

  return commands();
}

const fetchCacheItems = (config: Config) => cacheItems(config.db);

export const _internals = { fetchCacheItems };
