import { DB, serve, ServeInit } from "../deps.ts";
import { storeConfig } from "./helpers/config.ts";
import { oops, thanks } from "./helpers/html.ts";

export async function startServer(db: DB, cb: (message: string) => void) {
  const serverOptions: ServeInit = { port: 2820 };
  serverOptions.onListen = () => null;

  function handler(req: Request): Response {
    const url = new URL(req.url);
    const params = url.searchParams;
    const access_token = params.get("access_token") || "";
    const error = params.get("error");

    // Send back the access code
    finishUp(access_token);

    // Close the server once the request has been sent to the browser
    setTimeout(() => {
      Deno.exit();
    }, 1000);

    let resp: Response;
    if (error || access_token === "") {
      resp = new Response(oops(params));
    } else {
      resp = new Response(thanks(access_token));
    }
    resp.headers.set("Content-Type", "text/html");

    return resp;
  }

  // Force close the server after 30 seconds to stop any future commands getting
  // blocked by a previous request. The user should have confirmed or denied by
  // now and if they haven't they can always try again.
  setTimeout(() => {
    cb(
      "Time out! 30 seconds has passed. Re-run 'gh > login' command to authenticate correctly.",
    );
    Deno.exit();
  }, 30000);

  function finishUp(token: string) {
    if (/[_0-9a-zA-Z\-]{20}/.test(token)) {
      storeConfig(db, "access_token", token);
      db.close();
      cb("Logged in successfully!");
    }
  }

  await serve(handler, serverOptions);
}
