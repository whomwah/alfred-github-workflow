import "./alfred.d.ts";
import { Config } from "./helpers/config.ts";
import { cacheFetchAll } from "./helpers/cache.ts";
import Builder, { searchGithub } from "./helpers/builder.ts";
import { GhGist } from "./helpers/github.ts";
import { updateAvailableItem } from "./helpers/updateAvailable.ts";
import { QueryArgs } from "./helpers/query.ts";
import { mapGistToItem } from "./helpers/mapping.ts";

export default function Gists(
  queryArgs: QueryArgs,
  listItems: Alfred.Item[],
  config: Config,
) {
  const items = listItems;
  const builder = Builder(queryArgs, items);
  const commands = async () => {
    if (!config.token) return Promise.resolve();
    await Promise.all([updateAvailableItem(builder, config), results()]);

    return await fallback();
  };

  const results = async () => {
    const gists = await _internals.fetchGists(config);

    return Promise.all([
      ...gists.map((gist) => builder.addItem(mapGistToItem(gist))),
    ]);
  };

  const fallback = () => searchGithub(builder, queryArgs, config);

  return commands();
}

const fetchGists = (config: Config) =>
  cacheFetchAll<GhGist>(
    config,
    `${config.baseApiUrl}/gists?per_page=${config.perPage}`,
  );

export const _internals = { fetchGists };
