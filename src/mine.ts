import "./alfred.d.ts";
import { Config } from "./helpers/config.ts";
import { cacheFetchAll } from "./helpers/cache.ts";
import Builder, { BuildItem, searchGithub } from "./helpers/builder.ts";
import { GhUser } from "./helpers/github.ts";
import { updateAvailableItem } from "./helpers/updateAvailable.ts";
import { QueryArgs } from "./helpers/query.ts";

export default function Mine(
  queryArgs: QueryArgs,
  listItems: Alfred.Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const prefix = queryArgs.prefix;
  const commands = async () => {
    if (!config.token) return Promise.resolve();
    await Promise.all([updateAvailableItem(builder, config), user()]);

    return await fallback();
  };

  const user = async () => {
    // we expect an array of one
    const user = await _internals.fetchUser(config);

    return Promise.all([
      ...cmds(user[0]?.login).map((cmd) => builder.addItem(cmd)),
    ]);
  };

  const cmds = (username: string | null): BuildItem[] => {
    if (!username) return [];

    return [
      {
        matchStr: `${prefix} pull requests`,
        title: "Pull requests",
        subtitle: "View your pull requests",
        arg: `${config.baseUrl}/pulls`,
        icon: "prs",
      },
      {
        matchStr: `${prefix} gists`,
        title: "Gists",
        subtitle: "View your gists",
        arg: `${config.baseGistUrl}/${username}`,
        icon: "gists",
      },
      {
        matchStr: `${prefix} repos`,
        title: "Repos",
        subtitle: "View your repositories",
        arg: `${config.baseUrl}/${username}?tab=repositories`,
        icon: "repos",
      },
      {
        matchStr: `${prefix} repos new`,
        title: "Repos new",
        subtitle: "Create a new repository",
        arg: `${config.baseUrl}/new`,
        icon: "repos",
      },
      {
        matchStr: `${prefix} issues`,
        title: "Issues",
        subtitle: "View your issues",
        arg: `${config.baseUrl}/issues`,
        icon: "issues",
      },
      {
        matchStr: `${prefix} profile`,
        title: "Profile",
        subtitle: "View your public user profile",
        arg: `${config.baseUrl}/${username}`,
        icon: "profile",
      },
      {
        matchStr: `${prefix} dashboard`,
        title: "Dashboard",
        subtitle: `View your dashboard`,
        arg: config.baseUrl,
        icon: "dashboard",
      },
      {
        matchStr: `${prefix} stars`,
        title: "Stars",
        subtitle: "View your stars",
        arg: `${config.baseUrl}/${username}?tab=stars`,
        icon: "stars",
      },
      {
        matchStr: `${prefix} notifications`,
        title: "Notifications",
        subtitle: "View your notifications",
        arg: `${config.baseUrl}/notifications`,
        icon: "notifications",
      },
      {
        matchStr: `${prefix} keys`,
        title: "Keys",
        subtitle: "View and manage your SSH/GPG keys",
        arg: `${config.baseUrl}/settings/keys`,
        icon: "security",
      },
      {
        matchStr: `${prefix} settings`,
        title: "Settings",
        subtitle: "View and manage your settings",
        arg: `${config.baseUrl}/settings/profile`,
        icon: "settings",
      },
    ];
  };

  const fallback = () => searchGithub(builder, queryArgs, config);

  return commands();
}

const fetchUser = (config: Config) =>
  cacheFetchAll<GhUser>(
    config,
    `${config.baseApiUrl}/user?per_page=${config.perPage}`,
  );

export const _internals = { fetchUser };
