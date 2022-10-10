import { toIMF } from "../../deps.ts";
import { CacheItem } from "./cache.ts";
import { GhRepo, GHRoute, GhUser } from "./github.ts";
import { QueryArgs } from "./query.ts";

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

export function mapCacheItemToItem(item: CacheItem, queryArgs: QueryArgs) {
  const url = new URL(item.url);
  const label = GHRoute[url.pathname as keyof typeof GHRoute];
  const date = new Date(item.timestamp);

  return {
    title: `${queryArgs.prefix} ${queryArgs.action} ${label}`,
    subtitle: `last checked: ${toIMF(date)}`,
    arg: `###refresh_cache###${url.pathname}`,
    icon: "refresh",
  };
}
