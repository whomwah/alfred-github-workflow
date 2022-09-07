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

  // https://codereview.stackexchange.com/a/23905
  const fuzzy_match = (str: string, pattern: string) => {
    if (!pattern) return true;
    pattern = pattern.replace(/ /g, '').split("").reduce(function (a, b) { return a + ".*" + b; });
    return (new RegExp(pattern)).test(str);
  };

  const matches = (title: string) => fuzzy_match(title, action);

  return {
    addItem: async (item: ItemMeta) => {
      if (matches(item.title)) addListItem(await buildListItem(item));
    },
  };
};

export default Builder;
