import { Item } from "./item.ts";

const Repo = {
  run: async (query: string, items: Item[]) => {
    await console.warn(`repo search: ${query}`);
    await console.warn(`repo search: ${items}`);
  },
};

export default Repo;
