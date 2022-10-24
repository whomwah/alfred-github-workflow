import "../alfred.d.ts";
import { fuzzyMatch } from "./utils.ts";
import { createMd5Hash } from "./md5.ts";
import { Config } from "./config.ts";
import { OAUTH_URL } from "../../env.ts";
import { QueryArgs } from "./query.ts";

export interface BuildItem {
  title: string;
  subtitle?: string | null;
  icon?: string;
  arg?: string;
  valid?: boolean;
  autocomplete?: string | boolean;
  skipUID?: boolean;
  skipMatch?: boolean;
}

export interface BuilderType {
  addItem: (item: BuildItem) => Promise<void>;
}

export default function Builder(queryArgs: QueryArgs, items: Alfred.Item[]) {
  const buildListItem = async (item: BuildItem): Promise<Alfred.Item> => {
    const icon = {
      path: item.icon ? `./icons/${item.icon}.png` : "./icon.png",
    };
    const arg = item.arg || queryArgs.query;
    const payload: Alfred.Item = {
      title: item.title,
      valid: item.valid === false ? false : true,
      icon,
      arg,
    };

    if (!item.skipUID) payload.uid = await createMd5Hash(item.title);
    if (item.subtitle) payload.subtitle = item.subtitle;

    if (item.autocomplete === false) {
      // do nothing
    } else if (typeof item.autocomplete == "string") {
      payload.autocomplete = item.autocomplete;
    } else {
      payload.autocomplete = item.title;
    }

    return payload;
  };

  const addListItem = (item: Alfred.Item) => items.push(item);

  return {
    addItem: async (item: BuildItem) => {
      if (item.skipMatch || matches(item.title, queryArgs.query)) {
        addListItem(await buildListItem(item));
      }
    },
  };
}

export function searchGithub(
  builder: BuilderType,
  queryArgs: QueryArgs,
  config: Config,
) {
  const item: BuildItem = {
    title: `Search Github for '${queryArgs.query}'`,
    autocomplete: false,
    arg: `${config.baseUrl}/search?q=${queryArgs.query}`,
    skipUID: true,
    skipMatch: true,
  };

  return builder.addItem(item);
}

export function loginCommands(queryArgs: QueryArgs, builder: BuilderType) {
  // has the user provided a token in query?
  const providedToken = extractLoginToken(queryArgs.parts);
  const loginGenerateTokenCmd = () =>
    builder.addItem({
      title: `> login`,
      subtitle: "Generate OAuth access token",
      icon: "login",
      arg: `###login###${OAUTH_URL}`,
    });
  const loginSaveTokenCmd = (token: string, valid: boolean) =>
    builder.addItem({
      title: `> login ${token}`,
      subtitle: "Save access token",
      icon: "login",
      autocomplete: `> login `,
      arg: `###login_with_token###${token}`,
      valid,
    });

  return Promise.all(
    [
      providedToken ? null : loginGenerateTokenCmd(),
      providedToken
        ? loginSaveTokenCmd(providedToken, true)
        : loginSaveTokenCmd("<access_token>", false),
    ].filter((v) => v !== null),
  );
}

function extractLoginToken(parts: string[]) {
  if (parts.length === 2 && parts[0] === "login") {
    return parts[1];
  }
}

const matches = (title: string, action: string) => fuzzyMatch(title, action);
