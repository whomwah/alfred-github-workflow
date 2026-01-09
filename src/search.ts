import "./alfred.d.ts";
import Builder, {
  BuildItem,
  loginCommands,
  searchGithub,
} from "./helpers/builder.ts";
import { mapRepoToItem, mapUserToItem } from "./helpers/mapping.ts";
import { Config } from "./helpers/config.ts";
import { cacheFetchAll } from "./helpers/cache.ts";
import { GhRepo, GhUser } from "./helpers/github.ts";
import { updateAvailableItem } from "./helpers/updateAvailable.ts";
import { QueryArgs } from "./helpers/query.ts";

export default function Search(
  queryArgs: QueryArgs,
  listItems: Alfred.Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const repoName = queryArgs.action;
  const commands = async () => {
    if (!config.token) return loginCommands(queryArgs, builder);

    await Promise.all([
      updateAvailableItem(builder, config),
      queryArgs.isSubCmd ? subItems() : results(),
    ]);

    return await fallback();
  };

  const results = async () => {
    // Fetch all data sources in parallel for better performance
    const [repos, users, stars] = await Promise.all([
      _internals.fetchRepos(config),
      _internals.fetchUsers(config),
      _internals.fetchStars(config),
    ]);

    return Promise.all([
      ...subCommands.map((cmd) => builder.addItem(cmd)),
      ...repos.map((repo) => builder.addItem(mapRepoToItem(repo))),
      ...users.map((user) => builder.addItem(mapUserToItem(user))),
      ...stars.map((repo) => builder.addItem(mapRepoToItem(repo))),
    ]);
  };

  const subItems = () => {
    const cmds = [
      {
        title: `${queryArgs.action} actions`,
        subtitle: "Show Github Actions",
        arg: `${config.baseUrl}/${repoName}/actions`,
        icon: "action",
      },
      {
        title: `${queryArgs.action} admin`,
        subtitle: "Manage this repo",
        arg: `${config.baseUrl}/${repoName}/settings`,
        icon: "settings",
      },
      {
        title: `${queryArgs.action} discussions`,
        subtitle: "Show discussions",
        arg: `${config.baseUrl}/${repoName}/discussions`,
        icon: "discussions",
      },
      {
        title: `${queryArgs.action} pr new`,
        subtitle: "Create a new pull request",
        arg: `${config.baseUrl}/${repoName}/compare`,
        icon: "prs",
      },
      {
        title: `${queryArgs.action} issues`,
        subtitle: "List, show and create issues",
        arg: `${config.baseUrl}/${repoName}/issues`,
        icon: "issues",
      },
      {
        title: `${queryArgs.action} milestones`,
        subtitle: "View milestones",
        arg: `${config.baseUrl}/${repoName}/milestones`,
        icon: "milestones",
      },
      {
        title: `${queryArgs.action} network`,
        subtitle: "See the network",
        arg: `${config.baseUrl}/${repoName}/network`,
        icon: "network",
      },
      {
        title: `${queryArgs.action} projects`,
        subtitle: "View projects",
        arg: `${config.baseUrl}/${repoName}/projects`,
        icon: "projects",
      },
      {
        title: `${queryArgs.action} prs`,
        subtitle: "Show open pull requests",
        arg: `${config.baseUrl}/${repoName}/pulls`,
        icon: "prs",
      },
      {
        title: `${queryArgs.action} pulse`,
        subtitle: "See recent activity",
        arg: `${config.baseUrl}/${repoName}/pulse`,
        icon: "graph",
      },
      {
        title: `${queryArgs.action} wiki`,
        subtitle: "Pull up the wiki",
        arg: `${config.baseUrl}/${repoName}/actions`,
        icon: "book",
      },
      {
        title: `${queryArgs.action} security`,
        subtitle: "view security overview",
        arg: `${config.baseUrl}/${repoName}/security`,
        icon: "security",
      },
      {
        title: `${queryArgs.action} commits`,
        subtitle: "View commit history",
        arg: `${config.baseUrl}/${repoName}/commits`,
        icon: "commits",
      },
      {
        title: `${queryArgs.action} releases`,
        subtitle: "See latest releases",
        arg: `${config.baseUrl}/${repoName}/releases`,
        icon: "release",
      },
      {
        title: `${queryArgs.action} contributors`,
        subtitle: "See all contributors",
        arg: `${config.baseUrl}/${repoName}/graphs/contributors`,
        icon: "users",
      },
    ];

    return Promise.all(
      cmds.map((key) => {
        builder.addItem({
          title: key.title,
          subtitle: key.subtitle,
          arg: key.arg,
          icon: key.icon,
        });
      }),
    );
  };

  const subCommands: BuildItem[] = [
    {
      matchStr: "my ",
      title: "My ...",
      subtitle: "Pull requests, Repos, Setting etc...",
      icon: "forward",
    },
    {
      matchStr: "gists ",
      title: "Gists ...",
      subtitle: "View your Gists",
      icon: "forward",
    },
  ];

  const fallback = () => searchGithub(builder, queryArgs, config);

  return commands();
}

const fetchRepos = (config: Config) =>
  cacheFetchAll<GhRepo>(
    config,
    `${config.baseApiUrl}/user/repos?per_page=${config.perPage}`,
  );

const fetchUsers = (config: Config) =>
  cacheFetchAll<GhUser>(
    config,
    `${config.baseApiUrl}/user/following?per_page=${config.perPage}`,
  );

const fetchStars = (config: Config) =>
  cacheFetchAll<GhRepo>(
    config,
    `${config.baseApiUrl}/user/starred?per_page=${config.perPage}`,
  );

const fetchReleases = (config: Config) =>
  cacheFetchAll<GhRepo>(
    config,
    `${config.baseApiUrl}/releases?per_page=${config.perPage}`,
  );

export const _internals = { fetchRepos, fetchStars, fetchUsers, fetchReleases };
