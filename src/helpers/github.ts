import { updateCache } from "./cache.ts";
import { Config } from "./config.ts";

export enum GHRoute {
  "/user" = "your profile",
  "/user/repos" = "your repos",
  "/user/following" = "users you follow",
  "/user/starred" = "starred repos",
}

export interface GhUser {
  id: number;
  login: string;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: "User";
  site_admin: boolean;
}

export interface GhRepo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GhUser;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: "Ruby";
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url: string | null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: string | null;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean;
  topics: string[];
  visibility: "public" | "private";
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  permissions: GhPermission;
}

interface GhPermission {
  admin: boolean;
  maintain: boolean;
  push: boolean;
  triage: boolean;
  pull: boolean;
}

export async function fetchNewDataFromAPIandStore<T>(
  config: Config,
  url: string,
  results: T[],
  urlToStore?: string,
): Promise<void> {
  console.warn("fetchNewDataFromAPIandStore:", { url, urlToStore });
  const uri = new URL(url);
  const response = await fetch(uri, {
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "Authorization": `Bearer ${config.token}`,
    },
  });
  const data: T | T[] = await response.json();
  const linkMatch: RegExpMatchArray | null | undefined = response.headers.get(
    "Link",
  )?.match(
    /<([^>]+)>; rel="next"/,
  );

  if ([200, 304].includes(response.status)) {
    updateCache(config.db, [
      url,
      new Date().getTime(),
      JSON.stringify(data),
      urlToStore,
    ]);

    results.push(...(Array.isArray(data) ? data : [data]));

    if (linkMatch) {
      return fetchNewDataFromAPIandStore(config, linkMatch[1], results, url);
    }
  } else {
    console.warn("Invalid Github Response:", data);
  }
}
