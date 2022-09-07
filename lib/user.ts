import { Item } from "./item.ts";

const User = {
  run: async (query: string, items: Item[]) => {
    await console.warn(`user: ${items}`);
    await console.warn(`user: ${query}`);
  },
};

export default User;
