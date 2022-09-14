import { Item } from "./item.ts";
import { QueryArgs } from "../helpers/query.ts";
import { Config } from "../helpers/config.ts";
import { cacheFetchAll } from "../helpers/cache.ts";
import Builder, { searchGithub } from "../helpers/builder.ts";
import { GhUser } from "../helpers/github.ts";

export default function Mine(
  queryArgs: QueryArgs,
  listItems: Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const prefix = queryArgs.prefix;
  const commands = () => {
    if (!config.token) return Promise.resolve();

    return user().then(() => fallback());
  };

  const user = async () => {
    // we expect an array of one
    const user = await fetchUser();

    return Promise.all([
      ...cmds(user[0]?.login).map((cmd) => builder.addItem(cmd)),
    ]);
  };

  const fetchUser = () => (
    cacheFetchAll<GhUser>(
      config,
      `${config.baseApiUrl}/user?per_page=${config.perPage}`,
    )
  );

  const cmds = (username: string | null) => {
    if (!username) return [];

    return [
      {
        title: `${prefix} stars`,
        subtitle: "View your stars",
        arg: `${config.baseUrl}/${username}?tab=stars`,
        icon: "stars",
      },
      {
        title: `${prefix} pull requests`,
        subtitle: "View your pull requests",
        arg: `${config.baseUrl}/pulls`,
        icon: "prs",
      },
      {
        title: `${prefix} gists`,
        subtitle: "View your gists",
        arg: `${config.baseGistUrl}/${username}`,
        icon: "gists",
      },
      {
        title: `${prefix} repos`,
        subtitle: "View your repositories",
        arg: `${config.baseUrl}/${username}?tab=repositories`,
        icon: "repos",
      },
      {
        title: `${prefix} issues`,
        subtitle: "View your issues",
        arg: `${config.baseUrl}/issues`,
        icon: "issues",
      },
      {
        title: `${prefix} profile`,
        subtitle: "View your public user profile",
        arg: `${config.baseUrl}/${username}`,
        icon: "profile",
      },
      {
        title: `${prefix} dashboard`,
        subtitle: `View your dashboard`,
        arg: config.baseUrl,
        icon: "dashboard",
      },
      {
        title: `${prefix} notifications`,
        subtitle: "View your notifications",
        arg: `${config.baseUrl}/notifications`,
        icon: "notifications",
      },
      {
        title: `${prefix} settings`,
        subtitle: "View and manage your settings",
        arg: `${config.baseUrl}/settings/profile`,
        icon: "settings",
      },
    ];
  };

  const fallback = () => builder.addItem(searchGithub(queryArgs, config));

  return commands();
}
