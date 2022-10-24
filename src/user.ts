import "./alfred.d.ts";
import Builder, { searchGithub } from "./helpers/builder.ts";
import { mapUserToItem } from "./helpers/mapping.ts";
import { Config } from "./helpers/config.ts";
import { cacheFetchAll } from "./helpers/cache.ts";
import { GhUser } from "./helpers/github.ts";
import { updateAvailableItem } from "./helpers/updateAvailable.ts";
import { QueryArgs } from "./helpers/query.ts";

export default function User(
  queryArgs: QueryArgs,
  listItems: Alfred.Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const commands = async () => {
    if (!config.token) return Promise.resolve();

    await Promise.all([
      updateAvailableItem(builder, config),
      queryArgs.isSubCmd ? subItems() : users(),
    ]);

    return await fallback();
  };

  const users = async () => {
    const users = await _internals.fetchUsers(config);

    return Promise.all([
      ...users.map((user) => builder.addItem(mapUserToItem(user))),
    ]);
  };

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
        icon: "repos",
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

    return Promise.all(
      cmds.map((key) => {
        builder.addItem({
          title: `${queryArgs.prefix}${queryArgs.action} ${key.name}`,
          subtitle: `View ${queryArgs.action}'s ${key.name}`,
          arg: key.url,
          icon: key.icon,
        });
      }),
    );
  };

  const fallback = () => searchGithub(builder, queryArgs, config);

  return commands();
}

const fetchUsers = (config: Config) =>
  cacheFetchAll<GhUser>(
    config,
    `${config.baseApiUrl}/user/following?per_page=${config.perPage}`,
  );

export const _internals = { fetchUsers };
