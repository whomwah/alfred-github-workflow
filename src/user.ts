import Builder, { searchGithub } from "./helpers/builder.ts";
import { mapUserToItem } from "./helpers/mapping.ts";
import { QueryArgs } from "./helpers/query.ts";
import { Config } from "./helpers/config.ts";
import { Item } from "./item.ts";
import { cacheFetchAll } from "./helpers/cache.ts";
import { GhUser } from "./helpers/github.ts";

export default function User(
  queryArgs: QueryArgs,
  listItems: Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const commands = () => {
    if (!config.token) return Promise.resolve();

    return Promise.all([
      queryArgs.isSubCmd ? subItems() : users(),
    ]).then(() => fallback());
  };

  const users = async () => {
    const users = await fetchUsers();

    return Promise.all([
      ...users.map((user) => builder.addItem(mapUserToItem(user))),
    ]);
  };

  const fetchUsers = () => (
    cacheFetchAll<GhUser>(
      config,
      `${config.baseApiUrl}/user/following?per_page=${config.perPage}`,
    )
  );

  const subItems = () => {
    const cmds = [
      {
        name: "overview",
        label: "overview",
        icon: "user",
        url: `${config.baseUrl}/${queryArgs.action}`,
      },
      {
        name: "repositories",
        label: "repositories",
        url: `${config.baseUrl}/${queryArgs.action}?tab=repositories`,
        icon: "action",
      },
      {
        name: "stars",
        label: "stars",
        url: `${config.baseUrl}/${queryArgs.action}?tab=stars`,
        icon: "stars",
      },
      {
        name: "gists",
        label: "gists",
        url: `${config.baseGistUrl}/${queryArgs.action}`,
        icon: "gists",
      },
    ];

    return Promise.all(cmds.map((key) => {
      builder.addItem({
        title: `${queryArgs.prefix}${queryArgs.action} ${key.name}`,
        subtitle: `View ${queryArgs.action}'s ${key.name}`,
        arg: key.url,
        icon: key.icon,
      });
    }));
  };

  const fallback = () => builder.addItem(searchGithub(queryArgs, config));

  return commands();
}
