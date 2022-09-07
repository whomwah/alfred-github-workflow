import { Item } from "./item.ts";

const Search = {
  run: async (query: string, items: Item[]) => {
    await console.warn(`search: ${query}`);
    await console.warn(`search: ${items}`);
  },
};

export default Search;
