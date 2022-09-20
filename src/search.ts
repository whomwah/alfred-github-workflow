import Builder, { loginCommands, searchGithub } from "./helpers/builder.ts";
import { mapRepoToItem, mapUserToItem } from "./helpers/mapping.ts";
import { QueryArgs } from "./helpers/query.ts";
import { Config } from "./helpers/config.ts";
import { cacheFetchAll } from "./helpers/cache.ts";
import { Item } from "./item.ts";
import { GhRepo, GhUser } from "./helpers/github.ts";

export default function Search(
  queryArgs: QueryArgs,
  listItems: Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const repoName = queryArgs.action;
  const commands = () => {
    if (!config.token) return loginCommands(queryArgs, builder);

    return Promise.all([
      queryArgs.isSubCmd ? subItems() : results(),
    ]).then(() => fallback());
  };

  const results = async () => {
    const repos = await fetchRepos();
    const users = await fetchUsers();
    const stars = await fetchStars();

    return Promise.all([
      ...repos.map((repo) => builder.addItem(mapRepoToItem(repo))),
      ...users.map((user) => builder.addItem(mapUserToItem(user))),
      ...stars.map((repo) => builder.addItem(mapRepoToItem(repo))),
    ]);
  };

  const fetchRepos = () => (
    cacheFetchAll<GhRepo>(
      config,
      `${config.baseApiUrl}/user/repos?per_page=${config.perPage}`,
    )
  );

  const fetchUsers = () => (
    cacheFetchAll<GhUser>(
      config,
      `${config.baseApiUrl}/user/following?per_page=${config.perPage}`,
    )
  );

  const fetchStars = () => (
    cacheFetchAll<GhRepo>(
      config,
      `${config.baseApiUrl}/user/starred?per_page=${config.perPage}`,
    )
  );

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

    return Promise.all(cmds.map((key) => {
      builder.addItem({
        title: key.title,
        subtitle: key.subtitle,
        arg: key.arg,
        icon: key.icon,
      });
    }));
  };

  const fallback = () => builder.addItem(searchGithub(queryArgs, config));

  return commands();
}