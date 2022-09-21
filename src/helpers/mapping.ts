import { GhRepo, GhUser } from "./github.ts";

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
