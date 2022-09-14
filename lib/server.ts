import { DB } from "../deps.ts";
import { storeConfig } from "../helpers/config.ts";

export function startServer(db: DB, cb: (message: string) => void) {
  const worker = new Worker(
    new URL("./worker.ts", import.meta.url).href,
    {
      type: "module",
    },
  );

  worker.postMessage({
    port: 2820,
  });

  worker.addEventListener("message", (message) => {
    if (/[_0-9a-zA-Z\-]{20}/.test(message.data)) {
      const token = message.data;
      storeConfig(db, "access_token", token);
      db.close();
      cb("Logged in successfully!");
    }
  });
}
