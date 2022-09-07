import Search from "./search.ts";
import Setting from "./setting.ts";
import User from "./user.ts";
import Mine from "./mine.ts";
import Repo from "./repo.ts";
import { Item } from "./item.ts";

export default async function Workflow(args: string[]) {
  const query = args[0];
  const items: Item[] = [];

  switch (true) {
    case /^>([a-z\s]+)?$/.test(query): {
      await Setting(query, items).run();
      break;
    }
    case /^@(\w*\s?\w+)?$/.test(query):
      await User.run(query, items);
      break;
    case /^my[a-z ]*$/.test(query):
      await Mine.run(query, items);
      break;
    case /^s\s?[\w@]*$/.test(query):
      await Search.run(query, items);
      break;
    default:
      await Repo.run(query, items);
  }

  return JSON.stringify({ items });
}
