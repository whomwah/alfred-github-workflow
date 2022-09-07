import { Item, ItemMeta } from "../lib/item.ts";
import fuzzyMatch from "./fuzzy.ts";
import { createMd5Hash } from "./md5.ts";

export default function Builder(items: Item[], prefix: string, action: string) {
  const addListItem = (item: Item) => {
    items.push(item);
  };

  const buildListItem = async (item: ItemMeta): Promise<Item> => {
    const icon = { path: "./icon.png" };
    const uid = await createMd5Hash(item.title);
    const arg = item.arg || `${prefix} ${item.title}`;

    return {
      uid,
      title: item.title,
      subtitle: item.subtitle,
      autocomplete: `${prefix} ${item.title}`,
      icon,
      arg,
    };
  };

  return {
    addItem: async (item: ItemMeta) => {
      if (matches(item.title, action)) addListItem(await buildListItem(item));
    },
  };
}

const matches = (title: string, action: string) => fuzzyMatch(title, action);
