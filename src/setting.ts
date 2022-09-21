import Builder, { loginCommands } from "./helpers/builder.ts";
import { Item } from "./item.ts";
import { Config } from "./helpers/config.ts";
import { QueryArgs } from "./helpers/query.ts";

export default function Setting(
  queryArgs: QueryArgs,
  listItems: Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const prefix = queryArgs.prefix;

  const commands = () => {
    if (!config.token) return loginCommands(queryArgs, builder);

    const cmds = [
      {
        title: `${prefix} logout`,
        subtitle: "Log out this workflow",
        arg: `###logout###`,
        icon: "logout",
      },
      {
        title: `${prefix} delete cache`,
        subtitle: "Delete cache (forces fresh data to be fetched)",
        arg: "###cache_delete###",
        icon: "delete",
      },
      {
        title: `${prefix} delete database`,
        subtitle: "Delete all data (contains login, config and cache)",
        arg: "###database_delete###",
        icon: "delete",
      },
      {
        title: `${prefix} help`,
        subtitle: "View the README",
        arg:
          `${config.baseUrl}/whomwah/alfred-github-workflow/blob/main/README.md`,
        icon: "help",
        skipUID: true,
      },
    ];

    return Promise.all(cmds.map((cmd) => builder.addItem(cmd)));
  };

  return commands();
}
