import Builder, { loginCommands, searchGithub } from "../helpers/builder.ts";
import { mapRepoToItem, mapUserToItem } from "../helpers/mapping.ts";
import { QueryArgs } from "../helpers/query.ts";
import { Config } from "../helpers/config.ts";
import { cacheFetchAll } from "../helpers/cache.ts";
import { Item } from "./item.ts";
import { GhRepo, GhUser } from "../helpers/github.ts";

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
        name: "actions",
        label: "Show Github Actions",
        url: "actions",
        icon: "action",
      },
      {
        name: "admin",
        label: "Manage this repo",
        url: "settings",
        icon: "settings",
      },
      {
        name: "discussions",
        label: "Show discussions",
        url: "discussions",
        icon: "discussions",
      },
      {
        name: "issues",
        label: "List, show and create issues",
        url: "issues",
        icon: "issues",
      },
      {
        name: "milestones",
        label: "View milestones",
        url: "milestones",
        icon: "milestones",
      },
      {
        name: "network",
        label: "See the network",
        url: "network",
        icon: "network",
      },
      {
        name: "projects",
        label: "View projects",
        url: "projects",
        icon: "projects",
      },
      {
        name: "pulls",
        label: "Show open pull requests",
        url: "pulls",
        icon: "prs",
      },
      {
        name: "pulse",
        label: "See recent activity",
        url: "pulse",
        icon: "graph",
      },
      {
        name: "wiki",
        label: "Pull up the wiki",
        url: "actions",
        icon: "book",
      },
      {
        name: "commits",
        label: "View commit history",
        url: "commits",
        icon: "commits",
      },
      {
        name: "releases",
        label: "See latest releases",
        url: "releases",
        icon: "release",
      },
      {
        name: "contributors",
        label: "See all contributors",
        url: "graphs/contributors",
        icon: "users",
      },
    ];

    return Promise.all(cmds.map((key) => {
      builder.addItem({
        title: `${queryArgs.action} ${key.name}`,
        subtitle: key.label,
        arg: `${config.baseUrl}/${repoName}/${key.url}`,
        icon: key.icon,
      });
    }));
  };

  const fallback = () => builder.addItem(searchGithub(queryArgs, config));

  return commands();
}
