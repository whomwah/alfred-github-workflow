import "./alfred.d.ts";
import { dbConnect, init } from "./setup.ts";
import Setting from "./setting.ts";
import User from "./user.ts";
import Mine from "./mine.ts";
import Search from "./search.ts";
import { queryArgs } from "./helpers/query.ts";

export default async function Workflow(query: string) {
  const items: Alfred.Item[] = [];
  const db = await dbConnect();

  await init(db, async (config) => {
    switch (true) {
      case /^>([a-zA-Z0-9_\s]+)?$/.test(query):
        await Setting(queryArgs(query, ">"), items, config);
        break;
      case /^@([a-z-]+(\s+))?([a-z-]+)?$/.test(query):
        await User(queryArgs(query, "@"), items, config);
        break;
      case /^my([a-zA-Z0-9_\s]+)?$/.test(query):
        await Mine(queryArgs(query, "my"), items, config);
        break;
      default:
        await Search(queryArgs(query), items, config);
    }
  });
  db.close();

  return JSON.stringify({ items });
}
