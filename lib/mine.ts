import { Item } from "./item.ts";

const Mine = {
  run: async (query: string, items: Item[]) => {
    await console.warn(`mine search: ${query}`);
    await console.warn(`mine search: ${items}`);
  },
};

export default Mine;
