// @ts-check
/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { serve, ServeInit } from "https://deno.land/std@0.155.0/http/server.ts";
import { oops, thanks } from "./helpers/html.ts";

self.onmessage = async (e: MessageEvent) => {
  const serverOptions: ServeInit = e.data;
  serverOptions.onListen = () => null;

  function handler(req: Request): Response {
    const url = new URL(req.url);
    const params = url.searchParams;
    const access_token = params.get("access_token") || "";
    const error = params.get("error");

    // Send back the access code
    self.postMessage(access_token);

    // Close the server once the request has been sent to the browser
    setTimeout(() => {
      self.close();
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

  // Force close the worker after 30 seconds as a backup to stop any future commands
  // get blocked by a previous request. The user should have confirmed or denied by
  // now and if they haven't they can always try again.
  setTimeout(() => {
    self.postMessage("Closing auth server as 30 seconds has passed.");
    self.close();
  }, 30000);

  await serve(handler, serverOptions);
};
