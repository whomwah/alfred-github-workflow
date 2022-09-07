import { Item, ItemMeta } from "../lib/item.ts";
import { createMd5Hash } from "./md5.ts";

const Builder = (items: Item[], prefix: string, action: string) => {
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

  const matches = (title: string) => title.includes(action);

  return {
    addItem: async (item: ItemMeta) => {
      if (matches(item.title)) addListItem(await buildListItem(item));
    },
  };
};

export default Builder;
