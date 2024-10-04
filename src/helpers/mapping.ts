import { BuildItem } from "./builder.ts";
import { CacheItem } from "./cache.ts";
import { GhGist, GhRepo, GHRoute, GhUser } from "./github.ts";
import { QueryArgs } from "./query.ts";
import { capitalize } from "./utils.ts";

export function mapUserToItem(user: GhUser) {
  const prefix = "@";

  return {
    title: `${prefix}${user.login}`,
    subtitle: user.html_url,
    autocomplete: `${prefix}${user.login} `,
    icon: "user",
    arg: user.html_url,
  };
}

export function mapRepoToItem(repo: GhRepo) {
  return {
    title: repo.full_name,
    subtitle: repo.description || null,
    icon: repo.private ? "private-repo" : "repos",
    autocomplete: `${repo.full_name} `,
    arg: repo.html_url,
  };
}

export function mapGistToItem(gist: GhGist): BuildItem {
  const sanitizedTitle = gist.description
    .replace(/#\S+[ \t]*/g, "")
    .replace(/[\[|\]]/g, "")
    .trim();
  const lastUpdated = new Date(gist.updated_at);

  return {
    matchStr: `gists ${gist.description}`,
    title: sanitizedTitle === "" ? `No name! ${gist.id}` : sanitizedTitle,
    autocomplete: false,
    subtitle: `Last updated: ${lastUpdated.toUTCString()}`,
    icon: gist.public ? "gists" : "gists-private",
    arg: gist.html_url,
  };
}

export function mapCacheItemToItem(
  item: CacheItem,
  queryArgs: QueryArgs,
): BuildItem {
  const url = new URL(item.url);
  const label = GHRoute[url.pathname as keyof typeof GHRoute];
  const date = new Date(item.timestamp);

  return {
    matchStr: `${queryArgs.prefix} ${queryArgs.action} ${label}`,
    title: `${capitalize(queryArgs.action)} ${label}`,
    subtitle: `last checked: ${date.toString()}`,
    arg: `###refresh_cache###${url.pathname}`,
    icon: "refresh",
  };
}
