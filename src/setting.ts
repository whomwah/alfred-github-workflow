import Builder, { loginCommands } from "./helpers/builder.ts";
import { Item } from "./item.ts";
import { Config } from "./helpers/config.ts";
import { QueryArgs } from "./helpers/query.ts";
import { cacheItems } from "./helpers/cache.ts";
import { mapCacheItemToItem } from "./helpers/mapping.ts";

export default function Setting(
  queryArgs: QueryArgs,
  listItems: Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const prefix = queryArgs.prefix;
  const isCache = queryArgs.action === "clear";

  const commands = () => {
    if (!config.token) return loginCommands(queryArgs, builder);

    return Promise.all([
      isCache ? cacheItems() : results(),
    ]).then(() => fallback());
  };

  const cacheItems = () => {
    const items = _internals.fetchCacheItems(config);

    const cmd = {
      title: `${prefix} ${queryArgs.action} all data`,
      subtitle: "Deletes cache (forces fresh data to be fetched)",
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

  const helpItem = () => ({
    title: `${prefix} help`,
    subtitle: "View the README",
    arg: `${config.baseUrl}/whomwah/alfred-github-workflow/blob/main/README.md`,
    icon: "help",
    skipUID: true,
    skipMatch: true,
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
        subtitle: "Delete all data (contains login, config and cache)",
        arg: "###database_delete###",
        icon: "delete",
      },
      {
        title: `${prefix} clear`,
        subtitle: "Clear local cache data",
        icon: "refresh",
        valid: false,
      },
    ];

    return Promise.all(cmds.map((cmd) => builder.addItem(cmd)));
  };

  return commands();
}

const fetchCacheItems = (config: Config) => cacheItems(config.db);

export const _internals = { fetchCacheItems };
